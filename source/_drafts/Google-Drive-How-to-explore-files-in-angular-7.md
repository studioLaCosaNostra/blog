---
title: 'Google Drive: How to explore files in angular 7'
ampSettings:
  titleImage:
    path: title-image.png
tags:
  - google drive
  - angular
  - google auth
  - typescript
thumbnail: title-image.png
date: 2019-06-11
---

Stworzenie komponentu do przeglądania plików z google drive może być trochę czasochłonne. Dlatego poniżej pokazuje jak to zrobić z użyciem Google API oraz dla ułatwienia tworzenia interfejsu użytkownika wykorzystam gotową angularową bibliotekę Material Design. Do autoryzacji google zostanie użyty kod z poprzedniego artykułu {% post_link How-to-make-Firebase-Authentication-via-Google-API-in-Angular How to make Firebase Authentication via Google API in Angular %} żeby nie wydłużać tekstu, polecam przeczytać go przed rozpoczęciem. Zawiera opis jak uzyskać klucze od Google API potrzebne do całej zabawy.

## Step 1: Create Angular project

1. Install Angular CLI.
   `npm install -g @angular/cli`
2. Create new angular project.
   `ng new google-drive-example`
3. Go to project directory.
   `cd google-drive-example`
4. Install the required dependencies.
   `npm install --save firebase @angular/fire`
   `npm install --save-dev @types/gapi @types/gapi.auth2 @types/gapi.client @types/gapi.client.drive`
