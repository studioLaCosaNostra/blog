---
title: How to make Firebase Authentication via Google API in Angular
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - firebase
  - google api
  - angular
thumbnail: title-image.png
date: 2019-05-16
---

This article is a simple guide on how to implement google api in angular and how to integrate a user session with a firebase service.

## Step 1: Create Angular project

1. Install Angular CLI.
   `npm install -g @angular/cli`
2. Create new angular project.
   `ng new firebase-auth-via-google-api-example`
3. Go to project directory.
   `cd firebase-auth-via-google-api-example`
4. Install the required dependencies.
   `npm install --save firebase @angular/fire`
   `npm install --save-dev @types/gapi @types/gapi.auth2 @types/gapi.client`

## Step 2: Create Firebase project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Create new project.

|||
| - | - |
| ![Firebase console: Projects dashboard view](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-projects-dashboard.png) | ![Firebase console: Add a project view](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-add-a-project.png) |
| ![Firebase console: Add a project view](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-add-a-project-2.png) | ![Firebase console: Add a project view - creating spinner](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-add-a-project-3.png) |

1. Enable Google sign-in in Authentication.

|||
| - | - |
| ![Firebase console: Add Google sign-in authentication - step 1](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-project-authentication.png) | ![Firebase console: Add Google sign-in authentication - step 2](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-project-authentication-2.png) |
| ![Firebase console: Add Google sign-in authentication - step 3](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-project-authentication-3.png) | ![Firebase console: Add Google sign-in authentication - step 4](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-project-authentication-4.png) |

1. Add a web app ![Firebase console: Project overview - Add a web app button](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-project-overview-create-web-app-button.png)

||||
| - | - | - |
| ![Firebase console: Add web app - step 1](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-project-overview.png) | ![Firebase console: Add web app - step 1](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-add-a-web-app.png) | ![Firebase console: Add web app - step 2](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-add-a-web-app-2.png) |

Copy firebase config to `src/environments/environment.ts`.

```typescript
export const environment = {
  ...
  firebase: {
    apiKey: "AIzaSyCq9YuvCvVkjdQrhm3hFTQboI2CV_SZnqI",
    authDomain: "api-example-e267d.firebaseapp.com",
    databaseURL: "https://api-example-e267d.firebaseio.com",
    projectId: "api-example-e267d",
    storageBucket: "api-example-e267d.appspot.com",
    messagingSenderId: "687667050591",
    appId: "1:687667050591:web:695d797c2e266a7c"
  }
};

```

## Step 3: Setup Google API project

- Go to [https://console.developers.google.com](https://console.developers.google.com)
- Navigate to project Credentials.

||||
| - | - | - |
| ![Google APIs console: Dashboard](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/google-apis-project-dashboard.png) | ![Google APIs console: Menu](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/google-apis-project-menu.png) | ![Google APIs console: Menu](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/google-apis-project-menu-2.png) |

- Open **OAuth 2.0 client IDs** - *Web client  (auto created by Google Service)*
  Add **[http://localhost:4200/](http://localhost:4200/)** to *Restrictions - Authorized Javascript origins*

||||
| - | - | - |
| ![Google APIs console: Credentials](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/google-apis-project-credentials.png) | ![Google APIs console: Credentials](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/google-apis-project-credentials-2.png) | ![Google APIs console: Credentials](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/google-apis-project-credentials-3.png) |

- Set email in OAuth consent screen.
  ![Google APIs console: Credentials - OAuth consent screen](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/google-apis-project-credentials-oauth-consent-screen.png)

- Copy client ID to `src/environments/environment.ts`

|||
| - | - |
| ![Google APIs console: Credentials - Client ID](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/google-apis-project-client-id.png) | ![Google APIs console: Credentials - Client ID](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/google-apis-project-client-id-2.png) |

```typescript
export const environment = {
  ...
  firebase: {
    apiKey: "AIzaSyCq9YuvCvVkjdQrhm3hFTQboI2CV_SZnqI",
    authDomain: "api-example-e267d.firebaseapp.com",
    databaseURL: "https://api-example-e267d.firebaseio.com",
    projectId: "api-example-e267d",
    storageBucket: "api-example-e267d.appspot.com",
    messagingSenderId: "687667050591",
    appId: "1:687667050591:web:695d797c2e266a7c",
    clientId: "687667050591-56og5jl7jah8ijg9ukft5ihbumacqash.apps.googleusercontent.com"
  }
};
```

## Step 4: Create the necessary services and components in angular project

- Go to angular project.
- Create Google API service.
  `ng generate service GAPI`
  Copy to `src/app/gapi.service.ts`

  ```typescript
  /// <reference path="../../node_modules/@types/gapi/index.d.ts" />
  /// <reference path="../../node_modules/@types/gapi.auth2/index.d.ts" />
  /// <reference path="../../node_modules/@types/gapi.client/index.d.ts" />

  import { Injectable } from '@angular/core';
  import { Observable, Observer } from 'rxjs';
  import { environment } from 'src/environments/environment';

  @Injectable({
    providedIn: 'root'
  })
  export class GAPIService {
    private readonly url: string = 'https://apis.google.com/js/api.js';
    private loaded = false;

    private loadGapi(): Observable<void> {
      return new Observable((observer: Observer<void>) => {
        if (this.loaded) {
          observer.next();
          observer.complete();
          return;
        }
        const node = document.createElement('script');
        node.src = this.url;
        node.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(node);
        node.onload = () => {
          this.loaded = true;
          observer.next();
          observer.complete();
        };
        node.onerror = (error) => {
          observer.error(error);
        };
      });
    }

    public async initClient(baseScopes: string[] = ['email']) {
      await this.loadGapi().toPromise();
      return new Promise<void>(async (resolve, reject) => {
        try {
          const initClient = async (error) => {
            if (error) {
              return reject(error);
            }
            try {
              await gapi.client.init({
                apiKey: environment.firebase.apiKey,
                clientId: environment.firebase.clientId,
                scope: baseScopes.join(' ')
              });
              return resolve();
            } catch (error) {
              return reject(error);
            }
          }
          gapi.load('client:auth2', initClient);
        } catch (error) {
          return reject(error);
        }
      });
    }
  }

  ```

- Create Google Authentication service.
  `ng generate service google-auth`
  Copy to `src/app/google-auth.service.ts`

  ```typescript
  import { Injectable, NgZone } from '@angular/core';
  import { AngularFireAuth } from '@angular/fire/auth';
  import { environment } from 'src/environments/environment';
  import { auth } from 'firebase/app';
  import { Observable, ReplaySubject } from 'rxjs';
  import { GAPIService } from './gapi.service';
  import * as firebase from 'firebase';

  @Injectable({
    providedIn: 'root'
  })
  export class GoogleAuthService {
    private isLoggedIn$ = new ReplaySubject<boolean>(1);
    private user$ = new ReplaySubject<firebase.User>(1)

    constructor(public afAuth: AngularFireAuth, public gapiService: GAPIService, private ngZone: NgZone) {
      this.isLoggedIn$.next(false);
      this.afAuth.auth.onAuthStateChanged(async (user) => {
        this.ngZone.run(() => {
          this.isLoggedIn$.next(Boolean(user));
          this.user$.next(user);
        })
      });
    }

    get isLoggedIn(): Observable<boolean> {
      return this.isLoggedIn$.asObservable();
    }

    get user(): Observable<firebase.User> {
      return this.user$.asObservable();
    }

    async signOut(): Promise<void> {
      return auth().signOut();
    }

    private async initAuth2(baseScopes: string[]): Promise<void> {
      await this.gapiService.initClient(baseScopes);
      if (!gapi.auth2.getAuthInstance()) {
        gapi.auth2.init({
          client_id: environment.firebase.clientId,
          scope: baseScopes.join(' ')
        });
      }
    }

    async signIn(baseScopes: string[] = ['email']): Promise<void> {
      await this.initAuth2(baseScopes);
      const googleUser = await gapi.auth2.getAuthInstance().signIn({
        prompt: 'select_account'
      });
      const token = googleUser.getAuthResponse().id_token;
      const credential = auth.GoogleAuthProvider.credential(token);
      await auth().signInAndRetrieveDataWithCredential(credential);
    }
  }

  ```

- Create login component.
  `ng generate component google-sign-in`
  Copy to `src/app/google-sign-in/google-sign-in.component.html`

  ```html
  <ng-container *ngIf="user$ | async as user; else loggedOut">
    <span>{{ user.displayName }}</span>
    <img class="user-photo" src="{{ user.photoURL }}">
    <a (click)="logout()">Logout</a>
  </ng-container>
  <ng-template #loggedOut>
    <a (click)="login()">Login</a>
  </ng-template>
  ```

  Copy to `src/app/google-sign-in/google-sign-in.component.ts`

  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { GoogleAuthService } from '../google-auth.service';
  import * as firebase from 'firebase';
  import { Observable } from 'rxjs';

  @Component({
    selector: 'app-google-sign-in',
    templateUrl: './google-sign-in.component.html',
    styleUrls: ['./google-sign-in.component.scss']
  })
  export class GoogleSignInComponent {
    user$: Observable<firebase.User>;

    constructor(
      private googleAuth: GoogleAuthService
    ) {
      this.user$ = this.googleAuth.user;
    }

    login() {
      this.googleAuth.signIn();
    }

    logout() {
      this.googleAuth.signOut();
    }

  }
  ```

- Add AngularFireModule and AngularFireAuthModule to `src/app/app.module.ts`

  ```typescript
  import { BrowserModule } from '@angular/platform-browser';
  import { NgModule } from '@angular/core';

  import { AppRoutingModule } from './app-routing.module';
  import { AppComponent } from './app.component';
  import { GoogleSignInComponent } from './google-sign-in/google-sign-in.component';
  import { AngularFireModule } from '@angular/fire';
  import { environment } from 'src/environments/environment';
  import { AngularFireAuthModule } from '@angular/fire/auth';

  @NgModule({
    declarations: [
      AppComponent,
      GoogleSignInComponent
    ],
    imports: [
      BrowserModule,
      AppRoutingModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireAuthModule
    ],
    providers: [],
    bootstrap: [AppComponent]
  })
  export class AppModule { }

  ```

  Add `<app-google-sign-in>` to `src/app/app.component.html`

  ```html
  <div style="text-align:center">
    <app-google-sign-in></app-google-sign-in>
  </div>
  ```

## Step 5: Test application authorization

- Start application.
  `npm run start`

- Go to [http://localhost:4200/](http://localhost:4200/) and login via google account.

||||
| - | - | - |
| ![localhost:4200: Before login](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/localhost-4200-before-login.png) | ![Google Sign In pop-up](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/google-sign-in-pop-up.png) | ![localhost:4200: After login](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/localhost-4200-after-login.png) |

That's all, now you can extend the capabilities of the application with all the possibilities of google apis and firebase.

The repository of the entire example described in this article is on github.
[https://github.com/studioLaCosaNostra/firebase-auth-via-google-api-example](https://github.com/studioLaCosaNostra/firebase-auth-via-google-api-example)

If you have any problems in any of the steps of this guide, please write in a comment about it.
I will try to write back and refine the article. :)
