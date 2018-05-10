---
layout:     post
titleSEO:	"Co to jest SOLID DRY KISS - zasady projektowania obiektowego"
title:      "Zasady projektowania obiektowego"
subtitle:   "SOLID, DRY, KISS itp."
date:       2017-11-30 12:00:00
author:     "Codeboy"
category:   Notatnik-Juniora
tags:	    Notatnik-Juniora Dobre-praktyki
comments:   true
toc:        true
---

Przez proces swojej nauki zebrałem całkiem pokaźną listę zasad projektowania obiektowego, tym samym dobrych praktyk, do których warto się stosować. Zostawiam to tutaj jako swój notatnik. Nie można tego traktować jako pełne źródło wiedzy. Samo przeczytanie wymienionych zasad mało da, dlatego zachęcam do zgłębienia każdej z nich na własną rękę - najlepiej z przykładami ;)

# Ogólne

## DRY - Don’t Repeat Yourself
- Jedna z podstawowych zasad programowania - **nie powtarzaj się**. Wielokrotne użycie tego samego kodu to podstawa programowania.
- Jeśli jesteś blisko powtórzenia (np. chcesz zastosować kopiuj/wklej, seria ifów lub w kodzie występują podobne zachowania) pomyśl nad stworzeniem abstrakcji (pętla, wspólny interfejs, funkcja, klasa, jakiś wzorzec projektowy np. Strategia itp.), którą będziesz mógł wielokrotnie wykorzystać.

<p class="pros">Plusy</p>

- Lepsza czytelność kodu oraz łatwość w utrzymaniu.
- Zmiana implementacji tylko w jednym miejscu.

## KISS - Keep it simple, stupid!
- Prostota (i unikanie złożoności) powinna być priorytetem podczas programowania. Kod powinien byc łatwy do odczytania i zrozumienia wymagając do tego jak najmniej wysiłku.
- Większość systemów działa najlepiej, gdy polegają na prostocie, a nie na złożoności.
- Staraj się, aby twój kod podczas analizy nie zmuszał do zbytniego myślenia.
- Gdy po jakimś czasie wracasz do **swojego** kodu i nie wiesz co tam się dzieje, to znak, że musisz nad tym popracować ;)

Można to rozszerzyć o zasadę:

### Code for the Maintainer
- Czyli, programuj tak jakbyś to robił dla osoby, która będzie później utrzymywać ten kod. "Rób to tak jakby to był brutalny psychopata, który wie gdzie mieszkasz".
- Dlaczego? Utrzymywanie kodu to (przeważnie) najbardziej wymagająca i większa część pracy programistów. Nie powinniśmy utrudniać sobie tego zadania.
- Zadbaj o to, aby nie trzeba było się zbytnio głowić nad kawałkiem Twojego kodu.

### Boy scout rule
- Zawsze pozostaw po sobie kod czystszy niż go zastałeś.

<p class="pros">Plusy</p>
- Szybciej i łatwiej zrozumieć kod.
- Mniejsza ilość potencjalnych bugów.
- łatwość w utrzymaniu i modyfikowaniu kodu.

## SOLID

### S - Single responsibility principle
- Klasa powinna być odpowiedzialna za pojedynczy obszar. Nie powinno być więcej powodów niż jeden, aby klasa się zmieniła.
- Odpowiedzialność może być zdefiniowana jako powód do zmiany, zatem klasa powinna mieć tylko jeden taki powód, a więc jedną odpowiedzialność.
- Klasa realizuję pojedyncze zadanie.
- Gdy wymagana jest zmiana, powinna ona objąć tylko jedną klasę lub pakiet.

<p class="pros">Plusy</p>
- Lepsza czytelność kodu.
- Łatwość w utrzymaniu i modyfikowaniu kodu.
- Nie musimy skakać po kilku pakietach/klasach, aby wprowadzić pojedyńczą zmianę.

### O - Open/closed principle
- Powinieneś być w stanie rozszerzać swoje klasy bez jej modyfikacji.
- Klasy powinny być otwarte na rozszerzanie, a zamknięte na modyfikację.
- Polegaj na abstrakcji i polimorfizmie
- Łatwo złamać tą zasadę, gdy mamy przypadki kontrolowane przez ify czy konstrukcję switch.

<p class="pros">Plusy</p>
- Łatwiejsze i bardziej stabline rozbudowywanie systemu.
- Minimalizujemy potrzebę modyfikowania instniejącego kodu w wielu miejscach, gdy dodajemy np. kolejny przypadek czegoś.

### L - Liskov substitution principle
- Klasy w programie powinny być podmienialne przez swoje podklasy bez naruszania poprawności programu, czyli klasa dziedzicząca musi być dobrym odpowiednikiem klasy bazowej.
- Podklasa nie powinna robić mniej niż klasa bazowa. Czyli zawsze powinna robić więcej.
- Zobacz popularny przykład złego zastosowania dziedziczenia "Square extends Rectangle"

<p class="pros">Plusy</p>
- Przewidywalne zachowania obiektów

### I - Interface segregation principle
- Wiele mniejszych, konkretnych interfejsów jest lepsze od pojedynczego ogólnego interfejsu.
- Powinno się projektować małe i zwarte interfejsy.
- Klasa nie powinna implementować interfejsu, przez który naruszy [Single responsibility principle](#S---Single-responsibility-principle)
- Klasa która implementuje interfejs nie może być zmuszana do implementowania metod, których nie potrzebuje, a tak jest często w przypadku dużych iterfejsów.

<p class="pros">Plusy</p>
- Lepsza reużywalność interfejsów, czasem nie wszystkie metody są potrzebne z "dużego" interfejsu.
- Nie naruszanie [Single responsibility principle](#S---Single-responsibility-principle)

### D - Dependency inversion principle
- Niskopoziomowe klasy powinny zależeć od klas wysoko poziomowych, a obie od swoich abstrakcji.
- Abstrakcję nie powinny polegać na szczegółach implementacyjnych. 
- Szczegóły implementacyjne powinny polegać na abstrakcji.
- Czyli w żadnej definicji funkcji i w żadnej deklaracji zmiennej nie powinniśmy używać nazwy klasy, tylko jej abstrakcji (np. interfejs, klasa abstrakcyjna).

<p class="pros">Plusy</p>
- Minimalizowanie zależności (loose coupling)
- Elastyczność - łatwiej wprowadzać zmiany

<hr>

## LoD - Law of Demeter
- Nie rozmawiaj z obcymi. Rozmawiaj tylko z przyjaciółmi.
- Co to znaczy? Metoda obiektu powinna wywoływać metody tylko od:
  - Swojego obiektu.
  - Argumentu przekazanego do metody.
  - Obiektu stworzonego wewnątrz tej metody.
  - Bezpośredniego pola obiektu.
  - Np. nie powinno się stosować wywołań typu A.getB().getC().getD.getName().
  
<p class="pros">Plusy</p>
- Zmniejsza to powiązania między modułami oraz ilość ujawnianych detali

## SLAP - Single Level of Abstraction Principle
- Zasada ta mówi, że każda linia kodu w metodzie powinna mieć ten sam poziom abstrakcji, czyli aby unikać mieszania ze sobą wysoko i niskopoziomowych detali.

<p class="pros">Plusy</p>
- Czytelność i łatwiejsze utrzymanie kodu

## Composition Over Inheritance
- Kompozycja ponad dziedziczenie, czyli preferuj relacje B "zawiera/używa A" zamiast "jest A".
- W większości wypadów możemy całkowicie zrezygnować z dziedziczenia w naszej aplikacji (Oczywiście chodzi o dziedziczenie z **klas**, nie z interfejsów). Jest to zalecany sposób projektowania aplikacji.
- Stosuj dziedziczenie tylko gdy [LSP](#l---liskov-substitution-principle) nie jest złamana i naprawdę tego potrzebujesz.

<p class="pros">Plusy</p>
- Zmniejsza to zależności między klasami
- Używając dziedziczenia łatwiej też o złamanie [Liskov substitution principle](#l---liskov-substitution-principle)

## Encapsulate What Changes
- Miejsca, które są najbardziej prawdopodobne do zmiany powinny być schowane (zhermetyzowane) pod API.

<p class="pros">Plusy</p>
- Minimalizuje wymagane modyfikacje, gdy musimy wprowadzić zmianę

<hr>

# Projektowanie pakietów

## CPP - Common Closure Principle
- Klasy zmieniające się razem powinny być pakietowane razem
- Izolacja zmian do zakresu pakietu
- Ściśle powiązana z [OCP](#o---open/closed-principle) na poziomie klas
- Oznacza to tyle, że klasy, które zmieniają się wspólnie po zmianie wymagań, powinny być umieszczane w tym samym pakiecie. 

<p class="pros">Plusy</p>
- Minimalizuje to liczbę pakietów do zmiany w przypadku zmiany wymagań.
- Nie trzeba przeszukiwać kilku różnych pakietów w celu wprowadzenia zmiany

## REP - Reuse-release equivalence principle
- Ponownie użycie kodu to nie kopiowanie klasy z jednego projektu do drugiego. Jeżeli chcemy użyć ponownie kod to należy go wydzielić do biblioteki czy modułu, który później możemy użyć ponownie.
- Klasy, które są przeznaczone do ponownego wykorzystania, powinien być w jednej paczce, która może stać się reużywalną biblioteką. Nie powinny się tam znaleźć te, które nie są przeznaczone do ponownego wykorzystania. W skrócie - albo wszystkie są reużywalne, albo żadne.
- Powinny to być również klasy, które są z jednej "rodziny". Klasy niezwiązane z przeznaczeniem pakietu nie powinny się tam znaleźć.

<p class="pros">Plusy</p>

- Gdy autor oryginalnego kodu wprowadzi zmianę – w szczególności poprawi jakiś błąd – wówczas każdy może w łatwy sposób skorzystać ze zmian pobierając nową wersję biblioteki, zamiast zmieniać coś samodzielnie - a w przypadku, gdy my jesteśmy autorami, dokonywać zmian w co najmniej dwóch miejscach za każdym razem.

## CRP - Common-reuse principle
- Klasy wspólnie używane powinny być wspólnie pakietowane

<p class="pros">Plusy</p>
- Lepsza spójność i czytelność systemu

<hr>

# Zależności miedzy pakietami / klasami

## Minimise Coupling
- Minimalizuj powiązania między pakietami/klasami. Mniejsza ilość zależności jest lepsza.
- Można to zrobić przez ukrywanie szczegółów implementacji czy stosowanie [Law of Demeter](#LoD---Law-of-Demeter)

<p class="pros">Plusy</p>
- Zmniejsza to szansę na to, że zmiana kodu w zależności A nie popsuje kawałka kodu B.

## ADP - Acyclic dependencies principle
- Zasada ta mówi, że w strukturze zależności nie powinno być zapętleń/cykli.
- Przykładowa struktura łamiąca tą zasadę będzie gdy: pakiet A ma zależność w pakiecie B, który ma zależność w pakiecie C, który z kolei ma zależność w pakiecie A.<br>
<pre class="text-diagram">
A &larr;-------- C
|           &uarr;
'---&rarr; B ----<sup>|</sup>
</pre>
- Możemy temu zapobiec stosując [Dependency inversion principle](#D---Dependency-inversion-principle), wzorce projektowe np. Observer lub stworzyć nowy pakiet i wrzucić tam wszystkie wspólne zależności.

<p class="pros">Plusy</p>
- łatwiej zrozumieć i utrzymać system

## SDP - Stable-dependencies principle
- Pakiet, który jest zmienny nie powinien zależeć od pakietu, który jest trudny do zmiany.
- Zależności tego pakietu powinny być bardziej stabilne niż on sam.
- Taką samą zasadę możemy stosować w przypadku klas.

<p class="pros">Plusy</p>
- Zmniejsza efekt łancuchowej reakcji, która wymusza modyfikację kodu w kilku innych miejscach po wprowadzeniu jednej zmiany

## SAP - Stable-abstractions principle
- Stabilny pakiet (trudny do zmiany) powinien być maksymalnie abstrakcyjny (czyli np. w większości operować na interfejsach), aby jego stabilność nie uniemożliwiała jego rozszerzania.
- Niestabilny pakiet (łatwy do zmiany) powinien byc maksymalnie konkretny (czyli w większości operować na implementacjach) jako że jego niestabilność pozwala w łatwy sposób zmienić jego konkretną implementację.
