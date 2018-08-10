---
layout:     post
titleSEO:	"Eliminowanie ostrzeżeń unchecked cast"
title:      "Eliminowanie ostrzeżeń unchecked cast"
subtitle:   "Skąd się biorą i jak się nimi zająć"
date:       2018-09-22 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        false
chapter:    5
item:       27
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