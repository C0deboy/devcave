---
layout:     post
titleSEO:   "Eliminowanie ostrzeżeń unchecked cast"
title:      "Eliminowanie ostrzeżeń unchecked cast"
subtitle:   "Skąd się biorą i jak się nimi zająć"
date:       2018-10-13 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    5
item:       27, 32
---

{% include effective-java/series-info.html %}

Pracując z generykami, często natrafimy na wiele ostrzeżeń od kompilatora: unchecked cast, unchecked method invocation, unchecked parameterized vararg type i unchecked conversion. Przekaz z tego wpisu jest prosty - powinno się je eliminować. Dzięki temu zapewnimy, że program jest *type safe* i nigdy nie wyskoczy `ClassCastException` czy coś podobnego.

Wiele z nich jest naprawdę prosta do poprawy. Najprostszy przypadek, kiedy dostaniemy *unchecked conversion*, to:

```java
Set<Lark> exaltation = new HashSet();
```

I treść błędu:
```
Venery.java:4: warning: [unchecked] unchecked conversion
        Set<Lark> exaltation = new HashSet();
                               ^
  required: Set<Lark>
  found:    HashSet
```

Wystarczy dodać *diamond operator* (<>) (od Javy 7), który poinformuje kompilator, że używamy tego samego typu, który jest zdefiniowany dla zmiennej i po prostu go z niej wywnioskuje.

```java
Set<Lark> exaltation = new HashSet<>();
```

I ostrzeżenie znika. Generalnie unikanie surowych typów minimalizuje liczbę takich ostrzeżeń.

Problematyczne jest również używanie tablic wraz z generykami - ten temat zostanie poruszony w następnym wpisie.

Jednak niektórych ostrzeżeń nie da się zlikwidować. Jeśli jesteśmy w stanie udowodnić, że mimo ostrzeżenia nasz kod jest *typesafe*, to możemy wyciszyć to ostrzeżenie za pomocą adnotacji
`@SuppressWarnings("unchecked")`. Do tego powinniśmy też dołączyć komentarz, wyjaśniający, dlaczego uważamy, że dana operacja jest *typesafe*.

# @SuppressWarnings

`@SuppressWarnings` może być użyte na każdej deklaracji, dlatego warto maksymalnie ograniczać *scope*, dla którego będzie działać, żeby nie wyciszyć też innych ostrzeżeń.

Czasem nawet warto utworzyć do tego nową zmienną. Dla przykładu, gdy skompilujemy taką metodę:

```java
public <T> T[] toArray(T[] a) {

    if (a.length < size)
       return (T[]) Arrays.copyOf(elements, size, a.getClass());

    System.arraycopy(elements, 0, a, 0, size);

    if (a.length > size)
       a[size] = null;
    return a;
}
```

To dostaniemy takie ostrzeżenie:

```
ArrayList.java:305: warning: [unchecked] unchecked cast
       return (T[]) Arrays.copyOf(elements, size, a.getClass());
                                 ^
  required: T[]
  found:    Object[]
```

Nie możemy dać adnotacji na `return`, bo to nie jest deklaracja. Nie powinniśmy też w takim przypadku dać adnotacji na całą metodę. Warto utworzyć do tego dodatkową zmienną, aby ograniczyć zasięg wyciszenia:

```java

// Adding local variable to reduce scope of @SuppressWarnings
public <T> T[] toArray(T[] a) {

    if (a.length < size) {
        // This cast is correct because the array we're creating
        // is of the same type as the one passed in, which is T[].
        @SuppressWarnings("unchecked")
        T[] result = (T[]) Arrays.copyOf(elements, size, a.getClass());
        return result;
    }

    System.arraycopy(elements, 0, a, 0, size);

    if (a.length > size)
        a[size] = null;
    return a;
}
```

W kolejnym wpisie będzie więcej przykładów prawidłowego wyciszania ostrzeżeń np. podczas mieszania generyków z tablicami.

# @SafeVarargs

*Vararg*-i zostały dodane razem z generykami w Javie 5, aby dodać możliwość przekazywania do funkcji zmiennej liczby argumentów, jednak nie współpracują ze sobą bez konfliktów. Rzucane są ostrzeżenia, jeśli varargi mają generyczne typy. Jest to spowodowane tym, że pod spodem tworzona jest tablica, która przetrzymuje te parametry, a mieszanie tablic z generykami jest problematyczne. O tym będzie w następnym wpisie.

Pojawia się też pytanie: dlaczego można zadeklarować metodę z generycznym parametrem varargs, podczas gdy nie możemy utworzyć generycznej tablicy?
Ano dlatego, że takie metody są bardzo użyteczne i projektanci Javy postanowili wprowadzić taką niespójność. Nawet w samej bibliotece Javy są takie metody: `Arrays.asList(T... a)`, `Collections.addAll(Collection<? super T> c, T... elements)` czy `EnumSet.of(E first, E... rest)`, które są w pełni *typesafe*.

Przed Java 7 nie było jednak sposobu, aby zrobić coś z ostrzeżeniami, więc używanie takich metod nie było zbyt przyjemne - aby się ich pozbyć, trzeba było używać `@SuppressWarnings("unchecked")` na każdym wywołaniu.

I w końcu w Javie 7 została dodana adnotacja `@SafeVarargs`, dzięki której można wyciszyć automatycznie ostrzeżenia po stronie klienta, które generuje metoda z generycznym parametrem vararg. Oznaczając tą adnotacją metodę, składamy obietnicę, że nasza metoda jest całkowicie *typesafe*.

Kiedy wiadomo, że jest bezpieczna?
- Gdy nie modyfikujemy zawartości tablicy
- Gdy nie przekazujemy referencji tej tablicy na zewnątrz, co by umożliwiło jej modyfikację, z wyjątkiem gdy:
    - przekazujemy ją do innej metody z varargs z adnotacją `SafeVarargs`
    - lub metody, która też odczytuje tylko wartości z tablicy

Czyli używamy ją tylko do tego, do czego została stworzona - do przekazania zmiennej liczby argumentów od klienta do wnętrza metody.

Tak wygląda typowe użycie metody ze zmienną ilością argumentów - funkcja przyjmuje dowolną ilość list, które łączy i zwraca jako jedną:

```java
// Safe method with a generic varargs parameter
@SafeVarargs
static <T> List<T> flatten(List<? extends T>... lists) {
    List<T> result = new ArrayList<>();
    for (List<? extends T> list : lists)
        result.addAll(list);
    return result;
}
```

Ta metoda jest całkowicie *typesafe* i dzięki adnotacji `@SafeVarargs` klient nie musi przejmować się żadnymi ostrzeżeniami.

{: .note}
Adnotacje `@SafeVarargs` możemy zadeklarować tylko na metodach, które nie mogą być nadpisane, ponieważ nie ma możliwości, aby zagwarantować, że każda nadpisująca metoda będzie bezpieczna. Do Javy 8 można było ją używać tylko na metodach statycznych i finalnych instancyjnych. W Javie 9 umożliwiono też na prywatnych metodach instancyjnych.

Innym sposobem na wyeliminowanie tych problemów mogłoby być użycie listy zamiast *varargs*.