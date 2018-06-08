---
layout:     post
titleSEO:	"Metoda toString - kiedy i dlaczego warto ją nadpisywać"
title:      "Metoda toString"
subtitle:   "Kiedy i dlaczego warto ją nadpisywać"
date:       2018-06-30 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        false
chapter:    3
item:       12
---

{% include /effective-java/series-info.html %}

Metoda `toString` jest zdefiniowana w klasie `Object`, dzięki czemu wszystkie obiekty dostają jej domyślną implementację. Służy do zwracania tekstowej, czytelnej dla człowieka reprezentacji obiektu. Jednak domyślna implementacja nie jest zbyt użyteczna, bo wygląda tak:

``` java
getClass().getName() + '@' + Integer.toHexString(hashCode());
```
czyli zwracana jest nazwa klasy + @ + heksadecymalna reprezentacja *hash code*, np. `PhoneNumber@163b91`.

Podobnie jak w przypadku metod `equals` i `hashCode` jej zachowanie najczęściej powinniśmy nadpisać, aby zrobić z niej użytek.

Dla przykładu z klasy reprezentującej numer telefonu chcielibyśmy, żeby było zwracane coś typu `707-867-530`.

Nie jest to tak ważna metoda, jak `equals` czy `hashCode`, jednak **dostarczanie dobrej implementacji metody `toString` sprawia, że klasy są przyjemniejsze w użyciu, a aplikacja łatwiejsza do debugowania**, nawet jeśli ty sam bezpośrednio z niej nie korzystasz.

Dzieje się tak dlatego, że metoda `toString` jest automatycznie wywoływana w wielu miejscach:

- gdy podajemy obiekt do `println`, `printf`
- podczas konkatenacji stringów
- w komunikatach o asercjach podczas testowania
- podczas podglądania obiektu w debugerze.

Często przydaję się to do logowania informacji. Jeśli dostarczymy dobrą implementację `toString` dla przykładowej klasy `PhoneNumber`, to wystarczy podać obiekt:

```java
Logger.info("Failed to connect to " + phoneNumber);
```
Nie trzeba za każdym razem ręcznie wyciągać i sklejać numeru z klasy.

Również podglądając kolekcje zobaczymy jej ładną reprezentację. Chyba jasne jest, że wolelibyśmy zobaczyć `{Jenny=707-867-5309}` zamiast `{Jenny=PhoneNumber@163b91}`.

Oczywiście są przypadki gdzie metoda `toString` nie ma sensu. Na przykład w statycznej klasie typu *utility*. Również nie ma potrzeby definiowania jej w klasach typu `Enum`, bo dostarcza ją już standardowa implementacja.

W przypadku klas abstrakcyjnych może czasem się przydać, jeśli podklasy mają wspólną reprezentację. Na przykład, większość konkretnych klas kolekcji dziedziczy metodę `toString` z odpowiednich klas abstrakcyjnych kolekcji.

**Metoda `toString` powinna zawierać wszystkie kluczowe informacje zawarte w obiekcie**. Nie chcielibyśmy, żeby coś było pominięte i na przykład podczas testowania zobaczyć taki błąd:

```text
Assertion failure: expected {abc, 123}, but was {abc, 123}.
```

**Ważnym aspektem metody `toString`, który trzeba rozważyć to to, czy będzie miała określony stały format i będzie on określony w dokumentacji.**

W przypadku klas, które reprezentują jakąś wartość, np. `PhoneNumber`, warto to zrobić. Dzięki temu będziemy mieli jednoznaczną, czytelną dla człowieka reprezentację obiektu, która może posłużyć do odtworzenia obiektu ze stringa. Wtedy taką reprezentację możemy z łatwością używać jako *input/output* w czytelnych dla człowieka plikach przechowujących dane (np. pliki CSV). Wtedy warto też udostępnić [static method factory]({% post_url Effective-Java/Chapter-1/2018-04-14-static-factory-method-zamiast-konstruktora %}) lub konstruktor, który umożliwi na podstawie stringa stworzyć ten obiekt.

Takie podejście zastosowano w wielu klasach z podstawowej biblioteki Javy, np. `BigInteger`, `BigDecimal` i większość innych klas opakowujących prymitywy.

Dla przykładu klasa `Integer` udostępnia konstruktor z argumentem typu `String`:

```java
Integer number = new Integer("123");
```
Z drugiej strony, jeśli zdecydujemy się na stały format i nasza klasa będzie szeroko używana (np. jeśli jest częścią publicznej biblioteki), to jesteśmy z nim uwięzieni do końca życia i nie mamy opcji go zmienić. Jeśli w kolejnej aktualizacji zmienilibyśmy format, to popsulibyśmy każdą aplikację, która używała naszej klasy.

**Dlatego warto jasno udokumentować nasze intencje wcześniej.**

Ponadto **do wszystkich informacji zawartych w metodzie `toString` powinny być udostępnione gettery**, aby nie wymuszać parsowania stringa, które jest dodatkową, zbędną i mało wydajną operacją. Również takie rozwiązanie jest narażone na błędy, bo jeśli zmieni się format, to parsowanie przestanie działać. Jeśli dane są widoczne w metodzie `toString`, to znaczy, że powinniśmy mieć do nich metody dostępowe.

Jak w pozostałych przypadkach, IDE oraz biblioteka Lombok również pozwalają na automatyczne wygenerowanie metody `toString`, jednak nie we wszystkich przypadkach jest ona odpowiednia. Np. przykładowy `PhoneNumber` składa się z co najmniej 3 pól i automatycznie wygenerowana metoda w postaci pole=wartość, pole=wartość nie jest preferowana, bo numer ma swoją standardową reprezentację typu 707-867-530. Jednak wygenerowana metoda `toString` i tak jest lepsza niż ta, którą dostajemy domyślnie.