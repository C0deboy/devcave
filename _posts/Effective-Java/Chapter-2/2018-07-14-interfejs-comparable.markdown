---
layout:     post
titleSEO:   "Interfejs Comparable i Comparator - czyli porównywanie obiektów w Javie"
title:      "Interfejs Comparable i Comparator"
subtitle:   "Czyli porównywanie obiektów w Javie"
date:       2018-07-14 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    3
item:       14
---

{% include effective-java/series-info.html %}

Do porównywania obiektów w Javie służy metoda `compareTo`. W przeciwieństwie do innych metod w tym rozdziale serii nie jest zadeklarowana w `Object`. Jest to osobna metoda zdefiniowana w interfejsie `Comparable`.

# Comparable

```java
public interface Comparable<T> {
    int compareTo(T t);
}
```

Poza sprawdzaniem równości obiektów, tak jak w metodzie `equals`, oferuje jeszcze określanie, czy jest mniejszy lub większy niż inny obiekt. Implementując interfejs `Comparable` określamy domyślny porządek (ang. **natural ordering**) klasy, według którego m.in będzie układana w kolekcjach i na którym polega wiele algorytmów w Javie.

Aby posortować tablicę obiektów, które implementują `Comparable`, wystarczy wywołać:

```java
Arrays.sort(a);
```

Podobnie łatwo można wykonać sortowanie kolekcji, wyciągnąć z nich skrajne wartości czy używać takich obiektów w automatycznie sortujących się kolekcjach.

Dla przykładu, polegając na tym, że `String` implementuje interfejs `Comparable`:

```java
List<String> strings = Arrays.asList("Foo", "Bar", "Andy", "Shop");

Collections.max(strings);//Shop

Collections.min(strings);//Andy

Collections.sort(words);//Collection for binary search needs to be sorted
//[Andy, Bar, Foo, Shop]
Collections.binarySearch(words, "Foo");//2

```

Możemy też łatwo stworzyć zbiór posortowanych automatycznie wyrazów z wyeliminowanymi duplikatami, używając `TreeSet`:

```java
Set<String> alphabeticalWordList = new TreeSet<>(strings);
//[Andy, Bar, Foo, Shop]
```

Jeśli dodamy jakikolwiek string do tej kolekcji, to automatycznie zajmie swoje miejsce w alfabetycznym porządku.

Jak widać dzięki zaimplementowaniu `Comparable`, pozwalamy naszej klasie współdziałać z wieloma generycznymi algorytmami i kolekcjami, które polegają na tym interfejsie. Dostajemy wiele możliwości z małym nakładem pracy.

Wszystkie klasy reprezentujące wartości i enumy w Javie implementują ten interfejs.

Specyfikacja metody `compareTo` jest następująca:

>Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object. Throws `ClassCastException` if the specified object’s type prevents it from being compared to this object.
>
>In the following description, the notation `sgn`(_expression_) designates the mathematical  _signum_  function, which is defined to return `-`1, 0, or 1, according to whether the value of  _expression_  is negative, zero, or positive.
> - The implementor must ensure that `sgn(x.compareTo(y)) == -sgn(y. compareTo(x))` for all `x` and `y`. (This implies that `x.compareTo(y)` must throw an exception if and only if `y.compareTo(x)` throws an exception.)
> - The implementor must also ensure that the relation is transitive: `(x. compareTo(y) > 0 && y.compareTo(z) > 0)` implies `x.compareTo(z) > 0`.
> - Finally, the implementor must ensure that `x.compareTo(y) == 0` implies that `sgn(x.compareTo(z)) == sgn(y.compareTo(z))`, for all `z`.
> - It is strongly recommended, but not required, that `(x.compareTo(y) == 0) == (x.equals(y))`. Generally speaking, any class that implements the `Comparable` interface and violates this condition should clearly indicate this fact. The recommended language is “Note: This class has a natural ordering that is inconsistent with `equals`.”

Może się to wydawać skomplikowane, jednak wcale takie nie jest. W przeciwieństwie do metody `equals`, `compareTo` nie musi działać między różnymi typami. Jeśli jest taka sytuacja, to może spokojnie rzucić `ClassCastException`. I zazwyczaj tak jest. Jednak jest dozwolone porównywanie międzyklasowe, które zazwyczaj jest zdefiniowane w interfejsie, który implementują klasy porównywane.

W skrócie specyfikacja mówi:

- Jeśli pierwszy jest mniejszy od drugiego, to drugi musi być większy od pierwszego i na odwrót.
- Jeśli pierwszy obiekt jest równy drugiemu, to drugi musi być równy pierwszemu.
- Jeśli pierwszy obiekt jest większy niż drugi i drugi jest większy niż trzeci, to pierwszy musi być większy niż trzeci.
- Wszystkie obiekty, które przy porównywaniu są równe, muszą zwrócić ten sam rezultat, kiedy są porównywane z jakimkolwiek innym obiektem.

Ostatni warunek w specyfikacji `compareTo` jest raczej sugestią niż wymaganiem. Mówi, że test na równość obiektów powinien zwracać taki sam wynik jak metoda `equals`. Wtedy mówimy, że `compareTo` jest spójne z `equals`, a jeśli jest inaczej — niespójne.

Dla przykładu metoda `compareTo` w klasie `BigDecimal` jest niespójna z `equals`. Jeśli stworzymy pusty `HashSet` i dodamy do niego `new BigDecimal("1.0")` i `new BigDecimal("1.00")`, to w secie znajdą się obydwa. Dzieje się tak, gdyż obie instancje `BigDecimal` nie są równe, jeśli sprawdzamy je za pomocą `equals`. Z kolei, jeśli powtórzymy to samo dla `TreeSet`, który polega na `compareTo`, to wtedy będziemy mieć tylko jedną wartość, bo według `compareTo` są równe. Dlatego `compareTo` jest niespójne z `equals` w tym przypadku.

Sprawdzając równość obiektów, mamy ten sam problem, co w przypadku `equals`, który [omówiłem w poście]({% post_url Effective-Java/Chapter-2/2018-06-16-metoda-equals %}#problem-z-dziedziczeniem) na temat tej metody. Tutaj możemy zastosować to samo obejście, stosując zasadę [composition over inheritance]({% post_url Notatnik-juniora/2017-11-30-zasady-projektowania-kodu %}#composition-over-inheritance).

Tak samo jak zła implementacja `hashCode` lub jej brak może popsuć klasy, które zależą od hashowania, tak samo niepoprawna implementacja `compareTo` może spowodować nieprawidłowe działanie klas, które polegają na porównywaniu obiektów. Należą do tego m.in. kolekcje `TreeSet`, `TreeMap` i klasy *utillity* `Collections` i `Arrays`, które zawierają algorytmy sortowania i wyszukiwania.

W przeciwieństwie do `equals` w metodzie `compareTo` nie musimy sprawdzać typów ani castować, a to dlatego, że interfejs `Comparable` jest parametryzowany.

Porównując prymitywy, powinniśmy używać do tego metody `compare` z ich wrapperów, np. `Double.compare`, `Float.compare` czy `Integer.compare`.

Jeśli porównujemy kilka znaczących pól, oczywiście powinniśmy zacząć od najbardziej znaczącego. Jeśli wynik jest różny od zera, wystarczy zwrócić wynik pierwszego porównania. Np. dla klasy `PhoneNumber` z poprzednich wpisów mogłaby wyglądać tak:

```java
// Multiple-field Comparable with primitive fields
public int compareTo(PhoneNumber pn) {
    int result = Short.compare(areaCode, pn.areaCode);
        if (result == 0) {
            result = Short.compare(prefix, pn.prefix);
            if (result == 0)
                result = Short.compare(lineNum, pn.lineNum);
        }
    return result;
}
```

Porównując pola z referencjami do obiektów, wywołujemy rekursywnie `compareTo` tych obiektów, a jeśli nie implementują `Comparable` lub chcemy użyć niestandardowego porównywania, to możemy użyć klasy `Comparator`.

# Comparator

Możemy napisać swój własny lub wykorzystać już istniejące. Np. klasa `String` ma `Comparator`, który ignoruje wielkość liter:

```java
String.CASE_INSENSITIVE_ORDER.compare(s1, s2);
```

Od Javy 8, interfejs `Comparator` dostał zestaw metod, które umożliwiają jego płynne tworzenie. Jest to dużo bardziej zwięzłe rozwiązanie. Używając do tego statycznych importów, dostajemy całkiem przejrzysty kod. Odpowiednik powyższej metody `compareTo` z wykorzystanie comparatora wygląda tak:

``` java
// Comparable with comparator construction methods
private static final Comparator<PhoneNumber> COMPARATOR =
    comparingInt((PhoneNumber pn) -> pn.areaCode)
        .thenComparingInt(pn -> pn.prefix)
        .thenComparingInt(pn -> pn.lineNum);

public int compareTo(PhoneNumber pn) {
    return COMPARATOR.compare(this, pn);
}
```

Ta implementacja tworzy komparator w czasie inicjalizacji klasy. Pierwsza statyczna metoda `comparingInt` przyjmuje lambde, która wyciąga `areaCode` (klucz) i zwraca `Comparator<PhoneNumber>`, który porządkuje numery według ich `areaCode`.

Oczywiście metoda `compareTo` zachowuje się identycznie jak w wariancie napisanym ręcznie. Jeśli dwa numery mają taki sam `areaCode`, to dopiero wtedy kolejne porównania z `thenComparingInt` zostaną wywołane.

Warto zwrócić uwagę, że pierwsza lambda określa typ parametru (`PhoneNumber pn`), bo w takiej sytuacji inferencja typów w Javie nie jest na tyle inteligenta, żeby to wywnioskować, więc musimy jej z tym pomóc.

Jeśli klasa udostępnia gettery do pól, to można użyć referencji do nich, co jest nieco bardziej czytelnym rozwiązaniem:

``` java
private static final Comparator<PhoneNumber> COMPARATOR =
        comparingInt(PhoneNumber::getAreaCode)
        .thenComparingInt(PhoneNumber::getPrefix)
        .thenComparingInt(PhoneNumber::getLineNum);
```

Analogiczne metody do `comparingInt` znajdziemy dla innych prymitywów jak `long` i `double`. Wersje dla `int` mogą zostać użyte dla mniejszych typów danych jak `short` - tak jak w przykładzie z `PhoneNumber`. I podobnie, wersja dla `double` może być użyta dla `float`.

Dla obiektów mamy odpowiadającą statyczną metodę `comparing`, która ma dwa warianty:
 - Podajemy tylko klucz i używany jest jego domyślny porządek (ang. natural ordering).
 - Podajemy zarówno klucz, jak i komparator, który będzie używany na tym kluczu.

I trzy warianty dla `thenComparing`:
 - Podajemy tylko komparator, który określa drugorzędną kolejność.
 - Podajemy kolejny klucz i używamy jego domyślnego porządek (ang. natural ordering).
 - Podajemy zarówno kolejny klucz, jak i komparator, który będzie używany na tym kluczu.

Takie płynne budowanie komparatora często przydaję się przy streamach. Jeśli na przykład chcemy posortować elementy, to możemy to zrobić w całkiem dynamiczny sposób:

``` java
ranking.stream()
.sorted(Comparator.comparing(RankingEntry::getScore))
//...
```

Chcemy odwróconą kolejność? Wystarczy dodać `reversed()`:

``` java
ranking.stream()
.sorted(Comparator.comparing(RankingEntry::getScore).reversed())
//...
```

W rezultacie dostaniemy posortowane elementy według pola `score` z klasy `RankingEntry`, które są w liście rankingowej `List<RankingEntry>`.

Podsumowując, implementując interfejs `Comparable` uaktywnimy sporo użytecznych funkcji i kolekcji, z którymi nasza klasa może współpracować. Dzięki komparatorom możemy tworzyć różne niestandardowe porównywania obiektów, a od Javy 8, płynne API do dynamicznego tworzenia komparatorów z wykorzystaniem lambd znacznie ułatwia sprawę. Jeśli nasza klasa będzie miała jeden standard porównywania obiektów, to warto użyć interfejsu `Comparable`, który określa domyślny porządek (ang. **natural ordering**). Jeśli z kolei przewidujemy, że nasza klasa będzie porównywana na kilka sposobów lub chcemy użyć innego zamiast domyślnego, to przydadzą się komparatory.

