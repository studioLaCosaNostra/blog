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

Od samego początku projektowania należy myśleć, że nie tylko właściciel będzie chciał pracować nad newsletterem. Trzeba opracować kolekcję, która będzie przechowywać informacje, jaką rolę odgrywa w newsletterze dany użytkownik systemu. Dla ułatwienia mamy tylko trzy role: właściciel, administrator i członek. Każdy z nich ma różne prawa dostępu do kolekcji w systemie. Firestore pozwala na dostęp do bazy już na poziomie frontendu więc pewnie się zastanawiasz jak to zrobić skoro można odpytać bazę o każdy dokument i go zedytować. Zazwyczaj backend jest od chronienia i komunikacji bazy danych. Z pomocą przychodzi Firestore Seciurity Rules. Przy użyciu prostej składni podobnej do javascript mamy możliwość tworzenia zasad bezpieczeństwa. Ustalać kto ma jaki dostęp do danego zasobu na podstawie informacji znajdujących się w kolekcji ról użytkownika.

Kiedy już mamy system roli musimy ustalić jakie dane musimy mieć, aby funkcjonował nasz newsletter:

* *Ustawienia newslettera* — Uwierzytelnienia dla SMTP, opis pierwszej wiadomości dla potwierdzenia subskrypcji, dzienny limit wiadomości (niektóre usługi jak Gmail pozwalają tylko na określoną ilość przesłanych wiadomości dziennie). Do tych danych dostęp będą mieli tylko właściciel i administratorzy.

* *Newsletter* — Nazwa w systemie, adres e-mail, z którego wysyłamy wiadomości, informacja o błędach, jakie wystąpiły (np: źle skonfigurowane uwierzytelnienie SMTP), ilość subskrybentów, ilość wysłanych wiadomości. Poza tymi polami nasz dokument będzie zawierał w sobie dodatkowe kolekcje dokumentów (Firestore pozwala na zagnieżdżanie się w dokumencie kolekcji z kolejnymi dokumentami):
  * *Subskrybenci* - adres e-mail, czy potwierdził subskrybcję, data dodania i informacje jakie otrzymał wiadomości od nas od początku istnienia na liście. Tylko właściciel i administratorzy będą mieli wgląd do naszej listy.
  * *Subskrybenci internal* - Token potwierdzenia subskrybcji oraz anulowania jej. Te dane zostały specjalnie oddzielona od *Subskrybentów* ponieważ tylko tak możemy im nadać inne zasady bezpieczeństwa. W tym przypadku nikt nie ma dostępu poza cloud functions, które mają dostęp zawsze, ale o tym będzie później.
  * *Wiadomości* - Nazwa w systemie, Tytuł wiadomości, Treść wiadomości oraz autora tejże wiadomości. Wiadomość może edytować autor, właściciel i administratorzy. Odczytać może każdy kto posiada jakąś rolę w *newsletterze*.
  * *Dostawa* - Identyfikator *newslettera*, *wiadomość* do przesłania, status przesyłki, data utworzenia dostawy. Tylko właściciel i administratorzy mają możliwość wysyłać i odczytywać nasze dostawy.

Dodatkową kolekcją jaką jeszcze trzeba stworzyć to *zaproszenia*. Przecież nie każdy ma już konto w naszym systemie, trzeba go najpierw zaprosić e-mailem, a system musi wiedzieć że nowy użytkownik był wcześniej zaproszony do *newslettera* i przypisać mu nowe role.

* *Zaproszenia* - adres email, identyfikator *newslettera*, przyznana rola.

Wyczerpaliśmy już w pełni temat struktury naszej bazy czas przejść do tworzenia części backendowej.

## Firebase cloud functions - backend

Do obsługi subskrybentów musimy stworzyć REST API. Każdy newsletter musi mieć możliwość zapisania się na niego, wysłania potwierdzenia e-maila oraz wypisania się z niego jedym kliknięciem w każdym emailu jaki otrzyma. Cloud functions pozwalają tworzyć taki interfejsc przy użyciu popularnej biblioteki express.js, ostatecznie powstaną nam takie endpointy:

* /api/v1/subscribe - odpowiada za zapisywanie nowych subskrybentów.
* /api/v1/confirm - url z tego endpointu wysyłany jest podczas pierwszej wiadomości zaraz po zapisie do newslettera
* /api/v1/unsubscribe - url jest podawany w każdej wiadomości do subskrybenta, zazwyczaj na dole ale można to zmienić w ustawieniach newslettera

Z API to będzie już wszystko, dzięki temu że firestore daje nam możliwość pracy z bazą danych już po stronie frontendu nie mamy potrzeby tworzenia kolejnych endpointów odpowiedzialnych za poszczególne akcje w naszym systemie. Tylko skomplikowane operacje na bazie danych są wykonywane po stronie cloud functions. W naszym systemie mamy takie dwa przypadki:

* usunięcie newslettera - W Firestore usunięcie dokumentu nie usunie nam jego podkolekcji więc w takim przypadku musimy dostać się do każdego dokumentu podkolekcji i go usunąć, co jest bardzo skomplikowaną operacją i zalecane jest jej wykonanie po stronie backendu. Do tego celu wykorzystamy *Http Callable Functions* Jest to wariancja zapytań http ale z ułatwioną identyfikacją użytkownika.
* zmiana nazwy newslettera - Dla usprawnienia działania aplikacji, nazwa newslettera nie tylko znajduje się w dokumencie newslettera, ale także przypisana jest do każdej ról użytkowników co pozwala łatwo ją póżniej wyświetlić w aplikacji webowej.

Zmiając ustawienia newslettera mamy opcję ustalania dziennego limitu wysłanych wiadomości, musimy obserwować jego zmianę. Firestore posiada funkcję uruchamiania kodu cloud functions podczas edycji konkrentego dokumentu z kolekcji, pozwala nam ona zaktualizować pozostały przydział na ten konkretny dzień.
Wysyłając nasz wiadomość nasz system dostawy musi oznaczyć w każdym użytkowniku informację czy została do niego wysłana ta konkretna wiadomość, bez tej operacji nie jest możliwe tworzenie późniejszych zapytań do bazy o użytkowników oczekujących na wysłanie wiadomości.
Nowo zarejestrowanemu użytkownikowi musimy też za pomocą kodu backendowego znaleźć wszystkie zaproszenia jakie otrzymał i dodać nowe role do systemu.
Pewnie się zastanawiasz jak wysyłane są wiadomości przez nasz system, otóż robimy to dosyć prosto. Co godzinę uruchamiany jest kod backendu (cron jobs) który przeszukuje kolekcje newsletterów z nie zużytym limitem wiadomości i z flagą informującą czy oczekuje jakaś wiadomość do wysłania w kolekcji wysyłka. Przy użyciu biblioteki nodemailer system łączy się z usługą mailiongową i wysyła pokoleji wiadomości aż do skończenia się subskrybentów lub do dziennego limitu wiadomości.
Podobnie limity wiadomości są resetowane codziennie o godzinie 10.

Część backendową mamy już opisaną teraz czas przejść do frontendu :)

## Czym jest Angular?

