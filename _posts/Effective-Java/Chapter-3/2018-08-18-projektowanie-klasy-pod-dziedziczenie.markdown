---
layout:     post
titleSEO:	"Projektowanie klasy pod dziedziczenie"
title:      "Projektowanie klasy pod dziedziczenie"
subtitle:   "Na co zwrócić uwagę, jeśli uznamy, że jest stosowne"
date:       2018-08-18 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        false
chapter:    4
item:       19
---


{% include effective-java/series-info.html %}

W poprzednim poście była mowa o wadach dziedziczenia i kompozycji jako lepszego zamiennika. W tym wpisie omówię, o czym nie zapomnieć projektując klasę pod dziedziczenie, jeśli uznamy, że jest ono stosowne.

Jeśli projektujemy klasę do publicznego użytku, **powinniśmy jasno udokumentować to, czy metody, które jesteśmy w stanie nadpisać, używają pod spodem innych metod, które również mogą zostać nadpisane.** Jeśli ma to miejsce, to powinniśmy jasno opisać, jak to się dzieje. Jest do tego specjalne miejsce w Javadocach -  "Implementation Requirements", które jest generowane za pomocą tagu `@implSpec` (dodany w Javie 8).

Dla przykładu, dla `java.util.AbstractCollection` wygląda to tak:

> public boolean remove(Object o)
> 
> Removes a single instance of the specified element from this
> collection, if it is present (optional operation). More formally,
> removes an element `e` such that `Objects.equals(o, e)`, if this
> collection contains one or more such elements. Returns `true` if this
> collection contained the specified element (or equivalently, if this
> collection changed as a result of the call).
> 
> **Implementation Requirements:** This implementation iterates over the collection looking for the specified element. If it finds the element,
> it removes the element from the collection using the iterator's
> `remove` method. Note that this implementation throws an
> `UnsupportedOperationException` if the iterator returned by this
> collection's `iterator` method does not implement the `remove` method
> and this collection contains the specified object.

Jest to tu jasno udokumentowane, że nadpisywanie metody `iterator` będzie miało wpływ na zachowanie `remove`.

**Podając szczegóły implementacyjne, naruszamy enkapsulację i zobowiązujemy się nigdy tego nie zmieniać, ale jest to konsekwencja używania dziedziczenia.** Jest to wymagane, aby można było bezpiecznie tworzyć podklasy danej klasy.

**Musimy również zadbać, aby wszystkie kluczowe pola były dostępne dla podklas**. Jedyny sensowny sposób, aby przetestować naszą klasę, którą projektujemy pod dziedziczenie i przekonać się co jest niezbędne, to napisać kilka podklas (najlepiej, żeby przynajmniej jedna nie była pisana przez nas). Wtedy jasno zobaczymy, co powinniśmy ukryć, a co udostępnić podklasom.

Kolejną ważną rzeczą jest to, aby **konstruktory nie wywoływały metod, które mogą zostać nadpisane**. Jeśli ta metoda zależy od pola zainicjowanego przez konstruktor, to nie będzie wtedy działać prawidłowo. Konstruktor nadklasy wywoływany jest przed konstruktorem podklasy, więc nadpisana metoda podklasy będzie wywołana, zanim wywołany zostanie jej konstruktor. Przykład:

```java
public class Super {
    // Broken - constructor invokes an overridable method
    public Super() {
        overrideMe();
    }
    public void overrideMe() {
    }
}

public final class Sub extends Super {
    // Blank final, set by constructor
    private final Instant instant;

    Sub() {
        instant = Instant.now();
    }

    // Overriding method invoked by superclass constructor
    @Override 
    public void overrideMe() {
        System.out.println(instant);
    }

    public static void main(String[] args) {
        Sub sub = new Sub();
        sub.overrideMe();
    }
}
```

Spodziewalibyśmy się, że ten program pokaże nam `instant` dwa razy, a jak się okazuje, za pierwszym razem będzie to `null`. Tak jak była mowa wcześniej, metoda `overrideMe` została wywołana przez konstruktor `Super` zanim konstruktor podklasy `Sub` miał okazję ją zainicjować - łatwy sposób na `NullPointerException`.

Interfejsy `Cloneable` i `Serializable` stwarzają kolejne trudności, gdy projektujemy klasy pod dziedziczenie, więc musimy to wziąć pod uwagę lub po prostu zrezygnować z możliwości rozszerzania klasy, jeśli implementuje któryś z tych interfejsów.

Podsumowując, jeśli wyeliminujemy z klasy użycia wewnętrznych metod, które mogą zostać nadpisane i udokumentujemy to w przejrzysty sposób, to klasę będzie można dużo łatwiej rozszerzać i tworzyć jej podklasy. Jeśli nie zapewnimy tego, to podklasy mogą być zależne od detalów implementacyjnych nadklasy i mogą przestać działać, jeśli implementacja nadklasy się zmieni.