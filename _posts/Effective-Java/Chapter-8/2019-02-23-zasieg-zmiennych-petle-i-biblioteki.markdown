---
layout:     post
titleSEO:   "Zasięg zmiennych, pętle i biblioteki"
title:      "Zasięg zmiennych, pętle i biblioteki"
subtitle:   "Kolejna porcja dobrych praktyk"
date:       2019-02-23 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    9
item:       57, 58, 59
---

{% include effective-java/series-info.html %}

W tym rozdziale jest zawarta kolejna porcja dobrych praktyk dla featureów Javy. Będzie też o refleksji, natywnych metodach i optymalizacji.
Jednak to potem, najpierw trzy pierwsze tematy:

# Minimalizowanie zasięgu zmiennych

Dlaczego jest to ważne? Ano sprawia, że kod jest bardziej czytelny i mniej podatny na błedy. 

Zmienne powinny być deklarowane najbliżej pierwszego użycia. W przeciwnym wypadku będzie to zaśmiecać inny niepowiązany kawałek kodu i wprowadzać chaos. 

Deklarując zmienną zbyt wcześnie, nie tylko sprawiamy, że zasięg zaczyna się zbyt wcześnie, ale też kończy zbyt późno. Raczej nie powinno się rozdzielać deklaracji od zainicializowania, jedynym wyjątkiem tutaj jest try catch, gdzie jest to wymuszone.

Pętle oferują dodatkową możliwość na zmniejszenie zasięgu zmiennych. Możemy w nich zadeklarować zmienne pętli, w rezultacie ograniczając ich zasięg tylko do pętli. 

Jednak preferowany sposób na iterowanie po kolekcji to:

```java
// Preferred idiom for iterating over a collection or array
for (Element e : c) {
    ... // Do Something with e
}
```

Jeśli potrzebujemy dostępu do iteratora, np. żeby wywołać metodę `remove()` to:

```java
// Idiom for iterating when you need the iterator
for (Iterator<Element> i = c.iterator(); i.hasNext(); ) {
    Element e = i.next();
    ... // Do something with e and i
}
```

Dlaczego te są preferowane, a nie pętle while? Prosty przykład:

```java
Iterator<Element> i = c.iterator();
while (i.hasNext()) {
    doSomething(i.next());
}
...
Iterator<Element> i2 = c2.iterator();
while (i.hasNext()) {             // BUG!
    doSomethingElse(i2.next());
}
```

Druga pętla przez przypadek używa pierwszego iteratora, który nadal jest w zasięgu. Kod kompiluje się i wykonuje bez błędu.

W przypadku zwykłych pętli nie ma takiej opcji:

```java
for (Iterator<Element> i = c.iterator(); i.hasNext(); ) {
    Element e = i.next();
    ... // Do something with e and i
}
...

// Compile-time error - cannot find symbol i
for (Iterator<Element> i2 = c2.iterator(); i.hasNext(); ) {
    Element e2 = i2.next();
    ... // Do something with e2 and i2
}
```

Tu inny przykład na minimalizowanie zasięgu zmiennej:

```java
for (int i = 0, n = expensiveComputation(); i < n; i++) {
    ... // Do something with i;
}
```

Deklarujmy 2 zmienne pętli, aby uniknąć kosztownego i niepotrzebnego obliczania `n` w każdej iteracji pętli jednocześnie ograniczając jej zasięg tylko do pętli.

Ostatnią ogólną dobrą techniką minimalizowania zasięgu zmiennych jest utrzymywanie metod krótkich i konkretnych. Jeśli połączone są 2 czynności w jednej metodzie i mają zmienne wymieszane między sobą, to dobrze jest je rozdzielić.

# Preferuj pętle for-each

Lekcja w tym temacie jest dosyć oczywista i wydaje mi się, że powszechnie stosowana, więc tylko na szybko - używaj zawsze for-each, jeśli nie potrzebujesz dostępu do indexu.

Redukuje to boilerplate, zmniejsza szum, przez co kod jest bardziej czytelny, oraz nie mamy możliwości popełnienia błędu:

```java
// The preferred idiom for iterating over collections and arrays
for (Element e : elements) {
    ... // Do something with e
}
```

Co jest ważne - nie ma tu utraty wydajności czy jakiegoś innego skutku ubocznego - kod kompiluje się do niemal identycznej tradycyjnej pętli.

Te pętle też są łatwiejsze w użyciu w przypadku zagnieżdżonych pętli. Ze zwykłymi pętlami można zrobić następujący błąd:

```java
// Can you spot the bug?
enum Suit { CLUB, DIAMOND, HEART, SPADE }
enum Rank { ACE, DEUCE, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT,
            NINE, TEN, JACK, QUEEN, KING }
...
static Collection<Suit> suits = Arrays.asList(Suit.values());
static Collection<Rank> ranks = Arrays.asList(Rank.values());

List<Card> deck = new ArrayList<>();
for (Iterator<Suit> i = suits.iterator(); i.hasNext(); )
    for (Iterator<Rank> j = ranks.iterator(); j.hasNext(); )
        deck.add(new Card(i.next(), j.next()));
```

Widzisz go? Metoda `next()` dla `i` jest wywoływana w złym miejscu. Powinna być wywołana wcześniej:

```java
// Fixed, but ugly - you can do better!
for (Iterator<Suit> i = suits.iterator(); i.hasNext(); ) {
    Suit suit = i.next();
    for (Iterator<Rank> j = ranks.iterator(); j.hasNext(); )
        deck.add(new Card(suit, j.next()));
}
```

Teraz działa, jednak jest to mało czytelne - dużo lepiej jest używać po prostu for-each:

```java
// Preferred idiom for nested iteration on collections and arrays
for (Suit suit : suits)
    for (Rank rank : ranks)
        deck.add(new Card(suit, rank));
```

Jednak są 3 sytuacje, kiedy nie zrobimy z nich użytku:

- Gdy chcemy usunąć elementy z kolekcji. Wtedy musimy skorzystać z iteratora lub lepiej - użyć dodanej w Javie 8 metody `removeIf` do kolekcji.
- Gdy chcemy podmienić jakieś elementy
- Współbieżne iterowanie

Warto zaznaczyć fakt, że możemy iterować pętlą for-each po każdym obiekcie, który implementuje `Iterable`. 

# Poznaj i używaj biblioteki

Trzeci temat mówi o ważności znajomości bibliotek i o tym, by nie wynajdować koła na nowo.
 
Weźmy na przykład, że chcemy wygenerować losowe liczby od 0 do n. Natykając się na tak powszechny problem, możesz być niemal pewny, że ktoś już stworzył do tego dobrze działający algorytm.

By napisać samemu taki algorytm, musiałbyś sporo wiedzieć o pseudolosowych generatorach liczb, teorii liczb i kodzie uzupełnień do dwóch. Na szczęście ten problem mamy już rozwiązany w Javie.

Od Javy 7 nie powinniśmy już używać do tego klasy `Random`. Dla większości użyć dobrym wyborem jest `ThreadLocalRandom`. Produkuje lepszej jakości liczby losowe i jest dużo szybszy od poprzednika. Dla `ForkJoinPool` i współbieżnych streamów używaj `SplittableRandom`.

Drugą przewagą bibliotek jest to, że nie musisz tracić czasu na rzeźbienie rozwiązań dla niepowiązanych zbytnio z aplikacją powszechnym problemów, a możesz skupić się na tworzeniu aplikacji i jej funkcjonalności.

Kolejną przewagą jest to, że biblioteki najczęściej są cały czas rozwijane (czasem przez całe zespoły) i testowane przez tysiące użytkowników, więc dostajemy solidne, wydajne i przetestowane rozwiązanie niemal za darmo.

Mimo tylu zalet dużo programistów nadal nie używa bibliotek w pełni - czemu? Najprawdopodobniej
 dlatego, że ich do końca nie znają. Dlatego ważne jest, żeby zaznajamiać się z każdymi nowościami wchodzącymi do Javy i innych bibliotek. Często wprowadzane jest wiele usprawnień, które znacznie poprawiają choćby czytelność i kod klienta.

 Kompletnie podstawowym zestawem bibliotek każdego programisty powinny być przynajmniej te z:
- java.lang
- java.util
- java.io
- collections  framkework
- biblioteka stremów
- java.util.concurrent

Jeśli nie możesz znaleźć czegoś w bibliotekach Javy, następnym dobrym wyborem mogą być biblioteki firm trzecich jak np. googlowska [Guava](https://github.com/google/guava).

Podsumowując, zmierzając się z jakimiś powszechnym problemem, nie wynajduj koła na nowo - używaj bibliotek w jak najbardziej efektywny sposób, a do rzeźbienia czegoś samemu zabieraj się tylko wtedy, gdy żadna biblioteka nie spełnia twoich potrzeb.