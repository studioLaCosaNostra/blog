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

## Czym jest Firebase?

Firebase jest to platforma deweloperska stworzona przez Firebase Inc w 2011, która została później wykupiona przez Google w 2014. Platforma jest głównie skupiona na stworzeniu ekosystemu ułatwiającego szybkie tworzenie dobrej jakości aplikacji mobilnych. W naszej aplikacji wykorzystamy tylko parę świadczonych przez nią usług:

1. Hosting - 1GB przestrzeni dyskowej na nasz projekt, 10GB darmowego transferu miesięcznie + automatycznie skonfigurowany certyfikat SSL. Plus dzięki firebase-cli wysyłamy nasz gotowy kod w parę sekund.
2. Uwierzytelnianie użytkownika — Wbudowany w platformę system rejestracji i logowania użytkownika z wielu usług jak Facebook, Twitter czy oczywiście Google. Wdrożenie jest bardzo proste i pozwala zaoszczędzić dużo czasu na tworzenie aplikacji, a nie systemu uwierzytaniającego.
3. Firestore — Elasytczna i skalowalna baza danych NoSQL, o której napiszę więcej później.
4. Firebase cloud functions — Usługa umożliwiająca tworzeniu kodu backendowego naszego projektu. Mamy pełen dostęp do obsługi zapytań Https, tworzenia wyzwalaczy dla zdarzeń z Firebase czy uwierzytelnień użytkownika, oraz kodu wykonywanego zgodnie z określonym interwałem czasowym.

## Firestore i ustalanie struktury bazy

Jak już się dowiedzieliśmy Firestore to wbudowana w platformę baza danych NoSQL, nie tworzymy tabelek i skomplikowanych selektorów jak to ma miejsce w bazach SQL. Tutaj bazujemy na kolekcjach dokumentów. Dokument jest zapisem zawierającym pola, które są odwzorowywane na wartości. Każdy dokument posiada identyfikator, po którym możemy się do niego odnieść. Dzięki kolekcjom możemy sortować nasze dokumenty według ich przeznaczenia, a następnie przy użyciu zapytań o odpowiednie pola wyciągać z nich interesujące nas dane.

Jakich kolekcji będzie potrzebować nasza aplikacja?

Od samego początku projektowania należy myśleć, że nie tylko właściciel newslettera będzie chciał pracować nad nim. Trzeba opracować kolekcję, która będzie przechowywać informacje o użytkowniku, jaką odgrywa rolę w newsletterze. Właściciel, administrator i członek. Każdy z nich ma różne prawa dostępu do kolekcji w systemie.

Kiedy już mamy system roli musimy ustalić jakie dane musimy mieć, aby funkcjonował nasz newsletter:

* Ustawienia newslettera — Uwierzytelnienia dla SMTP, opis pierwszej wiadomości dla potwierdzenia subskrypcji, dzienny limit wiadomości (niektóre usługi jak Gmail pozwalają tylko na określoną ilość przesłanych wiadomości dziennie).

* Newsletter — Nazwa, adres e-mail, z którego wysyłamy wiadomości, pole błędów, które mogą wystąpić, jeśli źle skonfigurujemy uwierzytelnienia SMTP, ilość subskrybentów, ilość wysłanych wiadomości. Poza tymi polami nasz dokument będzie zawierał w sobie dodatkowe kolekcje (Firestore pozwala na zagnieżdżanie się w dokumencie kolekcji z kolejnymi dokumentami):
  * ded
  * j

Dodatkowo stworzymy systemy kontroli dostępu, aby każdy użytkownik miał przypisaną rolę i odpowiednie dostępy.