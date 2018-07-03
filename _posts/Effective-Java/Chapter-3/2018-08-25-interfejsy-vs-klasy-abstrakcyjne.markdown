---
layout:     post
titleSEO:	"Interfejsy vs klasy abstrakcyjne - dlaczego warto preferować interfejsy?"
title:      "Interfejsy vs klasy abstrakcyjne"
subtitle:   "Dlaczego warto preferować interfejsy?"
date:       2018-08-25 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        false
chapter:    4
item:       20
---

{% include effective-java/series-info.html %}

W Javie mamy dwa mechanizmy do definiowania typu, który może mieć różne implementacje: interfejsy i klasy abstrakcyjne.

Od dodania metod domyślnych do interfejsów (Java 8), obydwa mechanizmy pozwalają na zdefiniowanie domyślnej implementacji dla niektórych metod. To, co je od siebie najbardziej odróżnia to to, że aby zaimplementować typ zdefiniowany przez klasę abstrakcyjną, trzeba ją rozszerzyć. **Ze względu na to, że w Javie klasa może być podklasą tylko jednej klasy (*single inheritance*), to jest to spore ograniczenie.** W przypadku interfejsów, takiego ograniczenia nie ma i klasa może implementować wiele interfejsów. To właśnie tu głównie wygrywają interfejsy.

**Istniejące klasy mogą w łatwy sposób implementować nowy interfejs.** Wystarczy, że dodamy `implements NazwaInterfejsu`, lub dodamy nowy po przecinku i dodamy wszystkie wymagane metody. Przykładowo, wiele istniejących klas w Javie zostało rozbudowanych, aby implementowały `Comparable`, `Iterable` i `Autocloseable`, kiedy te zostały dodane do biblioteki. **Istniejące klasy nie mogą być rozbudowane tak, aby rozszerzały kolejną nową klasę abstrakcyjną.** Aby zasymulować, że nasza klasa rozszerza obydwie klasy, musielibyśmy je obie dać wyżej w hierarchii:

<pre style="display: inline; border: none">
AbstractC
    └── AbstractB
            └── ConcrateA
</pre>

Niestety psuje to całą hierarchię typów, bo wszystkie klasy, które rozszerzały `B` są zmuszone od teraz implementować `C`, bez względu czy tego chcemy, czy nie.

**Interfejsy są idealnymi mixinami.** Upraszczając, *mixin* jest typem, który klasa może (dodatkowo do swojego podstawowego typu) zaimplementować, dostarczając dodatkową, odseparowaną funkcjonalność. *Mixin* sam w sobie nie może zostać zinstancjowany - jest tylko częścią funkcjonalności innych klas. Dla przykładu, `Comparable` jest mixinem, który deklaruje i dodaje klasie funkcjonalność porównywania i tym samym porządkowania jej instancji.  Klasy abstrakcyjne nie mogą być *mixinami* z tego samego powodu co wcześniej - klasa może rozszerzać tylko jedną klasę.

**Interfejsy nie tworzą sztywnych hierarchii, dzięki czemu są bardzo elastyczne**.  Dla przykładu, mamy piosenkarza:

```java
public interface Singer {
    AudioClip sing(Song s);
}
```

i kompozytora:

```java
public interface Songwriter {
    Song compose(int chartPosition);
}
```

Dzięki temu, że użyliśmy interfejsów, konkretna klasa może implementować zarówno `Singer` jak i `Songwriter` - tak jak to jest w prawdziwym życiu - piosenkarz jest często kompozytorem. W przypadku klas abstrakcyjnych moglibyśmy być tylko jednym albo drugim.

Idąc dalej, mamy jeszcze dużo więcej elastyczności. Przykładowo możemy stworzyć dodatkowy typ, który łączy oba poprzednie i dodaje nowe funkcje, które są odpowiednie dla obu ról:

```java
public interface SingerSongwriter extends Singer, Songwriter {
    AudioClip strum();

    void actSensitive();
}
```

I nie ma problemu, aby istniejąca klasa, która implementuje już `Singer`, `Songwriter` (i nie może zostać zmieniona), implementowała `SingerSongwriter`:

```java
public class Concret implements Singer, Songwriter, SingerSongwriter {

    @Override
    public AudioClip strum() {
        return null;
    }

    @Override
    public void actSensitive() {
    }

    @Override
    public AudioClip sing(Song s) {
        return null;
    }

    @Override
    public Song compose(int chartPosition) {
        return null;
    }
}
```
Taka elastyczność nie jest często potrzebna, no ale gdyby tak się stało, to mamy taką możliwość.

**Możemy też połączyć zalety interfejsów i klas abstrakcyjnych tworząc coś w rodzaju szkieletu klasy implementującej dany interfejs.** Interfejs będzie odpowiadał za typ, być może dostarczy też kilka domyślnych metod, podczas gdy klasa abstrakcyjna dostarczy domyślne implementacje metod z interfejsu, które nie mogły być w nim zadeklarowane jako `defualt`. Anglojęzyczny termin takiego zabiegu to *skeletal implementation class*.

{: .note}
Jeśli jesteśmy w stanie zdefiniować metody domyślne w interfejsie, to klasa abstrakcyjna nie będzie nam potrzebna. Zależne jest to od tego, czy metody te operują na stanie, czy nie. W interfejsie jest to niemożliwe.

Zazwyczaj takie klasy abstrakcyjne nazywa się `AbstractNazwaInterfejsu`.

Przykładowa klasa:

```java
// Skeletal implementation class
public abstract class AbstractMapEntry<K, V> implements Map.Entry<K, V> {
    // Entries in a modifiable map must override this method
    @Override
    public V setValue(V value) {
        throw new UnsupportedOperationException();
    }

    // Implements the general contract of Map.Entry.equals
    @Override
    public boolean equals(Object o) {
        if (o == this) {
            return true;
        }
        if (!(o instanceof Map.Entry)) {
            return false;
        }

        Map.Entry<?, ?> e = (Map.Entry) o;
        return Objects.equals(e.getKey(), getKey())
            && Objects.equals(e.getValue(), getValue());
    }

    // Implements the general contract of Map.Entry.hashCode
    @Override
    public int hashCode() {
        return Objects.hashCode(getKey()) ^ Objects.hashCode(getValue());
    }

    @Override
    public String toString() {
        return getKey() + "=" + getValue();
    }
}
```

{: .note}
Ta implementacja metod nie mogłaby być bezpośrednio w interfejsie, ponieważ domyślne metody interfejsu nie pozwalają na nadpisywanie metod jak `equals`, `hashCode` czy `toString`.

 Przykłady znajdziemy też w standardowym *Collections Framework* - `AbstractCollection`, `AbstractSet`, `AbstractList`, i `AbstractMap`. Takie klasy mogą bardzo ułatwić pisanie implementacji interfejsu. Dla przykładu, podaję [static factory method]({% post_url Effective-Java/Chapter-1/2018-04-14-static-factory-method-zamiast-konstruktora %}), która tworzy w pełni funkcjonalną implementację `List`, zbudowaną na `AbstractList` (w formie klasy anonimowej) z tablicy intów:

```java
// Concrete implementation built atop skeletal implementation
static List<Integer> intArrayAsList(int[] a) {
    Objects.requireNonNull(a);

    // The diamond operator is only legal here in Java 9 and later
    // If you're using an earlier release, specify <Integer>
    return new AbstractList<>() {
        @Override
        public Integer get(int i) {
            return a[i]; // Autoboxing
        }

        @Override
        public Integer set(int i, Integer val) {
            int oldVal = a[i];
            a[i] = val; // Auto-unboxing
            return oldVal; // Autoboxing
        }

        @Override
        public int size() {
            return a.length;
        }
    };
}
```
Jeśli zobaczymy ile `List` udostępnia funkcji, to zdamy sobie sprawę, że masa funkcjonalności została nam dostarczona za darmo.

{: .note}
Przykład jest też wzorcem projektowym  *Adapter* - pozwala używać tablicy `int` jako `List<Integer>`.

Innym wariantem *skeletal implementation* jest  *simple implementation,* której przykładem jest  `AbstractMap.SimpleEntry` w standardowej bibliotece Javy. *Simple implementation* jest jak *skeletal implementation* ale nie jest to klasa abstrakcyjna. Jest to możliwe najprostsza, działająca implementacja. Można jej używać taka jaka jest lub rozszerzać, modyfikując zachowanie.

Jako ze obydwie implementację są zaprojektowane pod dziedziczenie, to warto korzystać ze wskazówek z poprzedniego postu na temat [projaktowania klasy pod dziedziczenie]({% post_url Effective-Java/Chapter-3/2018-08-18-projektowanie-klasy-pod-dziedziczenie %}).

Klasy *skeletal implementation* dostarczają nam zaletę częściowej implementacji z klas abstrakcyjnych, bez narzucania ograniczeń jakie stwarzają, gdy są używane jako definicję typu. Mamy też dowolność czy chcemy skorzystać z klasy abstrakcyjnej czy zaimplementować interfejs bezpośrednio.

Podsumowując, interfejsy są najlepszym sposobem na zdefiniowanie typu, który pozwala na różne implementacje. Gdy mamy do czynienia z rozbudowanym interfejsem, którego metody mogą mięć domyślną implementację, można rozważyć napisanie *skeletal implementation class*. Jeśli mamy taką możliwość, to możemy się ograniczyć tylko do metod domyślnych w interfejsie.