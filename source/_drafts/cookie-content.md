---
title: 'cookie content'
ampSettings:
  titleImage:
    path: null
tags:
thumbnail:
---

```bash
ng new cookie-consent
```

`package.json`

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

```bash
ng generate library @lacosanostra/ngx-cookie-consent
```

`projects/lacosanostra/ngx-cookie-conset/package.json`

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

```bash
rm ./src/app/app.component.ts ./src/app/app.component.spec.ts
```

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
