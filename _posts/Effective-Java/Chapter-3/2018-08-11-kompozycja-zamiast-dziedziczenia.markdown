---
layout:     post
titleSEO:   "Kompozycja zamiast dziedziczenia"
title:      "Kompozycja zamiast dziedziczenia"
subtitle:   "Dlaczego dziedziczenie nie zawsze jest dobre"
date:       2018-08-11 6:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    4
item:       18
---


{% include effective-java/series-info.html %}

# Dziedziczenie
Może się wydawać, że dziedziczenie jest fajnym sposobem na reużycie kodu, jednak nie zawsze jest to dobre rozwiązanie. Używane nieodpowiednio skutkuje oprogramowaniem słabej jakości. Dziedziczenie jest bezpieczne, jeśli jest używane tylko w obrębie pakietu, gdzie nadklasa i wszystkie podklasy są pod kontrolą, lub gdy rozszerzana klasa jest specjalnie do tego zaprojektowana (o tym będzie w następnym wpisie).

Oczywiście w tym wpisie, mówiąc o dziedziczeniu, mam na myśli tylko dziedziczenie klas (kiedy klasa rozszerza inną klasę). Omawiane tu problemy nie dotyczą dziedziczenia interfejsów (kiedy klasa implementuje interfejs lub gdy interfejs rozszerza inny interfejs).

Gdy klasa nie jest odpowiednio zaprojektowana do dziedziczenia, możemy natrafić na następujące problemy:

{: .note}
Większość z tych problemów ma mniejsze znaczenie, gdy tworzymy aplikację i wiemy, że tylko my i ewentualnie znajomi z którymi tworzymi projekt, będą jedynymi osobami, które korzystają z naszej klasy. Wtedy możemy naprawić wszelkie problemy i wprowadzić zmiany w dowolnym czasie.

- **Naruszona jest enkapsulacja** - poprawność działania podklasy zależy od detali implementacyjnych nadklasy. Implementacja nadklasy może się zmienić w następnej wersji i może to popsuć naszą podklasę, mimo że nie była nawet dotknięta.

Dla przykładu załóżmy, że potrzebujemy `HashSet`, który będzie zliczał, ile było prób dodania elementu. `HashSet` zawiera dwie metody, które są w stanie dodawać elementy: `add` i `addAll`, więc możemy je obie nadpisać, używając dodatkowo licznika:

```java
// Broken - Inappropriate use of inheritance!
public class InstrumentedHashSet<E> extends HashSet<E> {
    // The number of attempted element insertions
    private int addCount = 0;


    public InstrumentedHashSet() {
    }


    public InstrumentedHashSet(int initCap, float loadFactor) {
        super(initCap, loadFactor);
    }

    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);
    }

    public int getAddCount() {
        return addCount;
    }
}
```

Wygląda w porządku? Niby tak, ale nie działa. Spróbujmy dodać elementy za pomocą metody `addAll`:

```java
InstrumentedHashSet<String> s = new InstrumentedHashSet<>();  
s.addAll(List.of("Snap", "Crackle", "Pop"));//Java 9
```

Spodziewalibyśmy się, że `getAddCount` zwróci 3, ale zwraca 6. Dlaczego? Ano dlatego, że metoda `addAll` w `HashSet` pod spodem wykorzystuje metodę `add` dla każdego elementu.

Moglibyśmy to "naprawić" nie nadpisując metody `addAll`, ale wtedy nasz klasa zależałaby od tego szczegółu implementacyjnego, który może się zmienić w kolejnej wersji i byłaby niestabilna.

Nieco lepszym rozwiązaniem byłoby nadpisać metodę `addAll`, aby iterowała po każdym elemencie, wywołując `add`. Wtedy mielibyśmy zagwarantowany poprawny wynik, bez bycia uzależnionym od implementacji `HashSet`. Nie rozwiązuje to jednak wszystkich problemów. W ten sposób musielibyśmy nadpisywać wszystkie metody, które używają innych wewnętrznych metod, co może być trudne, nieodporne na błędy, czasochłonne, a czasem może to być w ogóle niemożliwe - jeśli metoda operuje na zmiennych prywatnych.

- **Podklasy nie są stabilne i bezpieczne w użyciu** - załóżmy, że bezpieczeństwo programu zależy od tego, że wszystkie elementy dodane do kolekcji spełniają określony warunek. Można by to zaimplementować, rozszerzając klasę kolekcji i nadpisać wszystkie metody, które umożliwiają dodawanie elementów, tak by sprawdzały ten warunek. To będzie działać tylko do momentu, gdy do klasy w kolejnej wersji nie zostanie dodana nowa metoda, pozwalająca dodawać elementy. Kiedy to się stanie, będzie można dodać nielegalne elementy do kolekcji, używając nowej metody (dopóki dziura ta nie zostanie załatana). I to nie jest tylko teoretyczny problem. Takie sytuacje miały miejsce, gdy `Hashtable` i `Vector` były modernizowane, aby były częścią *Collections Framework*.

- Jeśli mamy wyjątkowego pecha, to gdy rozszerzamy klasę i będziemy mieć w niej metodę o sygnaturze, która pojawi się również w nowym wydaniu klasy, którą rozszerzamy, to nasz program przestanie się kompilować.

- Rozbudowane hierarchie dziedziczenia utrudniają również analizę kodu i testowanie.

Jest bardzo dobra alternatywa dla dziedziczenia, która pozwala uniknąć wszystkich tych problemów.

# Kompozycja
Zamiast rozszerzać klasę, możemy zadeklarować ją jako pole prywatne w naszej nowej klasie i wywoływać jej odpowiadające metody. Jest to znane jako delegacja (ang. *forwarding*). W rezultacie otrzymamy solidną klasę, która w ogóle nie zależy od detalów implementacyjnych istniejącej klasy. Również dodawanie do niej nowych metod nie będzie miało wpływu na naszą klasę.


Z koleii jeśli chcielibyśmy w pełni funkcjonalną klasę (a nie używać tylko kilka jej metod), to możemy stworzyć klasę delegującą wszystkie metody:

```java
// Reusable forwarding class
public class ForwardingSet<E> implements Set<E> {
    private final Set<E> s;
    public ForwardingSet(Set<E> s) { this.s = s; }
    public void clear() { s.clear(); }
    public boolean contains(Object o) { return s.contains(o); }
    public boolean isEmpty() { return s.isEmpty(); }
    public int size() { return s.size(); }
    public Iterator<E> iterator() { return s.iterator(); }
    public boolean add(E e) { return s.add(e); }
    public boolean remove(Object o) { return s.remove(o); }
    public boolean containsAll(Collection<?> c) { return s.containsAll(c); }
    public boolean addAll(Collection<? extends E> c) { return s.addAll(c); }
    public boolean removeAll(Collection<?> c) { return s.removeAll(c); }
    public boolean retainAll(Collection<?> c) { return s.retainAll(c); }
    public Object[] toArray() { return s.toArray(); }
    public <T> T[] toArray(T[] a) { return s.toArray(a); }
    @Override
    public boolean equals(Object o) { return s.equals(o); }
    @Override
    public int hashCode() { return s.hashCode(); }
    @Override
    public String toString() { return s.toString(); }
}
```

{: .note}
Pisanie takich klas jest dosyć żmudne, ale wystarczy to zrobić tylko raz dla konkretnego interfejsu i możemy to reużywać dla każdej implementacji. [Guava](https://github.com/google/guava) dostarcza nam klasy delegujące do wszystkich interfejsów kolekcji.

Następnie rozszerzamy ją w naszej klasie docelowej, nadpisując tylko dane metody:

```java
// Wrapper class - uses composition in place of inheritance
public class InstrumentedSet<E> extends ForwardingSet<E> {
    private int addCount = 0;
    
    public InstrumentedSet(Set<E> s) {
        super(s);
    }
    
    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
     }
     
     @Override
     public boolean addAll(Collection<? extends E> c) {
         addCount += c.size();
         return super.addAll(c);
     }
     
     public int getAddCount() {
         return addCount;
     }
}
```
Dzięki temu mamy całkowicie niezależną klasę. Ten sposób jest również bardzo elastyczny. Będzie z nim działać dowolny set:

```java
Set<Instant> times = new InstrumentedSet<>(new TreeSet<>(cmp));  
Set<E> s = new InstrumentedSet<>(new HashSet<>(INIT_CAPACITY));
```

Klasa `InstrumentedSet` jest tak zwanym *wrapperem* bo każda jej instancja zawiera (wrapuje) inną instancję `Set` i dodaje jej funkcję zliczania prób dodania elementów. Jest to znane także jako wzorzec projektowy - Dekorator.

Dziedziczenie jest odpowiednie tylko wtedy, kiedy podklasa naprawdę jest podtypem danej klasy. Tzn. między nimi jest relacja "jest". Jeśli zastanawiamy się, czy klasa B powinna rozszerzać A, powinniśmy sobie zadać pytanie, czy na pewno B jest też A. Jeśli mamy ku temu wątpliwości to powinniśmy zastosować kompozycję.

Zasadę tą narusza wiele klas w standardowej bibliotece Javy. Np. `Stack` nie jest `Vector`-e, więc nie powinien go rozszerzać. Podobnie klasa `Properites` nie powinna rozszerzać `Hashtable`. W obu przypadkach powinna być zastosowana kompozycja.

Inną sprawą jest czy potrzebujemy rzeczywiście wszystkich metod z nadklasy? Czy w metodach nadklas są jakiekolwiek wady? Używając kompozycji, możemy zaprojektować całkiem nowe API i pozbyć się wszelkich wad.

Podsumowując, dziedziczenie jest problematyczne, szczególnie jeśli podklasy są w innych pakietach i klasa nie została odpowiednio zaprojektowana do dziedziczenia. Powinniśmy je stosować tylko w przypadku, gdy autentycznie mamy do czynienia z pełnoprawnym podtypem danej klasy. W każdej innej sytuacji warto użyć kompozycji i delegowania.