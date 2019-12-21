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


# Zweryfikuj zakończoną tranzakcję

## Zapis do bazy

# Zapłacił ale internet padł i co teraz

## Webhooks i weryfikacja

## Rejestracja webhooka

