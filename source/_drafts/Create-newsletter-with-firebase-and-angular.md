---
title: Create newsletter with firebase and angular
ampSettings:
  titleImage:
    path: title-image.png
tags:
thumbnail: title-image.png
---

E-mail marketing to jeden z najtańszych i najprostszych sposobów, aby Twoja strona, sklep internetowa zdobyła powracających odbiorców. Jest to forma reklamy, która trafia w najbardziej prywatne miejsce w sieci, jakim jest Twoja skrzynka pocztowa. Wyniki raportów z wielu kampanii na całym świecie pokazują, że inwestycja w taką formę reklamy działa i odnosi sukces. Dlatego warto rozpocząć pracę nad Twoim newsletterem!

Jest wiele gotowych narzędzi do tworzenia kampanii e-mail marketingowych jak Mailchimp, Freshmail czy Getresponse. Są to istne kombajny mające niekończący się wachlarz możliwości, ale w tym artykule nie będziemy opisywać ich możliwości. Tylko poruszymy temat zbudowania samemu od zera własnego mini systemu do wysyłki e-maili naszym subskrybentom. Wykorzystamy do tego celu platformę developerską **Firebase** oraz framework aplikacji webowych **Angular**.

## Czym jest Firebase?

![Firebase logo](../Create-newsletter-with-firebase-and-angular/firebase-logo.png)

Firebase jest to platforma deweloperska stworzona przez Firebase Inc w 2011, która została później wykupiona przez Google w 2014. Platforma jest głównie skupiona na stworzeniu ekosystemu ułatwiającego szybkie tworzenie dobrej jakości aplikacji mobilnych. W naszej aplikacji wykorzystamy tylko parę świadczonych przez nią usług:

1. Hosting - 1GB przestrzeni dyskowej na nasz projekt, 10GB darmowego transferu miesięcznie + automatycznie skonfigurowany certyfikat SSL. Plus dzięki firebase-cli wysyłamy nasz gotowy kod w parę sekund.
2. Uwierzytelnianie użytkownika — Wbudowany w platformę system rejestracji i logowania użytkownika z wielu usług jak Facebook, Twitter czy oczywiście Google. Wdrożenie jest bardzo proste i pozwala zaoszczędzić dużo czasu na tworzenie aplikacji, a nie systemu uwierzytelniającego.
3. Firestore — Elasytczna i skalowalna baza danych NoSQL, o której napiszę więcej później.
4. Firebase cloud functions — Usługa umożliwiająca tworzeniu kodu backendowego naszego projektu. Mamy pełen dostęp do obsługi zapytań Https, tworzenia wyzwalaczy dla zdarzeń z Firebase czy uwierzytelnień użytkownika, oraz kodu wykonywanego zgodnie z określonym interwałem czasowym.

## Firestore i ustalanie struktury bazy

Jak już się dowiedzieliśmy Firestore to wbudowana w platformę baza danych NoSQL, nie tworzymy tabelek i skomplikowanych selektorów jak to ma miejsce w bazach SQL. Tutaj bazujemy na kolekcjach dokumentów. Dzięki kolekcjom możemy sortować nasze dokumenty według ich przeznaczenia, a następnie przy użyciu zapytań o odpowiednie pola wyciągać z nich interesujące nas dane. Dokument jest zapisem zawierającym pola, które są odwzorowywane na wartości. Każdy dokument posiada identyfikator, po którym możemy się do niego odnieść.

### Jakich kolekcji będzie potrzebować nasza aplikacja?

![firestore console view](../Create-newsletter-with-firebase-and-angular/firestore-console-view.png)

Od samego początku projektowania należy myśleć, że nie tylko właściciel będzie chciał pracować nad newsletterem. Trzeba opracować kolekcję, która będzie przechowywać informacje, jaką rolę odgrywa w newsletterze dany użytkownik systemu. Dla ułatwienia mamy tylko trzy role: właściciel, administrator i członek. Każdy z nich ma różne prawa dostępu do kolekcji w systemie. Firestore pozwala na dostęp do bazy już na poziomie frontendu, więc pewnie się zastanawiasz, jak to zrobić skoro można odpytać bazę o każdy dokument i go edytować. Zazwyczaj backend jest od chronienia i komunikacji z bazą danych. Tu z pomocą przychodzi Firestore Seciurity Rules. Przy użyciu prostej składni podobnej do javascriptu mamy możliwość tworzenia zasad bezpieczeństwa. Ustalać kto ma jaki dostęp do danego zasobu na podstawie informacji znajdujących się w kolekcji ról użytkownika.

![firestore example rule](../Create-newsletter-with-firebase-and-angular/firestore-example-rule.png)

Kiedy już mamy system roli musimy ustalić jakie dane musimy mieć, aby newsletter mógł wykonywać swoje zadanie:

* *Ustawienia newslettera* — Uwierzytelnienia dla SMTP, opis pierwszej wiadomości dla potwierdzenia subskrypcji, dzienny limit wiadomości (niektóre usługi jak Gmail pozwalają tylko na określoną ilość przesłanych wiadomości dziennie). Do tych danych dostęp będą mieli tylko właściciel i administratorzy.

* *Newsletter* — Nazwa w systemie, adres e-mail, z którego wysyłamy wiadomości, informacja o błędach, jakie wystąpiły (np.: źle skonfigurowane uwierzytelnienie SMTP), ilość subskrybentów, ilość wysłanych wiadomości. Poza tymi polami nasz dokument będzie zawierał w sobie dodatkowe kolekcje dokumentów (Firestore pozwala na zagnieżdżanie się w dokumencie kolekcji z kolejnymi dokumentami):
  * *Subskrybenci* - adres e-mail, czy potwierdził subskrypcję, data dodania i informacje, jakie otrzymał wiadomości od nas od początku istnienia na liście. Tylko właściciel i administratorzy będą mieli wgląd do naszej listy.
  * *Subskrybenci internal* - Token potwierdzenia subskrypcji oraz anulowania jej. Te dane zostały specjalnie oddzielona od *Subskrybentów*, ponieważ tylko tak możemy im nadać inne zasady bezpieczeństwa. Zabezpieczone tokeny znane są tylko systemowi i dostępne tylko przy użyciu cloud functions, mające pełen dostęp do wszystkich zasobów firestore.
  * *Wiadomości* - Nazwa w systemie, Tytuł wiadomości, Treść wiadomości oraz identyfikator autora tejże wiadomości. Wiadomość może edytować autor, właściciel i administratorzy. Odczytać może każdy, kto posiada określoną rolę w *newsletterze*.
  * *Dostawa* - Identyfikator *newslettera*, *wiadomość* do przesłania, status przesyłki, data utworzenia dostawy. Tylko właściciel i administratorzy mają możliwość wysyłać i odczytywać nasze dostawy.

Dodatkową kolekcją, jaką jeszcze trzeba stworzyć to *zaproszenia*. Przecież nie każdy ma już konto w naszym systemie, trzeba go najpierw zaprosić e-mailem, a system musi wiedzieć, że nowy użytkownik był wcześniej zaproszony do *newslettera* i przypisać mu nowe role.

* *Zaproszenia* - adres e-mail, identyfikator *newslettera* oraz przyznana rola.

Wyczerpaliśmy już w pełni temat struktury naszej bazy czas przejść do tworzenia części backendowej.

## Firebase cloud functions - backend

![firebase cloud functions console view](../Create-newsletter-with-firebase-and-angular/firebase-cloud-functions-console-view.png)

Do obsługi subskrybentów musimy stworzyć REST API. Każdy newsletter musi mieć możliwość zapisania się na niego, wysłania potwierdzenia e-maila oraz wypisania się z niego każdym e-mailu jednym kliknięciem. Cloud functions pozwalają tworzyć taki interfejs przy użyciu popularnej biblioteki express.js, ostatecznie powstaną nam takie endpointy:

* /api/v1/subscribe — odpowiada za zapisywanie nowych subskrybentów.
* /api/v1/confirm — W pierwszej wiadomości zaraz po zapisie do newslettera, URL z tego endpointu wysyłany jest do subskrybenta, aby mógł potwierdzić swój adres e-mail.
* /api/v1/unsubscribe — URL jest podawany w każdej wiadomości do subskrybenta, zazwyczaj na dole, ale można to zmienić w ustawieniach newslettera.

![firebase cloud functions web api](../Create-newsletter-with-firebase-and-angular/firebase-cloud-functions-web-api.png)

Z API to będzie już wszystko, dzięki temu, że firestore umożliwia nam możliwość pracy z bazą danych już po stronie frontendu, nie musimy tworzyć kolejnych endpointów odpowiedzialnych za poszczególne akcje w naszym systemie. Tylko skomplikowane operacje na bazie danych są wykonywane po stronie cloud functions. W naszym systemie mamy takie dwa przypadki:

* Usunięcie newslettera — W Firestore usunięcie dokumentu nie usunie nam jego podkolekcji, więc w takim przypadku musimy dostać się do każdej podkolekcji dokumentu i usuwać istniejącą tam zawartość. Jest to bardzo czasowo długa i skomplikowana operacja, więc zalecane jest jej wykonanie po stronie backendu. Do tego celu można użyć *Http Callable Functions*, które są wariancją zapytań http, ale z obłożoną identyfikacją użytkownika.
* Zmiana nazwy newslettera — Dla usprawnienia działania aplikacji, nazwa newslettera nie tylko znajduje się w dokumencie newslettera, ale także przy każdej roli użytkowników co usprawnia działanie strony frontendowej projektu.

![firebase cloud functions rename newsletter](../Create-newsletter-with-firebase-and-angular/firebase-cloud-functions-rename-newsletter.png)

Zmieniając ustawienia newslettera mamy opcję ustalania dziennego limitu wysłanych wiadomości, musimy obserwować jego zmianę. Firestore ma funkcję uruchamiania kodu cloud functions podczas edycji konkretnego dokumentu z kolekcji, pozwala nam ona zaktualizować pozostały przydział na ten konkretny dzień.

Pewnie zastanawiasz się, jak wysyłane są wiadomości przez nasz system. Otóż robimy to dosyć prosto. Co godzinę uruchamiany jest kod backendu (cron jobs), który przeszukuje kolekcje newsletterów z nie zużytym limitem wiadomości i z flagą informującą czy oczekuje jakaś wiadomość do wysłania w kolekcji *dostawa*. Każdy subskrybent przechowuje w swoim dokumencie aktualny status otrzymanych wiadomości z kolekcji *dostawa*. Bez tego nie jest możliwe późniejsze tworzenie zapytań do bazy o subskrybentów oczekujących na wysłanie wiadomości. Przy użyciu biblioteki nodemailer system łączy się z usługą mailingową i wysyła wiadomości aż do skończenia się subskrybentów lub do końca dziennego limitu wiadomości.

Podobnie limity wiadomości są resetowane codziennie o godzinie 10.

Nowo zarejestrowanemu użytkownikowi musimy też za pomocą kodu backendowego znaleźć wszystkie zaproszenia, jakie otrzymał i dodać nowe role do systemu.

Część backendową mamy już opisaną teraz czas przejść do frontendu. :)

## Czym jest Angular?

![Angular logo](../Create-newsletter-with-firebase-and-angular/angular-logo.png)

Angular jest frameworkiem usprawniającym tworzenie szybkich i wydajnych aplikacji webowych. Systematycznie rozwijany przez Google, z roku na rok coraz bardziej staje się kompleksową platformą do tworzenia SPA zaraz obok Reacta czy Vue.

### Użyte technologie

Projekt w swoim rdzeniu korzysta z biblioteki Firebase do komunikacji z Firestore oraz z NGRX do zachowywania stanu ostatnio pobranych danych z naszej bazy co łagodzi etap ładowania treści podczas aktywnego korzystania z aplikacji. Ułatwiając sobie pracę nad wyglądem aplikacji, została użyta biblioteka material design oraz flex-layout. Dla zmniejszenia kosztów związanych z pobieraniem strony dodano do projektu bibliotekę @angular/pwa, która wprowadza nasz system w świat service-workerów i inteligentnego cachowania aplikacji po stronie klienta. Do edycji wiadomości użyto bibliotekę prosemirror. Posiada ona zestaw narzędzi gotowych do stworzenia bogatego w opcje edytora tekstu. Jego główną zaletą jest gotowy system transakcyjny pozwalający nam na edycję jednego dokumentu przez wiele osób jednocześnie tak jak w Google Docs. Jednym z problemów do rozwiązania była widoczność strony przez wyszukiwarki. Frontendowa cześć systemu jest typową aplikacją SPA, czyli cała treść strony generowana jest wyłącznie przez funkcje javascriptowe. Dla wielu wyszukiwarek jest to problem, ponieważ ich roboty potrafią tylko analizować zwracanej treści HTML z odpowiedzi serwer. Rozwiązaniem tego problemu jest biblioteka do prerenderowania treci HTML z wnętrza aplikacji, czyli Angular Universal. Za jej pomocą generujemy wcześniej zdefiniowane podstrony aplikacji i wysyłamy je jako statyczny html na hosting Firebase.

### Strony aplikacji webowej

System newsletterów potrzebuje kilka podstawowych widoków, aby użytkownik mógł swobodnie budować swoją bazę e-mail marketingową:

* *Logowanie i rejestracja* - Jak każda rozbudowana usługa musimy zawrzeć stronę, przez którą użytkownik będzie się swobodnie logował czy też tworzył nowe konto.
* *Lista newsletterów* - Pierwszy widok po logowaniu. Lista dostępnych dla nas newsletterów, wyciągnięta zapytaniem z kolekcji ról użytkownika.
* *Nowy newsletter* - Tworzenie nowego newslettera, gdzie podajemy nazwę nowego newslettera i po zatwierdzeniu jesteśmy kierowani do reszty ustawień.
* *Ustawienia* - Edycja uwierzytelnienia SMTP, zmiana nazwy newslettera, edycja wiadomości potwierdzającej subskrybuje, lista użytkowników z możliwością edycji roli oraz zapraszania nowych osób. Widok dostępny jest tylko dla właściciela i administratorów.
  * *Subskrybenci* - Lista wszystkich zapisanych członków newslettera.
  * *Nowa wiadomość* - Widok nowej wiadomości. Z polami jak nazwa, tytuł i treść wiadomości. Jest też używany do ponownej edycji wiadomości w systemie.
  * *Wiadomości* - Lista utworzonych wiadomości, które możemy natychmiast wysłać do naszych subskrybentów.
  * *Dostawa* - Lista wszystkich nadanych lub oczekujących na wysłanie wiadomości do użytkowników.
* *Newsletter* - Podstawowe statystyki, czyli ilość subskrybentów, ilość wysłanych e-maili od początku istnienia. Kod HTML dla stworzonego custom elementu (Formularza subskrypcji), którego można natychmiast wstawić na swoją stronę www czy Lead Magnet Landing Page-y. Ten widok jest także wejściem w pozostałe podstrony każdego newslettera.

### Formularz subskrypcji

![subscribe form](../Create-newsletter-with-firebase-and-angular/subscribe-form.png)

![custom element code](../Create-newsletter-with-firebase-and-angular/custom-element-code.png)

Do stworzenia formularza subskrypcji użyta została biblioteka @angular/elements. Angular Elements jest biblioteką zawierającą wszystkie potrzebne narzędzia, by przekształcić Component Angulara w niezależny od frameworka niestandardowy element HTML (również nazywany Web Component). Dzięki takiemu rozwiązaniu możemy zapewnić klientowi łatwy start w integracji newslettera z jego witryną.

## Podsumowanie

Mało być więcej kodu w artykule, ale raczej to wymagałoby zrobienie z niego kilkuczęściowego kursu. Jeśli po przeczytaniu tekstu jesteś zaintersowany obejrzeniem całego kodu projektu, to zapraszam na [githuba](link do projektu) gdzie znajduje się cały projekt lub jeśli chcesz skorzystać z e-mail marketingu w swoim biznesie to wystarczy, że wejdziesz na [https://email-newsletter.web.app/](http://email-newsletter.web.app/).
Projekt jest dalej rozwijany hobbystycznie po pracy, wymaga dodania jeszcze wielu funkcji, aby mógł konkurować z ofertą dostępną na rynku. Jeśli chciałbyś wnieść wkład w dalszy rozwój, czy to programistyczny, czy podpowiedzieć jakąś funkcjonalność to zapraszam do [kontaktu](mailto:pawel.laski@gmail.com).
