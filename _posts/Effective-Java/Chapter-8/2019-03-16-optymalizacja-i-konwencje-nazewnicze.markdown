---
layout:     post
titleSEO:   "Optymalizowanie kodu + konwencje nazewnicze w Javie"
title:      "Optymalizowanie kodu"
subtitle:   "Przedwczesna optymalizacja + konwencje nazewnicze w Javie"
date:       2019-03-16 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    9
item:       67, 68
---

{% include effective-java/series-info.html %}

# Optymalizacja - robić czy nie?

Są co najmniej 3 znane cytaty odnośnie optymalizacji:

> More computing sins are committed in the name of efficiency (without necessarily achieving it) than for any other single reason—including blind stupidity.  
> —William A. Wulf

> We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil.  
> —Donald E. Knuth

> We follow two rules in the matter of optimization:
> Rule 1. Don’t do it.  
> Rule 2 (for experts only). Don’t do it yet—that is, not until you have a perfectly clear and unoptimized solution.  
> —M. A. Jackson

Wszystkie 3 cytaty poprzedzają język programowania Java o co najmniej dwie dekady, jednak nadal są aktualne i mówią świętą prawdę o optymalizacji - łatwiej jest nią narobić więcej szkód niż dobra, szczególnie jeśli mowa o przedwczesnej optymalizacji. 

Nie warto poświęcać dobrego designu na rzecz wydajności - lepiej jest pisać dobre programy niż szybkie. Jeśli dobry program nie jest wystarczająco wydajny, jego architektura pozwoli go później zoptymalizować. Dobre programy przestrzegają zasady enkapsulacji danych, więc pojedyncze decyzje mogą być zmienione bez wpływu na pozostałą część systemu.

Nie znaczy to też, że powinniśmy ignorować problemy wydajnościowe, dopóki nie skończymy programu. Problemy implementacyjne mogą być naprawione późniejszą optymalizacją, ale wszechobecne wady architektury ograniczające wydajność mogą nie być możliwe do naprawy bez przepisywania całego systemu od nowa.

Najtrudniej wprowadzić zamianę w komponentach, które zawierają interakcje pomiędzy komponentami a światem zewnętrznym np. API czy formaty przesyłania danych. Mogą też narzucić znaczne ograniczenia wydajności, dlatego te części systemy trzeba zaprojektować z największą starannością.

Więc nie możemy całkiem przestać myśleć o optymalizacji. Zawsze trzeba rozważać konsekwencje naszych wyborów np. tworzac typ mutowalny, możemy wymuszać na kliencie wiele zbędnych kopi defensywnych. Podobnie, używając dziedziczenia w publicznej klasie zamiast kompozycji, zszywamy daną klasę z nadklasa na zawsze, co może skutkować ograniczeniami podklasy. Tak samo używając w API typu implementacji zamiast interfejsu, wymuszamy tylko jedną konkretną implementację, mimo to, że w przyszłości mogłaby być napisana bardziej wydajna wersja. Jeśli system jest używany tylko wewnętrznie i możemy całkowicie przebudowywać kod, to nie ma to aż takiego znaczenia, ale po co sobie utrudniać życie?

Na szczęście zazwyczaj dobry design idzie w parze z dobrą wydajnością lub z łatwą możliwością na jej poprawę. Kiedy zaprojektowaliśmy czysty i dobrze ustrukturyzowany kod, to wtedy może być czas na rozważanie optymalizacji, która w dobrze zaprojektowanym systemie jest łatwa do wprowadzenia. Nigdy nie powinniśmy skupiać się na optymalizacji kosztem spaczonego designu.

W określeniu, gdzie powinniśmy skupić naszą uwagę podczas optymalizowania systemu, mogą nam pomóc profilery. Te narzędzia dają nam takie informacje jak np. czas, w jakim każda metoda się wykonuje i jak wiele razy to miało miejsce. Innym narzędziem, o którym warto wspomnieć, jest framework do benchmarków [JMH](https://openjdk.java.net/projects/code-tools/jmh/), którym możemy zmierzyć wydajność poszczególnych kawałków kodu. Warto skorzystać z tego narzędzia, aby porównać zoptymalizowany kod, czy aby na pewno wydajność jest lepsza, czy tylko nam się tak wydaje.

# Konwencje nazewnicze w Javie

Ten temat jest dosyć rozwlekle opisany w książce, jednak myślę, że tu nie ma co się rozdrabniać - podam same konkrety.

W Javie (jak i w każdym innym języku) mamy powszechnie uznawane konwencje nazewnicze, których należy się trzymać.

Można powiedzieć, że dzielą się na dwie grupy - typograficzne i gramatyczne.
 
Nazwy pakietów i modułów powinny być zwięzłe i składać się wyłącznie z małych liter. Zalecane też są opisowe skróty np. `util` zamiast `utilities` lub akronimy. Nazwa pakietu, który będzie używany poza naszą organizacją, powinna zaczynać się od odwróconej nazwy domeny np. `com.google`.

Klasy i interfejsy włączając w to enumy i adnotacje powinny zaczynać się wielką literą i dalej CamelCase. Często dyskusji podlega problem, czy akronimy powinny być całe pisane wielkimi literami, czy nie. Według mnie nie - tylko pierwsza litera powinna być pisana z dużej, szczególnie gdy mamy w nazwie dwa akronimy. Wolałbyś widzieć klasę nazwaną `HTTPURL` czy `HttpUrl`?

Metody i pola obowiązują te same zasady tyle, że zaczynamy małą literą.

Wyjątkiem od tej zasady są pola stałe (`static final` + niemutowalne), które powinny być zapisane dużymi literami, a poszczególne słowa oddzielone podłogą. Stałymi są również wartości enumów.

Zmienne lokalne mają już większą dowolność co do nazwy, ale powinny być opisowe i oczywiście zaczynać się z małej litery.

Nazwy parametru typu składają się z jednej dużej litery. Najczęściej używa się:
- `T` dla jakiegoś typu (jeśli jest więcej niż jeden, to kolejno `T`, `U`, `V` lub `T1`, `T2`, `T3`)
- `E` dla typu elementu kolekcji
- `K` i `V` dla typu klucza i wartości mapy
- `X` dla typu wyjątku. 
- `R` dla typu zwracanego przez funkcję

Podsumowując:

{: .post-table}

| Element            | Przykład                                         |
|--------------------|--------------------------------------------------|
| Pakiet lub moduł   | org.junit.jupiter.api, com.google.common.collect |
| Klasa lub Interfejs| Stream, FutureTask, LinkedHashMap, HttpClient    |
| Metoda lub pole    | remove, groupingBy, getCrc                       |
| Stała              | PI, MIN_VALUE, NEGATIVE_INFINITY                 |
| Zmienna lokalna    | i, denom, houseNum                               |
| Parametr typu      | T, E, K, V, X, R, U, V, T1, T2                   |

Odnośnie konwencji gramatycznych, które nie są już tak bardzo konieczne jak te typograficzne, to zazwyczaj nazwy klas instancjonowalnych są rzeczownikiem w liczbie pojedynczej jak np. `Thread`, `PriorityQueue` czy `ChessPiece`. Z kolei nazwy nieinstancjonowalnych klasy typu utility często są w liczbie mnogiej np. `Collectors` czy `Collections`. Interfejsy zazwyczaj nazywane są tak jak klasy np. `Collection` czy `Comparator`, ale też z końcówkami `able` lub `ible` np. `Runnable`, `Iterable` czy `Accessible`.

Metody, które:
- wykonują jakieś akcje standardowo są czasownikami np. `append` lub `drawImage`
- zwracają `boolean` zazwyczaj zaczynają się od `is` lub `has` + rzeczownik np. `isDigit`, `isProbablePrime`, `isEmpty`, `isEnabled` lub `hasSiblings`
- zwracają jakąś daną zazwyczaj zaczynają się od `get` lub bezpośrednio nazwa tej danej np. `size`, `hashCode` lub `getTime`.
- konwertują obiekt w inny zazwyczaj nazywają się `toType` np. `toString` lub `toArray`. 
- zwracają inny widok zazwyczaj nazywają sie `asType` np. `asList`.
- są statycznymi fabrykami zazwyczaj nazywają się `from`, `of`, `valueOf`, `instance`, `getInstance`, `newInstance`, `getType` lub `newType`.
