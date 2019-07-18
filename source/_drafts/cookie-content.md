---
title: 'cookie content'
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - angular
  - angular elements
  - web components
  - cookie
  - travis
  - npm
thumbnail: title-image.png
---

Below I am describing a step-by-step example of how to create libraries for reuse in Angular projects, but also thanks to Angular Elements they can be used outside of Angular. An example is my blog, where the basis is Hexo, and additional functions I write in Angular Elements and attach them to the project as ordinary HTML tags. The following steps show the creation of `cookie consent` which is visible on the blog page at the first entry.

## Create Angular Project

Create a new angular project in which all the codes and scripts of the project will be included.

```bash
ng new cookie-consent
```

Go inside of project.

```bash
cd cookie-consent
```

## Create library

Generate a library that you can use later in Angular projects.

```bash
ng generate library @lacosanostra/ngx-cookie-consent
```

Edit `package.json`

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build-web-component": "./build.sh",
    "build-ngx-cookie-consent": "ng build @lacosanostra/ngx-cookie-consent",
    "test": "ng test",
    "test-headless": "ng test --watch=false --browsers=ChromeHeadless",
    "lint": "ng lint",
    "e2e": "ng e2e"
  }
}
```

- `build-web-component` will generate the project as a web-component, the `build.sh` script will be given below.
- `build-ngx-cookie-consent` will build the Angular version of the component ready for publication in `npm`. The command is also needed for the `build-web-component` because it uses this library. While working on the new module, you can run it with the `watch` option, example:  `npm run build-ngx-cookie-consent -- --watch`
- `test-headless` was created for running tests in Travis

Edit `projects/lacosanostra/ngx-cookie-consent/package.json`

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

Adding `publishConfig` with `access: public` allows you to share the module publicly in `npm` as @organization. By default, `access` is set to `private`.

Edit `projects/lacosanostra/ngx-cookie-consent/src/lib/ngx-cookie-consent.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { NgxCookieConsentComponent } from './ngx-cookie-consent.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [NgxCookieConsentComponent],
  imports: [
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [NgxCookieConsentComponent]
})
export class NgxCookieConsentModule { }
```

We only add `MatIconModule`, `MatButtonModule` here. I use them on the closing button.

Edit `projects/lacosanostra/ngx-cookie-consent/src/lib/ngx-cookie-consent.component.ts`

```typescript
import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'lib-ngx-cookie-consent',
  template: `
    <div class="mat-typography cookie-consent-content">
      <ng-content></ng-content>
    </div>
    <button mat-icon-button aria-label="Close cookie consent" (click)="close()">
      <mat-icon>close</mat-icon>
    </button>
  `,
  styleUrls: ['./ngx-cookie-consent.component.scss']
})
export class NgxCookieConsentComponent implements OnInit {
  @HostBinding('class.visible') visible = false;
  private signature = 'cookie-consent-closed';

  public ngOnInit(): void {
    const isClosed = localStorage.getItem(this.signature) === 'true';
    if (!isClosed) {
      this.visible = true;
    }
  }

  public close(): void {
    localStorage.setItem(this.signature, 'true');
    this.visible = false;
  }

}
```

The main component of the entire project.

- `<ng-content>` the body content is loaded here. In this case it will be information about the use of cookie, for example: `This site uses cookies to analyze traffic, remember your preferences, and optimize your experience.`
- `<button>` A simple button to close our information after reading it. Usage can be seen in the methods of `ngOnInit()` where I check if I have to make a visible component on startup and `close()` which is triggered when the button is clicked. The event hides the component and updates the logical value in localStorage.

Edit `projects/lacosanostra/ngx-cookie-consent/src/lib/ngx-cookie-consent.component.scss`

```scss
:host {
  display: none;
  align-items: center;

  &.visible {
    display: flex;
  }
  
  .cookie-consent-content {
    flex-grow: 1;
  }
}
```

Styles needed for our element to look nice.

The library ready, our `lib-ngx-cookie-consent` can already be used in angular projects, just import the module. :) Now let's go to convert it to a web-component.

## Create web-component

Delete the unnecessary `app component` and its test.

```bash
rm ./src/app/app.component.ts ./src/app/app.component.spec.ts
```

Edit `src/app/app.module.ts`

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { NgxCookieConsentModule, NgxCookieConsentComponent } from '@lacosanostra/ngx-cookie-consent';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    NgxCookieConsentModule
  ],
  providers: [],
  entryComponents: [NgxCookieConsentComponent],
  bootstrap: []
})
export class AppModule {
  constructor(private injector: Injector) { }

  ngDoBootstrap() {
    const ngElement = createCustomElement(NgxCookieConsentComponent, {
      injector: this.injector
    });
    customElements.define('cookie-consent', ngElement);
  }
}
```

Now the only thing that the **AppModule** does is load the `NgxCookieConsentModule` module and register its component as `web-component`.

Edit `src/polyfills.ts`

```typescript
...
/***************************************************************************************************
 * APPLICATION IMPORTS
 */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';
```

This extra import adds us an adapter for custom elements in es5. Without it, we get errors when we running our web-component in the browser.

Edit `src/style.scss`

```scss
/* You can add global styles to this file, and also import other style files */
@import "~@angular/material/prebuilt-themes/indigo-pink.css";
```

Additional import of a sample theme for **Angular Material** components.

Edit `src/index.html`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CookieConsent</title>
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <style>
    cookie-consent {
      display: none;
    }
  </style>
</head>
<body>
  <cookie-consent>
    This site uses cookies to analyse traffic, remember your preferences, and optimise your experience.
    <a href="/policy">Learn more</a>
  </cookie-consent>
</body>
</html>
```

Now we can see how our web-component presents itself in the code on an ordinary website.  Additionally, for the close button it is required to import icons from Material Design.

```bash
#!/bin/bash
set -x
APP=cookie-consent
ng build $APP --prod --output-hashing=none && cat dist/$APP/runtime-es5.js dist/$APP/polyfills-es5.js dist/$APP/scripts.js dist/$APP/main-es5.js > dist/$APP/$APP.js
```

```yml
language: node_js

script:
  - set -e
  - npm run lint
  - npm run test-headless
  - npm run build-ngx-cookie-consent
  - npm run build-web-component
  - ./.travis-commit-changes.sh

before_deploy:
  - cd dist/lacosanostra/ngx-cookie-consent
deploy:
  provider: npm
  skip_cleanup: true
  email: $NPM_EMAIL
  api_key: $NPM_TOKEN

```

```bash
#!/bin/bash

set -x
# doc: https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html#The-Set-Builtin


function setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

function change_to_master_branch() {
  git stash
  git checkout master
  git pull
  git stash pop
}

function commit_changes() {
  git add -A
  # Create a new commit with a custom message
  # with "[skip ci]" to avoid a build loop
  # and Travis build number for reference
  git commit -m "Travis update ($TRAVIS_BUILD_NUMBER)" -m "[skip ci]"
  return $?
}

function push_changes() {
  # Add new "origin" with access token in the git URL for authentication
  git push https://${GH_TOKEN}@github.com/$TRAVIS_REPO_SLUG master
  return $?
}

setup_git

change_to_master_branch

commit_changes

# Attempt to commit to git only if "git commit" succeeded
if [ $? -ne 0 ]; then
  echo "Cannot commit new version"
  exit $?
fi

echo "Push to GitHub"
push_changes
```
