---
title: How to integrate Paypal payments with Angular and Firebase
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - paypal
  - angular
  - firebase
thumbnail: title-image.png
---

# Stwórz nową aplikację w paypal developer

## Rejestracja

Rozpoczynając przygodę Paypal-em musimy najpierw utworzyć konto sandboxowe. Można to zrobić wchodząc na stronę https://developer.paypal.com/

![Developer paypal.com](developer-paypal-com.png)

Szukamy w menu przycisku **Login into Dashboard**

![Login into Dashboard](login-into-dashboard-developer-paypal-com.png)

Logujemy się naszym kontem użytkownika, który później będzie otrzymywał pieniążki za zamówione w naszej aplikacji.

![Signin form](signin-form.png)

Po zalogowaniu musimy utworzyć nowe REST API dla naszej aplikacji.
Klikamy w `Create App`

![REST API Apps list](developer-applications-rest-api-apps-list.png)

Wpisujemy nazwę dla naszej aplikacji i klikamy **Create App**

![Create new app form](create-new-app-developer-applications.png)

Po utworzeniu aplikacji jesteśmy przekierowani do widoku gdzie mamy wszystkie dane potrzebne do dalszej integracji i testowania.
Teraz musimy zapamiętać identyfikator klienta: **Client ID**

Client ID - `AZllhY1Qblkv7gaEIwF2zBdLYiyLLM9b8R51JoxFcDVwxOU5VNwzQXKWL3wpz2wLd4ioPBgyc12MJ3yJ`

![App view - developer paypal](developer-paypal-application-view.png)

# Przycisk płatności

![Paypal checkout](paypal-checkout.png)

## Stwórz paypal button

Generujemy w angularze paypal button.

```bash
ng generate component paypal-button -m app.module
```

Dodatkowo tworzymy `paypal.service.ts`, który będzie zawierał całą logikę Paypal SDK

```bash
ng generate service paypal-button/paypal
```

`paypal.service.ts`

```typescript
import * as firebase from 'firebase/app';
import * as loadJS from 'load-js';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaypalEnvironment } from 'functions/src/enums/paypal-environment';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { paypalTransactionCompleteURL } from '../constants';

declare const paypal: any;

export enum CurrencyCode {
  USD = 'USD',
  PLN = 'PLN',
}

export interface PurchaseDetails {
  environment: PaypalEnvironment;
  description: string;
  custom_id: string;
  name: string;
  currencyCode: CurrencyCode;
  value: string;
}

const logEvent = async (
  eventName: string,
  eventParams?: { [key: string]: string }
) => {
  if (environment.production) {
    await import('firebase/analytics');
    firebase.analytics().logEvent(eventName, eventParams);
  }
};

@Injectable()
export class PaypalService {
  private details: PurchaseDetails;
  constructor(private http: HttpClient, private router: Router) {}

  loadSDK() {
    const { clientId } = environment.paypalConfig;
    return loadJS({
      url: `https://www.paypal.com/sdk/js?client-id=${clientId}`,
    });
  }

  setDetails(details: PurchaseDetails) {
    this.details = details;
  }

  async renderButton(selector: HTMLElement | string) {
    await this.loadSDK();

    const button = paypal.Buttons({
      createOrder: (_, actions) => {
        const {
          description,
          custom_id,
          name,
          currencyCode,
          value,
        } = this.details;
        return actions.order.create({
          application_context: {
            shipping_preference: 'NO_SHIPPING',
          },
          purchase_units: [
            {
              description,
              custom_id,
              amount: {
                currency_code: currencyCode,
                value,
                breakdown: {
                  item_total: {
                    currency_code: currencyCode,
                    value,
                  },
                },
              },
              items: [
                {
                  name,
                  unit_amount: {
                    currency_code: currencyCode,
                    value,
                  },
                  quantity: '1',
                },
              ],
            },
          ],
        });
      },
      onApprove: (data: { orderID: string }, actions: any) => {
        return actions.order.capture().then(() => {
          this.http
            .post(paypalTransactionCompleteURL, {
              orderID: data.orderID,
              environment: this.details.environment,
            })
            .subscribe(() => {
              this.paymentCompleted(this.details);
            });
        });
      },
      onError: (error: any) => {
        logEvent('payment_error');
        console.error(error);
      },
      onCancel: () => {
        logEvent('payment_cancel');
      },
    });
    button.render(selector);
    return button;
  }

  paymentCompleted(details: PurchaseDetails) {
    logEvent('payment_completed', {
      value: details.value,
    });
    this.router.navigate(['/newsletters', details.custom_id, 'settings']);
  }
}
```

Service odpowiada za:
- Ładowanie Paypal SDK 
- Renderowanie przycisku płatności
- Wysyłanie powiadomienia do backendu po zakończonej płatności
- Przekierowania do ustawień newslettera po zakończeniu płatności
- Logowania zdarzeń przycisku płatności do Firebase Analytics

`paypal-button.component.html`

```html
<div class="button" #paymentButton></div>
```

`paypal-button.component.ts`

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CurrencyCode, PaypalService } from './paypal.service';

import { PaypalEnvironment } from 'functions/src/enums/paypal-environment';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payments-button',
  templateUrl: './payments-button.component.html',
  styleUrls: ['./payments-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PaypalService],
})
export class PaymentsButtonComponent implements OnInit, OnChanges, OnDestroy {
  private button: any;
  
  @Input() customId: string;
  @Input() name: string;
  @Input() description: string;
  @Input() value: string;
  @Input() currencyCode: CurrencyCode;

  @ViewChild('paymentButton', { static: true }) paymentButton: ElementRef;

  constructor(private paypalService: PaypalService) {}

  validInputs() {
    return [
      this.customId,
      this.name,
      this.description,
      this.value,
      this.currencyCode,
    ].every((value: string) => value !== undefined);
  }

  setDetails() {
    if (!this.validInputs()) {
      throw new Error('app-payments-button: missing inputs');
    }
    const details = {
      custom_id: this.customId,
      description: this.description,
      value: this.value,
      environment: environment.production
        ? PaypalEnvironment.Live
        : PaypalEnvironment.Sandbox,
      name: this.name,
      currencyCode: this.currencyCode,
    };
    this.paypalService.setDetails(details);
  }

  ngOnChanges() {
    this.setDetails();
  }

  async ngOnInit() {
    this.button = await this.paypalService.renderButton(
      this.paymentButton.nativeElement
    );
  }

  ngOnDestroy() {
    this.button.close();
  }
}
```
# Zweryfikuj zakończoną tranzakcję

`paypal-v1.ts`

```typescript
import * as checkoutSDK from '@paypal/checkout-server-sdk'
import * as express from 'express';
import * as functions from 'firebase-functions';
import * as paypalSDK from 'paypal-rest-sdk';

import { PaypalEnvironment } from "../enums/paypal-environment";
import { PaypalOrderConfirmationSource } from './paypal-v1/paypal-order-confirmation-source.enum';
import { client } from './paypal-v1/client';
import { corsWhitelist } from './paypal-v1/cors-whitelist';
import { processOrder } from './paypal-v1/process-order';

export const paypalV1 = express();

const transactionComplete = '/transaction-complete';
paypalV1.options(transactionComplete, corsWhitelist);
paypalV1.get(transactionComplete, corsWhitelist, (_, response) => {
  response.send('OPTIONS: POST');
})
paypalV1.post(transactionComplete, corsWhitelist, async (request, response) => {
  const orderID: string = request.body.orderID;
  const environment: PaypalEnvironment = request.body.environment;

  if (!orderID) {
    return response.status(400).send(`The order id is missing.`);
  }

  if (!environment) {
    return response.status(400).send(`The environment is missing.`);
  }

  const orderRequest = new checkoutSDK.orders.OrdersGetRequest(orderID);
  try {
    const order = await client(environment, checkoutSDK.core).execute(orderRequest);
    await processOrder({
      source: PaypalOrderConfirmationSource.OrderCheck,
      environment,
      event: order.result
    });
    return response.status(200).send({
      status: 'OK'
    });
  } catch (error) {
    console.error(error);
    return response.status(500);
  }
});
```

## Zapis do bazy



# Zapłacił ale internet padł i co teraz

## Webhooks i weryfikacja

## Rejestracja webhooka

