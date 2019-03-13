---
title: How to run PIXI in Angular application
ampSettings:
  titleImage:
    path: title-image.png
tags:
- typescript
- PIXI
- angular
- ngZone
categories: []
date: 2019-02-11 17:39:00
thumbnail: title-image.png
author:
---
Run PIXI without performance problems.
<!-- more -->

![Angular and pixi.js 4](How-to-run-PIXI-in-angular-app/title-image.png)

Pixi.js version used: `4.8.6`

Angular detects any change due to Zone.js. If within the new component we add `setTimeout`,` setInterval` or `requestAnimationFrame` then Angular will detect the function's body call and trigger the change detection mechanism, which is the basis for the framework.

PIXI has its own Ticker inside which is responsible for canvas updates. It is based of course on the `requestAnimationFrame`.

If we normally start PIXI in a component, we will have a problem because the ticker will trigger the change detection mechanism every moment, which will cause problems for weaker devices or larger projects.

#### Wrong:

```typescript

import { OnInit, Component, ElementRef } from '@angular/core';
import { Application } from 'pixi.js';

@Component({
  selector: 'app-pixi',
  template: ''
})
export class PIXIComponent implements OnInit {
  public app: Application;
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnInit(): void {
    this.app = new Application({});
    this.elementRef.nativeElement.appendChild(this.app.view);
  }
}
```

The best solution to this problem is to run PIXI outside of Angular's zone.
Angular has a special service for these purposes `NgZone` and the` runOutsideAngular` method.

#### Good:

```typescript

import { OnInit, Component, ElementRef, NgZone } from '@angular/core';
import { Application } from 'pixi.js';

@Component({
  selector: 'app-pixi',
  template: ''
})
export class PIXIComponent implements OnInit {
  public app: Application;
  
  constructor(private elementRef: ElementRef, private ngZone: NgZone) {}
  
  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.app = new Application({});
    });
    this.elementRef.nativeElement.appendChild(this.app.view);
  }
}
```

Now the internal `requestAnimationFrame` will not be noticed by angular when the application is running.

Component example with change in canvas resolution and PIXI destruction:

```typescript
import { OnInit, Component, ElementRef, Input, HostListener, NgZone, OnDestroy } from '@angular/core';
import { Application, ApplicationOptions } from 'pixi.js';

@Component({
  selector: 'app-pixi',
  template: ''
})
export class PIXIComponent implements OnInit, OnDestroy {
  public app: Application;

  @Input()
  public devicePixelRatio = window.devicePixelRatio || 1;

  @Input()
  public applicationOptions: ApplicationOptions = {};

  constructor(private elementRef: ElementRef, private ngZone: NgZone) {}

  init() {
    this.ngZone.runOutsideAngular(() => {
      this.app = new Application(this.applicationOptions);
    });
    this.elementRef.nativeElement.appendChild(this.app.view);
    this.resize();
  }

  ngOnInit(): void {
    this.init();
  }

  @HostListener('window:resize')
  public resize() {
    const width = this.elementRef.nativeElement.offsetWidth;
    const height = this.elementRef.nativeElement.offsetHeight;
    const viewportScale = 1 / this.devicePixelRatio;
    this.app.renderer.resize(width * this.devicePixelRatio, height * this.devicePixelRatio);
    this.app.view.style.transform = `scale(${viewportScale})`;
    this.app.view.style.transformOrigin = `top left`;
  }

  destroy() {
    this.app.destroy();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

}
```