---
layout:     post
titleSEO:	"Ograniczanie dozwolonych typów w generykach"
title:      "Ograniczanie dozwolonych typów w generykach"
subtitle:   "Czyli użycie bounded parameter type i bounded wildcard type"
date:       2018-10-06 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    5
item:       31
---

{% include effective-java/series-info.html %}

Większość typów generycznych, tak jak nasza zabawkowa klasa `Stack`, nie ma ograniczeń przekazywanego typu. Możemy podać dowolny typ parametru: `Stack<Object>`, `Stack<int[]>`, `Stack<List<String>>` itd.

{: .note}
Wyjątkiem są prymitywy. Nie możemy utworzyć np. `Stack<int>` lub `Stack<double>`. Możemy zamiast tego użyć ich wrpaperów `Integer`, `Double` itd.

Z drugiej strony, deklarując `List<String>` jako typ argumentu dla metody/klasy, narzucamy na nią spore ograniczenie - może przyjować tylko instancje klasy `String`. Czasem jednak potrzebujemy większej elastyczności, ale jednocześnie nie chcemy pozwalać na dowlony typ.

Możemy to osiągnać używając *bounded type parameter*.

# Bounded type parameter

Dla przykładu weźmy `java.util.concurrent.DelayQueue`. Jej deklaracja wygląda tak:

```java
class DelayQueue<E extends Delayed> implements BlockingQueue<E>
```

`<E extends Delayed>` oznacza, że przekazywana klasa musi być podtypem `java.util.concurrent.Delayed`. Dzięki temu możemy używać metod zdefiniowanych w tej klasie bez potrzeby castowania.

{: .note}
Wlicza się w to również typ `Delayed`. Każdy typ jest uznawany jak podtyp siebie, dlatego możliwe jest utworzenie `DelayQueue<Delayed>`.


Podobnie można tego użyć w deklaracjach metod.

```java
public <E extends DelayQueue> void  someMethod(E e) {
    //...
}
```

Możemy również ograniczać typ rekursywnie, używając kolejnego typu zawierajacego ten parametr typu. Nazywa się to *recursive type bound*. Często jest to używane w połączeniu z interfejsem `Comparable` (który był już [omawiany]({% post_url Effective-Java/Chapter-2/2018-07-14-interfejs-comparable %})):

```java
public interface Comparable<T> {
    int compareTo(T o);
}
```

`T` określa, do jakiego typu może być porównywany obiekt implementujący `Comparable<T>`. Najczęściej jest to on sam, np. `String` implementuje `Comparable<String>`, `Integer` implementuje `Comparable<Integer>` itd.

Wiele metod przyjmuje kolekcje elementów implementujących Comparable, aby ją sortować, przeszukiwać i czy kalkulować max/min. Te obiekty muszą być wzajemnie porównywalne, aby było to możliwe. Można to wymusić w ten sposób:

```java
// Using a recursive type bound to express mutual comparability
public static <E extends Comparable<E>> E max(Collection<E> c);
```

Cała metoda do wyciągania maxymalnej wartości mogłaby wyglądać tak:

```java
// Returns max value in a collection - uses recursive type bound
public static <E extends Comparable<E>> E max(Collection<E> c) {
    if (c.isEmpty())
        throw new IllegalArgumentException("Empty collection");

    E result = null;
    for (E e : c)
        if (result == null || e.compareTo(result) > 0)
            result = Objects.requireNonNull(e);

    return result;
}
```

Innym rozwiązaniem możę być też *bounded wildcard type*.

# Bounded wildcard type

Przywołajmy jako przykład jeszcze raz klasę `Stack`. Załóżmy, że chcemy dodać metodę, która dodaje do stosu wszystkie elementy z innej kolekcji. Pierwszą próbą mogłoby być coś takiego:

```java
// pushAll method without wildcard type - deficient!
public void pushAll(Iterable<E> src) {
    for (E e : src)
        push(e);
}
```

Jednak nie jest to do końca elastyczne rozwiązanie. Jeśli typ elementu z `Iterable` jest identyczny tym z `Stack` to wszystko jest ok. Jeśli jednak będziemy mięć np. `Stack<Number>`, to nie będziemy mogli dodać kolekcji integerów, mimo że `Integer` jest podtypem `Number`:

```java
Stack<Number> numberStack = new Stack<>();
Iterable<Integer> integers = ... ;
numberStack.pushAll(integers);
```

Błąd:

```
StackTest.java:7: error: incompatible types: Iterable<Integer>
cannot be converted to Iterable<Number>
        numberStack.pushAll(integers);
                            ^
```

I tu z pomocą przychodzi *bounded wildcard type*. Typ przyjmowanego argumentu nie powinien być "Iterable typu E" tylko “Iterable jakiegoś podtypu E” - zapisuje się to w ten sposób: ` Iterable<? extends E>`:

```java
// Wildcard type for a parameter that serves as an E producer
public void pushAll(Iterable<? extends E> src) {
    for (E e : src)
        push(e);
}
```

Dzięki takiej zmianie nasza metoda jest dużo bardziej elastyczna i powyża próba dorzucenia do `Stack<Number>` integerów z `Iterable<Integer>` powiedzie się.

I można też w drugą stronę. Możemy rozszerzyć dozwolone typy o wszystkie nadklasy danego typu. Deklaruje się to tak: `<? super E>`.

W ten sposób można by na przykład zaimplementować metodę, która wyciąga wszystkie wartości do innej kolekcji.

```java
// Wildcard type for parameter that serves as an E consumer
public void popAll(Collection<? super E> dst) {
    while (!isEmpty())
        dst.add(pop());
}
```

Dzięki `Collection<? super E>` możemy podać kolekcję o dowolnym typie parametru, ktory rozszerza `E`.

Dlatego dla maksymalnej elastyczności warto używać *bounded wildcard type* dla parametrów, które są *producerami* lub *consumerami*:

- Jeśli tylko wyciągamy obiekty, to jest, to *producer* i powinniśmy użyć `<? extends T>`.
- Jeśli tylko wkładamy obiekty do środka, to jest to *consumer* i powinniśmy użyć `<? super T>`.

Jeśli robimy obie operacje, to nie powinniśmy używać *wildcard type*.

Podobnie moglibyśmy ulepszyć funkcję `union` z poprzedniego wpisu:

```java
public static <E> Set<E> union(Set<? extends E> s1, Set<? extends E> s2)
```

Co umożliwia nam wtedy takie użycie:

```java
Set<Integer> integers = Set.of(1, 3, 5);
Set<Double> doubles = Set.of(2.0, 4.0, 6.0);
Set<Number> numbers = union(integers, doubles);
```

{: .note}
<div markdown="1">

Używając Javy starszej niż 8 (również zamieniając `Set.of` na starszy odpowiednik), dostaniemy błąd kompilacji:

```
Union.java:14: error: incompatible types
        Set<Number> numbers = union(integers, doubles);
                                   ^
  required: Set<Number>
  found:    Set<INT#1>
  where INT#1,INT#2 are intersection types:
    INT#1 extends Number,Comparable<? extends INT#2>
    INT#2 extends Number,Comparable<?>
```

Jest to spowodowane tym, że przed Javą 8 wnioskowanie typów nie było na tyle inteligentne, aby wywnioskować, że zwracany typ `E` to `Set<Number>`. W takiej sytuacji trzeba podać typ argumentu bezpośrednio, co nie jest zbyt ładne:

```java
// Explicit type parameter - required prior to Java 8
Set<Number> numbers = Union.<Number>union(integers, doubles);
```

</div>

`Comparable` zalicza się zawsze do *consumerów*, więc zazwyczaj powinno się używać `Comparable<? super T>`. Podobnie jest z `Comparable`.

Aplikując *wildcard types* do naszej metody `max` z poprzednich rozdziałów, która wyciąga największą wartość z listy, dostaniemy takiego potworka:

```java
public static <T extends Comparable<? super T>> T max(List<? extends T> list)
```

Dzięki temu wspieramy typy, które nie implementują `Comparable` bezpośrednio, ale rozszerzają typ, który to robi. Na pierwszy rzut oka jest to mało czytelne, ale nie spotkamy się z takimi deklaracjami zbyt często - najczęsciej tego typu złożoność występuje pod spodem bibliotek.

# Porównanie

*Bounded wildcard type* może mieć tylko jedno ograniczenie, a *bounded type parameter* wiele:

```
  type parameter bound     T extends Class & Interface1 & … & InterfaceN

  wildcard bound
      upper bound          ? extends SuperType
      lower bound          ? super   SubType
```

*Wildcard* używa się wtedy, gdy nie obchodzi nas właściwy typ parametru, bo nie będziemy nic z niego używać.

Uzupełniona tabelka z używanymi pojęciami w tym rozdziale:

<div class="table-wrapper" markdown="1">

{: .table .table-condensed .table-bordered}

| Pojęcie                 |  Przykład                          |
|-------------------------|------------------------------------|
| Raw type                | `List`                             |
| Parameterized type      | `List<String>`                     |
| Generic type            | `List<E>`                          |
| Formal type parameter   | `E`                                |
| Unbounded wildcard type | `List<?>`                          |
| Bounded type parameter  | `<E extends Number>`               |
| Recursive type bound    | `<T extends Comparable<T>>`        |
| Bounded wildcard type   | `List<? extends Number>`           |
| Generic method          | `static <E> List<E> asList(E[] a)` |
| Type token              | `String.class`                     |

</div>