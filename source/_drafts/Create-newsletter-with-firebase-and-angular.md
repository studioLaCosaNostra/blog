---
title: Create newsletter with firebase and angular
ampSettings:
  titleImage:
    path: null
tags:
thumbnail:
---

E-mail marketing to jeden z najtańszych i najprostszych sposobów, aby Twoja strona, sklep internetowa zdobyła powracających odbiorców. Jest to forma reklamy, która trafia w najbardziej prywatne miejsce w sieci, jakim jest Twoja skrzynka pocztowa. Wyniki raportów z wielu kampanii na całym świecie pokazują, że inwestycja w taką formę reklamy działa i odnosi sukces. Dlatego warto rozpocząć pracę nad Twoim newsletterem!

Jest wiele gotowych narzędzi do tworzenia kampanii e-mail marketingowych jak Mailchimp, Freshmail czy Getresponse. Są to istne kombajny mające niekończący się wachlarz możliwości, ale w tym artykule nie będziemy opisywać ich możliwości. Tylko poruszymy temat zbudowania samemu od zera własnego mini systemu do wysyłki e-maili naszym subskrybentom. Wykorzystamy do tego celu platformę developerską **Firebase** oraz framework aplikacji webowych **Angular**.

Czym jest Firebase?

Firebase jest to platforma deweloperska stworzona przez Firebase Inc w 2011, która została później wykupiona przez Google w 2014. Platforma jest głównie skupiona na stworzeniu ekosystemu ułatwiającego szybkie tworzenie dobrej jakości aplikacji mobilnych. W naszej aplikacji wykorzystamy tylko parę ściadczonych przez nią usług:

1. Hosting - 1GB przestrzeni dyskowej na nasz projekt, 10GB darmowego transferu miesięcznie + automatycznie skonfigurowany certyfikat SSL. Plus dzięki firebase cli wysyłamy nasz gotowy kod w parę sekund.
2. Uwierzytelnianie użytkownika - Wbudowany w platformę system rejestracji i logowania użytkownika z wielu usług jak Facebook, Twitter czy oczywiście Google.
3. Firestore - Elasytczna i skalowalna baza danych NoSQL o której napiszę więcej później.
4. Firebase cloud functions - Usługa umożliwiająca tworzeniu kodu backendowego naszego projektu. Mamy pełen dostęp do obsługi zapytań HTTPS, tworzenia wyzwalaczy dla zdarzeń z Firebase czy uwierzytenień użytkownika, oraz kodu wykonywanego zgodnie z określonym interwałem czasowym.



Dodatkowo stworzymy systemy kontroli dostępu aby każdy użytkownik miał przypisaną rolę i odpowiednie dostępy.