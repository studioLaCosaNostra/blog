---
title: 'Angular: Custom class decorator. Force OnInit, OnDestroy implementation.'
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - angular
  - decorators
  - typescript
  - CSS
thumbnail: title-image.png
date: 2019-02-18 15:59:24
---

There is a problem in Angular when we want to create decorators that want to use [lifecycle hooks][lifecycle-hooks]. The current view engine angular will not detect our implementation of ngOnInit or ngOnDestroy in AOT ([issue source][issue-16023]). The best solution to this is to force methods by checking the type when compiling the code. Typescript will check for us if we have everything we need in our component. Below is the code that adds the CSS class to the body of the document when the component starts.

`body-class.decorator.ts`

```typescript
import { OnDestroy, OnInit, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BodyClassModule } from './body-class.module';

interface BodyClassRequireOnInitAndOnDestroy extends OnInit, OnDestroy {
}

interface TFunction { 
  new(...args: any[]): BodyClassRequireOnInitAndOnDestroy;
}

export function BodyClass(klassList: string[]): <T extends TFunction>(constructor: T) => T {
  return function decorator<T extends TFunction>(constructor: T): T {
    return class extends constructor {
      private renderer: Renderer2;
      private document: any;

      ngOnInit(): void {
        this.document = BodyClassModule.injector.get(DOCUMENT);
        const rendererFactory: RendererFactory2 = BodyClassModule.injector.get(RendererFactory2);
        this.renderer = rendererFactory.createRenderer(null, null);

        const body: HTMLElement = this.document.body;
        if (body) {
          klassList.forEach((klass: string) => {
            this.renderer.addClass(body, klass);
          });
        }
        super.ngOnInit();
      }

      ngOnDestroy(): void {
        const body: HTMLElement = this.document.body;
        if (body) {
          klassList.forEach((klass: string) => {
            this.renderer.removeClass(body, klass);
          });
        }
        super.ngOnDestroy();
      }
    };
  };
}

```

`example.component.ts`

```typescript
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BodyClass } from './body-class.decorator';

@BodyClass(['test-class'])
@Component({
  selector: 'app-example',
  template: ``
})
export class ExampleComponent implements OnInit, OnDestroy {
  public ngOnInit(): void {

  }

  public ngOnDestroy(): void {

  }
}
```

If we do not create `ngOnInit ()`, `ngOnDestroy ()` in the component then we will get the following error when building the project:

```bash
Argument of type 'typeof ExampleComponent' is not assignable to parameter of type 'TFunction'.
  Type 'ExampleComponent' is missing the following properties from type 'BodyClassRequireOnInitAndOnDestroy': ngOnInit, ngOnDestroy
```

Another problem is getting into the angular injector, unfortunately we do not have this option in the decorator as in the normal component by the constructor. For this purpose, you can create a module that will provide us with an injector as a static field.

`body-class.module.ts`

```typescript
import { NgModule, Injector } from '@angular/core';

@NgModule({})
export class BodyClassModule {
  static injector: Injector;
  constructor(injector: Injector) {
    BodyClassModule.injector = injector;
  }
}

```

[lifecycle-hooks]: https://angular.io/guide/lifecycle-hooks
[issue-16023]: https://github.com/angular/angular/issues/16023