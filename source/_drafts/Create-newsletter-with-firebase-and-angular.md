---
title: Create newsletter with firebase and angular
ampSettings:
  titleImage:
    path: null
tags:
thumbnail:
---

E-mail marketing to jeden z najtańszych i najprostrzyszch sposobów, aby Twoja strona, sklep internetowa zdobyła powracających odbiorców. Jest to forma reklamy która trafia w najbardziej prywatne miejsce w sieci, jakim jest Twoja skrzynka pocztowa. Wyniki raportów z wielu kampanii na całym świecie pokazują że inwestycja w taką formę reklamy działa i odnosi sukces. Dlatego warto rozpocząć pracę nad Twoim newsletterem!

## Usługa newslettera

Jest wiele gotowych narzędzi do tworzenia kampanii e-mail marketingowych jak Mailchimp, Freshmail czy Getresponse. Ale w tym artykule poruszymy temat zbudowania od zera prostego systemu do zbierania adresów email od naszych klientów i wysyłania kampanii marketingowych. Wykorzystamy do tego celu platformę developerską **Firebase** oraz framework aplikacji webowych **Angular**.
Dodatkowo stworzymy systemy kontroli dostępu aby każdy użytkownik miał przypisaną rolę i odpowiednie dostępy.

1. Create newsletter project on firebase console.
2. Create repository on github.
3. Setup firebase in project

```bash
firebase login
firebase init
wybierz firestore, functions, hosting
```

```bash
npm install --save express body-parser
```

npm install firebase
ng add @ngrx/store
ng add @ngrx/effects
ng g module auth --route=auth --module app.module
ng g module newsletter-settings --route=newsletter/:id/settings --module app.module
ng add @angular/pwa --project newsletter-app
ngsw-config.json
```
  "dataGroups": [
    {
      "name": "api",
      "urls": ["/api"],
      "cacheConfig": {
        "maxSize": 0,
        "maxAge": "0u",
        "strategy": "freshness"
      }
    }
  ]
```

```ts
Unhandled error { Error: The query requires a COLLECTION_GROUP_ASC index for collection user-role and field newsletterId. You can create it here: https://console.firebase.google.com/v1/r/project/newsletter-f8570/firestore/indexes?create_exemption=Clxwcm9qZWN0cy9uZXdzbGV0dGVyLWY4NTcwL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy91c2VyLXJvbGUvZmllbGRzL25ld3NsZXR0ZXJJZBACGhAKDG5ld3NsZXR0ZXJJZBAB
    at Http2CallStream.call.on (/srv/node_modules/@grpc/grpc-js/build/src/call.js:68:41)
    at emitOne (events.js:121:20)
    at Http2CallStream.emit (events.js:211:7)
    at process.nextTick (/srv/node_modules/@grpc/grpc-js/build/src/call-stream.js:75:22)
    at _combinedTickCallback (internal/process/next_tick.js:132:7)
    at process._tickDomainCallback (internal/process/next_tick.js:219:9)
  code: 9,
  details: 'The query requires a COLLECTION_GROUP_ASC index for collection user-role and field newsletterId. You can create it here: https://console.firebase.google.com/v1/r/project/newsletter-f8570/firestore/indexes?create_exemption=Clxwcm9qZWN0cy9uZXdzbGV0dGVyLWY4NTcwL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy91c2VyLXJvbGUvZmllbGRzL25ld3NsZXR0ZXJJZBACGhAKDG5ld3NsZXR0ZXJJZBAB',
  metadata: Metadata { internalRepr: Map {}, options: {} } }
```

Przydatne rozszerzenie do firestore dla vscode.
[Firestore Security Rules Syntax Highlighting and Suggestions](https://marketplace.visualstudio.com/items?itemName=ChFlick.firecode)
[Schedule function](https://firebase.google.com/docs/functions/schedule-functions)
[Solutions role based access](https://firebase.google.com/docs/firestore/solutions/role-based-access)
