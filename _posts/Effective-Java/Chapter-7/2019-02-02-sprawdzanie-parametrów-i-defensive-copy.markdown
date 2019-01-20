---
layout:     post
titleSEO:	"Sprawdzanie parametrów i defensive copy"
title:      "Sprawdzanie parametrów i defensive copy"
subtitle:   "Czyli chronienie stanu naszego obiektu"
date:       2019-02-02 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    8
item:       49, 50
---

{% include effective-java/series-info.html %}

W tym rozdziale zawarte jest kilka dobrych praktyk na temat projektowania metod: min. jak traktować parametry i wartości zwracane, jak projektować sygnatury metod i jak je dokumentować.

# Sprawdzanie parametrów metody

Niektóre metody mogą mieć restrykcje co do parametrów przyjmowanych przez metody, np. indexy nie mogą być ujemne czy referencje do obiektów nie powinny być nullem. Tutaj w myśl zasady *fail quickly* powinniśmy wymusić prawidłowość parametrów już na początku metody oraz udokumentować wszystkie restrykcje.

Takie podejście ułatwia znalezienie źródła problemu - jeśli podana zostanie nieprawidłowa wartość, to natychmiast dostaniemy jasny komunikat tuż u źródła problemu. Jeśli tego nie zrobimy, to może się stać kilka rzeczy:
 - Metoda może się wysypać z dezorientującym wyjątkiem w samym środku wykonywania
 - Gorzej: Metoda wykonałaby się bez błędu, ale po cichu zwróciłaby nieprawidłowy wynik
 - Najgorzej: Metoda wykonałaby się bez błędu, ale zostawiłaby jakiś obiekt w nieprawidłowym stanie, powodując błąd w przyszłości w mało powiązanym miejscu daleko od źródła problemu.

Przydatne wyjątki do walidacji parametrów to: `IllegalArgumentException`, `IndexOutOfBoundsException` czy `NullPointerException`.

Przykładowa metoda ze sprawdzaniem parametru oraz dokumentacją:

```java
/**
 * Returns a BigInteger whose value is (this mod m). This method
 * differs from the remainder method in that it always returns a
 * non-negative BigInteger.
 *
 * @param m the modulus, which must be positive
 * @return this mod m
 * @throws ArithmeticException if m is less than or equal to 0
 */
public BigInteger mod(BigInteger m) {
    if (m.signum() <= 0)
        throw new ArithmeticException("Modulus <= 0: " + m);
    ... // Do the computation
}
```

W Javie 8 dodano metodę `Objects.requireNonNull`, która ułatwia null-checkowanie, więc nie ma już sensu robić tego ręcznie. Pozwala też na podanie własnej wiadomości dla wyjątku.

```java
// Inline use of Java's null-checking facility
this.strategy = Objects.requireNonNull(strategy, "strategy");
```

Można też zignorować zwracaną wartość i po prostu potraktować to jako swobodny null-check.

Szczególnie ważne jest stosowanie tej praktyki w przypadku metod, które nie używają od razu tych parametrów, a przechowują je na później. Szczególnym przypadkiem są tutaj konstruktory, gdzie powinniśmy to robić niemal zawsze, aby uniknąć klas w nieprawidłowym stanie.

Z drugiej strony nie ma sensu stosować tej praktyki w miejscach, gdzie takie sprawdzenie byłoby kosztowne lub gdy takie sprawdzenie jest wykonywane pośrednio - podczas wykonywania metody i rzuciłoby błędem od razu.

Faszerowanie metod takimi restrykcjami na parametry to też nie jest dobra rzecz. Metody powinno się projektować tak, by - w miarę możliwości - były jak najbardziej ogólne i miały jak najmniej ograniczeń.

# Defensive copy - co to i po co?

Java jest w miarę bezpiecznym językiem, jednak nie chroni nas przed wszystkim. Zależnie od sytuacji warto programować defensywnie tzn. z założeniem, że klient naszej klasy będzie chciał dać z siebie wszystko, aby popsuć naszą klasę.

Łatwo jest udostępnić sposób na modyfikowanie stanu klasy nieumyślnie. Dla przykładu spójrzmy na tę klasę, która miała być niemutowalna:

```java
// Broken "immutable" time period class
public final class Period {
    private final Date start;
    private final Date end;

    /**
     * @param  start the beginning of the period
     * @param  end the end of the period; must not precede start
     * @throws IllegalArgumentException if start is after end
     * @throws NullPointerException if start or end is null
     */
    public Period(Date start, Date end) {
        if (start.compareTo(end) > 0)
            throw new IllegalArgumentException(
                start + " after " + end);
        this.start = start;
        this.end   = end;
    }

    public Date start() {
        return start;
    }

    public Date end() {
        return end;
    }

    ...    // Remainder omitted
}
```

Na pierwszy rzut oka może się wydawać, że ta klasa jest niemutowalna oraz dba o to, by koniec okresu nie poprzedzał początku. Jednak można to łatwo złamać, wykorzystując fakt, że klasa `Date` jest mutowalna:

```java
// Attack the internals of a Period instance
Date start = new Date();
Date end = new Date();
Period p = new Period(start, end);
end.setYear(78);  // Modifies internals of p!
```

Używając Javy 8+, oczywistym rozwiązaniem tego problemu jest używanie klas `Instant`, `LocalDateTime` lub `ZonedDateTime` zamiast `Date`, ponieważ te klasy są niemutowalne. `Date` jest już przestarzała i nie powinna być używana w nowym kodzie.

Jednak nie rozwiązujemy tym ogólnego problemu - czasem przecież będziemy potrzebowali użyć mutowalnych klas. I tu rozwiązaniem są właśnie tytułowe "defensive copies".

Aby ochronić wnętrzności klasy `Period` przed taką modyfikacją musimy zrobić `defensive copy` każdego mutowalnego parametru podanego do konstruktora:

```java
// Repaired constructor - makes defensive copies of parameters
public Period(Date start, Date end) {
    this.start = new Date(start.getTime());
    this.end   = new Date(end.getTime());

    if (this.start.compareTo(this.end) > 0)
      throw new IllegalArgumentException(
          this.start + " after " + this.end);
}
```

Jak widać "defensive copy" to po prostu utworzenie nowego identycznego obiektu wewnątrz klasy.

Dzięki temu poprzedni atak nie zadziała. Ważne jest też to, aby walidacja parametrów była wykonana na kopiach - chroni to klasę przed modyfikowaniem parametrów z innego wątku między czasem, gdy są walidowane, a potem kopiowane. W bezpieczeństwie znane jest to jako atak *time-of-check/time-of-use (TOCTOU)*.

{ .note}
Warto zauważyć, że nie użyta jest tu metoda `clone` klasy `Date`. To dlatego, że klasa `Date` nie jest `final` i nie ma gwarancji, że metoda `clone` zwróci obiekt klasy `java.util.Date`. Może również zwrócić instancję niezaufanej podklasy, która jest zaprojektowana, aby szkodzić. Dlatego nie powinno się używać metody `clone`, aby robić *defensive copy* na obiektach, które mogą być rozszerzane.

To jednak nie wszystko - nasza klasa nadal jest wrażliwa. Nadal można ją modyfikować z zewnątrz dzięki getterom, które udostępniają bezpośrednio wnętrzności klasy:

```java
// Second attack on the internals of a Period instance
Date start = new Date();
Date end = new Date();
Period p = new Period(start, end);
p.end().setYear(78);  // Modifies internals of p!
```

Aby obronić się przed tym atakiem, również w przypadku getterów trzeba zwracać `defensive copy` danego pola:

```java
// Repaired accessors - make defensive copies of internal fields
public Date start() {
    return new Date(start.getTime());
}

public Date end() {
    return new Date(end.getTime());
}
```

Teraz dopiero nasza klasa jest w pełni niemutowalna, a jej stan zenkapsulowny. Nie ważne jak podstępny lub mało kompetentny jest programista - nie ma możliwości popsucia klasy (pomijając natywne metody i refleksję).

Taka praktyka nie jest zresztą tylko po to, by projektować niemutowalne klasy. Pisząc metodę lub konstruktor, który przechowuje referencję do mutowalnego obiektu podanego przez klienta lub zwraca mutowalne pole, trzeba się zastanowić się, czy nasza klasa może tolerować zmiany stanu, czy poradzi sobie z tym? Czy może doprowadzić do trudnego do znalezienia błędu za jakiś czas?


Dobra praktyka jest jednak następująca - staraj się używać niemutowalnych komponentów dla twojego obiektu, a nie będziesz musiał dbać o *defensive copy*.

Czasem *defensive copy* może być kosztowne wydajnościowo i nie jest to zawsze uzasadnione. Jeśli klasa ufa klientowi (bo np. klient i klasa są w tym samym pakiecie) lub klient może zaszkodzić tylko sam sobie, to nie ma sensu tego stosować. Wtedy warto tylko to udokumentować.