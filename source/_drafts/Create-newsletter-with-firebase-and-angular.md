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

Przydatne rozszerzenie do firestore dla vscode.
https://marketplace.visualstudio.com/items?itemName=ChFlick.firecode
https://firebase.google.com/docs/functions/schedule-functions
https://firebase.google.com/docs/firestore/solutions/role-based-access