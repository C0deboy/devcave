---
layout:     post
titleSEO:	"Nie używaj surowych typów"
title:      "Nie używaj surowych typów"
subtitle:   "Preferuj typy parametryzowane"
date:       2018-09-15 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    5
item:       26
---

{% include effective-java/series-info.html %}


Klasa lub interfejs, która ma jeden lub więcej typ parametru jest generyczną klasą/interfejsem (inaczej typy generyczne, generyki). Np. interfejs `List` ma pojedynczy typ parametru  - `E`, który odpowiada typowi elementów w liście. Pełna deklaracja wygląda tak: `List<E>`. Jest to więc interfejs generyczny.

Generyki są już z nami od Javy 5 i znacznie ułatwiły życie - wcześniej trzeba było castować każdy obiekt zwracany z kolekcji, a błędy z tym związane pojawiały się dopierto w *runtime*.  Mianowicie jeśli znalazłby się tam jakiś nieprawidłowy obiekt to dostalibyśmy `ClassCastException` podczas wykonywania programu. Używając generyków mówimy kompilatorowi jakich typów używamy i takie błędy wykrywane są już podczas kompilacji. Dzięki temu mamy zwiększone *type safty* i zwiększoną czytelność (brak castowania). W tym rozdziale przyjrzymy się jak wyciągnąć z generyków jak najwięcej i jak ominąć komplikacje.

# Unikaj typów prostych

Każdy generyk ma swój typ prosty (ang. raw type) - sama nazwa bez parametrów typu.  Czyli dla `List<E>` jest to `List`. Typy proste zachowują się tak jakby wszystkie generyczne informacje zostały usunięte i istnieją ze względu na kompatybilność wsteczną. **Nie powinno się ich używać.**

Przykład:

```java
// Raw collection type - don't do this!
  
// My stamp collection. Contains only Stamp instances.  
private final  Collection  stamps = ... ;
```

Kolekcja służy do przechowywania instancji klasy `Stamp`. Jeśli gdzieś po drodze wpadnie tam instancja klasy `Coin`:

```java
// Erroneous insertion of coin into stamp collection
stamps.add(new Coin( ... )); // Emits "unchecked call" warning
```

to skompiluje się to bez żadnego erroru. Błąd pojawi się dopiero wtedy, gdy wystąpi próba wyciągnięcia instancji `Coin` z kolekcji:

```java
// Raw iterator type - don't do this! 
for (Iterator  i = stamps.iterator(); i.hasNext(); ) {
    Stamp stamp = (Stamp) i.next(); // Throws ClassCastException
}
```

Kompilator nie może nam pomóc wcześniej bo nie wie, że tam mogą lądować tylko obiekty typu `Stamp`.

Używając parametryzowanego typu, jasno to precyzujemy i kompilator jest w stanie nam wykryć taki błąd:

```java
// Parameterized collection type - typesafe
private final  Collection<Stamp>  stamps = ... ;
```

Ta klasa skompiluje się tylko wtedy, kiedy typy będą się zgadzać. W innym wypadku dostaniemy komunikat:

```
Test.java:9: error: incompatible types: Coin cannot be converted  
to Stamp  
c.add(new Coin());  
^
```

{: .note}
Kompilator zastępuje wszystkie typy parametryzowane podczas kompilacji i wstawia casty wszędzie tam, gdzie pobierane są elementy. Informacje generyczne nie istnieją w skompilowanych klasach. Gwarantuje to *type safty*.

Jeśli chcemy używać `List` do przetrzymywania dowolnych obiektów, to zamiast gołego `List` powinniśmy użyć `List<Object>`. Wtedy mamy *type safety* i jeśli zrobimy coś źle to program nam się nie skompiluje.

Z kolei jeśli typ jest nieznany lub nie ma znaczenia to powinniśmy użyć *unbounded wildcard types*, czyli znaku zapytania zamiast typu.

Dla typu generycznego `Set<E>`, *unbounded wildcard type* wygląda tak `Set<?>`. Oznacza to, że możemy przekazać jakikolwiek `Set` i nie potrzebujemy żadnej informacji o typie. Po prostu nie będziemy go używać, bo wystarczą nam metody, które nie wymagają konkretnych typów.

Złe użycie z gołymi typami:

```java
// Use of raw type for unknown element type - don't do this!
static int numElementsInCommon(Set s1, Set s2) {
    int result = 0;
    for (Object o1 : s1)
        if (s2.contains(o1))
            result++;
    return result;
}
```

Dobre użycie z *unbounded wildcard type*:

```java
// Uses unbounded wildcard type - typesafe and flexible 
static int numElementsInCommon(Set<?> s1, Set<?> s2) { ... }
```

Różnica między `Set<?>` i `Set` jest taka, że ten pierwszy jest *type safe*. Jasno deklarujemy, że nie obchodzi nas typ i że będziemy używać tylko metod, które od niego nie zależą. W konsekwencji nie możemy wrzucać żadnych elementów do kolekcji - w przeciwieństwie do gołego typu, który pozwala na wrzucenie czegokolwiek.

Jeśli takie ograniczenie nam nie pasuje to powinniśmy użyć metody generycznej lub *bounded wildcard type*.

Czasem jednak trzeba używać gołych typów m.in. gdy używamy:

-  literałów klasy - parametryczne są niedozwolone przez specyfikację - `List.class`, `String[].class` i `int.class` są cacy, ale `List<String>.class` i `List<?>.class` są nie cacy.

- operatora `instanceof` - wynika to z tego, że generyczne typy są usuwane w runtimie. Możemy użyć *unbounded wildcard* (?), ale nie wpływa to w żaden sposób na `instanceof`, więc to tylko zaśmieca kod.  Dlatego używając `instanceof` powinniśmy podawać zawsze goły typ:

```java
// Legitimate use of raw type - instanceof operator
if (o instanceof Set) { // Raw type
    Set<?> s = (Set<?>) o; // Wildcard type
    //...
}
```

{: .note}
Ustaliliśmy, że `o` ma typ `Set`, więc castujemy to na  *wildcard type* `Set<?>`, a nie na surowy typ `Set`. To jest sprawdzone castowanie, więc kompilator nie będzie rzucał "unchecked cast" warningami.

Podsumowując, używanie gołych typów opóźnia wykrywanie błędów i nie wnosi żadnych korzyści, dlatego nie powinniśmy ich używać. W Javie są obecne tylko ze względów kompatybilności wstecznej.

Tabelka z używanymi tu pojęciami i tymi, które będą używane w późniejszych wpisach:

<div class="table-wrapper" markdown="1">

{: .table .table-condensed .table-bordered}

| Pojęcie                 |  Przykład                               |
|----------------------|------------------------------------|
| Raw type                | `List`                                 |
| Parameterized type      | `List<String>`                        |
| Actual type parameter   | `String`                               |
| Generic type            | `List<E>`                              |
| Formal type parameter   | `E`                                     |
| Unbounded wildcard type | `List<?>`                              |
| Bounded type parameter  | `<E extends Number>`                  |
| Recursive type bound    | `<T extends Comparable<T>>`          |
| Bounded wildcard type   | `List<? extends Number>`             |
| Generic method          | `static <E> List<E> asList(E[] a)`  |
| Type token              | `String.class`                         |

</div>