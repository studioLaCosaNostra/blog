---
title: Angular async pipe does not work in the electron
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - angular
  - electron
thumbnail: title-image.png
date: 2019-04-02
---

Yesterday, creating a document scanning program I was very surprised why angular does not update the view.

```typescript
import { Component } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { DocumentScanner, IDocumentScannerDevice } from 'document-scanner';

@Component({
  selector: 'app-root',
  template: `
    <ul *ngIf="devices$ | async as devices">
      <li *ngFor="let device of devices">{{ device | json }}</li>
    </ul>
  `
})
export class AppComponent {
  devicesBehaviorSubject: BehaviorSubject<IDocumentScannerDevice[]> = new BehaviorSubject([]);
  devices$: Observable<IDocumentScannerDevice[]>;
  scanner: DocumentScanner;

  constructor() {
    this.devices$ = this.devicesBehaviorSubject.asObservable();
    this.scanner = new DocumentScanner();
    this.scanner.on('scannerDevices', (devices) => {
      console.log('scannerDevices', devices);
      this.devicesBehaviorSubject.next(devices);
    });
  }

  scan() {
    this.scanner.scan();
  }
}

```

`devicesBehaviorSubject` is updated correctly but unfortunately nothing appeared on the screen. :(

After several unsuccessful attempts, it turned out that angular does not see events from node.js `EventEmitter`. The simplest solution to this problem is to add ngZone.run inside `on` handler `this.scanner.on('scannerDevices', (devices) => {...})`

Working example:

```typescript
import { Component, NgZone } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { DocumentScanner, IDocumentScannerDevice } from 'document-scanner';

@Component({
  selector: 'app-root',
  template: `
    <ul *ngIf="devices$ | async as devices">
      <li *ngFor="let device of devices">{{ device | json }}</li>
    </ul>
  `
})
export class AppComponent {
  devicesBehaviorSubject: BehaviorSubject<IDocumentScannerDevice[]> = new BehaviorSubject([]);
  devices$: Observable<IDocumentScannerDevice[]>;
  scanner: DocumentScanner;

  constructor(private ngZone: NgZone) {
    this.devices$ = this.devicesBehaviorSubject.asObservable();
    this.scanner = new DocumentScanner();
    this.scanner.on('scannerDevices', (devices) => {
      console.log('scannerDevices', devices);
      this.ngZone.run(() => {
        this.devicesBehaviorSubject.next(devices);
      });
    });
  }

  scan() {
    this.scanner.scan();
  }
}

```

Now angular gets information about the new `scannerDevices` event.
