---
layout:     post
titleSEO:	"Zwracanie kolekcji zamiast streamów"
title:      "Zwracanie kolekcji zamiast streamów"
subtitle:   ""
date:       2019-01-26 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	      Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    7
item:       47, 48
---

{% include effective-java/series-info.html %}

# Zwracanie kolekcji zamiast stremów

Pisząc metodę zwracającą sekwencję obiektów, powinniśmy przede wszystkim zwrócić jakiś typ kolekcji, a nie tylko `Stream`. No, chyba że jesteśmy pewni, że obiekty te będą używane tylko w streamie. Pisząc jakieś publiczne API najlepiej jest udostępnić obie wersje.

Zwracając na przykład tylko `Stream` sprawiamy, że klient nie będzie mógł w łatwy sposób przeitreować po elementach za pomocą pętli for-each. Niestety `Stream` nie rozszerza `Iterable`, chociaż mógłby. Żeby użyć go w pętli, trzeba by zrobić takie paskudztwo:

```java
// Hideous workaround to iterate over a stream
for  (ProcessHandle ph : (Iterable<ProcessHandle>)
    ProcessHandle.allProcesses()::iterator)
```

Już lepszym obejściem, gdy chcemy użyć elementów streamu w pętli, jest taki adapter:

```java
// Adapter from  Stream<E> to Iterable<E>
public static <E> Iterable<E> iterableOf(Stream<E> stream) {
    return stream::iterator;
}
```

Który można użyć potem tak:

```java
for (ProcessHandle p : iterableOf(ProcessHandle.allProcesses())) {
    // Process the process
}
```

Interfejs `Collection` jest podtypem `Iterable` i ma metodę `stream`, więc zwracając kolekcje mamy od razu dostęp do iteracji i streamów. Również zwykłe tablice udostępniają łatwy dostęp do tego dzięki `Arrays.asList` i `Stream.of`.

# Równoległe wykonywanie operacji na streamach

Od Javy 5 mamy bibliotekę `java.util.concurrent` która zawiera konkurencyjne kolekcje i *executor framework*. W Javie 7 dodano pakiet *fork-join*, czyli wydajny framwork do *parallel decomposition*. W Javie 8 dodano streamy, które mogą działać współbieżnie po wywołaniu tylko jednej metody - `parallel()`. Pisanie wielowątkowych programów staje się coraz łatwiejsze, ale napisanie ich, aby działały poprawnie i szybko jest tak samo trudne, jak to było wcześniej.


Rozważmy taki program:

```java
// Stream-based program to generate the first 20 Mersenne primes
public static void main(String[] args) {
    primes().map(p -> TWO.pow(p.intValueExact()).subtract(ONE))
        .filter(mersenne -> mersenne.isProbablePrime(50))
        .limit(20)
        .forEach(System.out::println);
}

static Stream<BigInteger> primes() {
    return Stream.iterate(TWO, BigInteger::nextProbablePrime);
}
```

Generuje on pierwsze 20 liczb pierwszych Mersenne’a, nie jest jednak ważne, co dokładnie to robi. Na moim laptopie zajmuje to około 14 sekund. Załóżmy teraz, że naiwnie chciałbym przyspieszyć ten proces, wywołując `parallel()`. Czy teraz będzie szybciej? Czy trochę wolniej? Niestety - nie pokaże się nic, a zużycie procesora wskoczy na 100%.

Co się stało? Ano biblioteka streamów nie ma pojęcia jak wykonać tę operację wielowątkowo. Nawet w dobrych warunkach, jeśli źródło streamu to `Stream.iterate` lub jest obecna operacja `limit`, to wywołanie `parallel()` nie przyniesie dobrego rezultatu.

Morał jest więc prosty - nie wywołujmy metody `parallel()` na streamie bezmyślnie.

Z reguły, najlepszy zysk na wydajności zyskujemy wtedy, gdy robimy streamy na instancjach klas takich jak: `ArrayList`, `HashMap`, `HashSet`, `ConcurrentHashMap` oraz tablicach i `IntStream.range()`/`LongStream.range()`, . 

To, co mają wspólnego, to to, że mogą być dokładnie i dosyć tanim kosztem podzielone na mniejsze części, co ułatwia rozdzielenie pracy pośród wiele wątków. Używany jest do tego *spliterator*, który jest zwracany przez wywołanie metody `spliterator()` na `Stream` lub `Iterable`.

Również specyfika końcowych operacji wpływa na efektywność współbieżnego przetwarzania. Jeśli więcej pracy jest wykonywane w operacji kończącej niż w tych modyfikujących, to wywołanie `parallel()` nie wiele zmieni.

Najlepsze operacje końcowe, które najlepiej działają współbieżnie to "redukcje", gdzie wszystkie elementy są łączone za pomocą jednej z metod redukujących w `Stream` lub gotowe metody takie jak `min`, `max`, `count` i `sum`. Równie dobrze sprawdzają się operację takie jak `anyMatch`, `allMatch`, i `noneMatch`. Do tej grupy nie należą jednak `collect`, która jest nieco bardziej kosztowna.

{: .note}
Używając zwykłego `forEach` na streamie, który używa wykonywany jest współbierznie, kolejność elementów nie zostanie zachowana. Aby dostać na koniec tę samą kolejność trzeba użyć `forEachOrdered`.

Nawet używając źródła streamu, które można łatwo podzielić na kawałki, mało kosztowne operacje kończące i niekolidujące obiekty funkcyjne, **nie uzyskamy lepszej wydajności z wywoływania `parallel` jeśli w streamie nie będą wykonywane ciężkie operacje, które przewyższą koszt przetwarzania wielowątkowego.**

Przykład streamu, gdzie równoległe wykonywanie ma sens i przynosi duży zysk wydajności:

```java
// Prime-counting stream pipeline - benefits from parallelization
static long pi(long n) {
    return LongStream.rangeClosed(2, n)
        .mapToObj(BigInteger::valueOf)
        .filter(i -> i.isProbablePrime(50))
        .count();
}
```
Na moim laptopie, policzenie tym prostym sposobem ilości liczb pierwszych mniejszych od 100 000 zajmuje 32 sekundy. Dodanie `parallel()`:

```
// Prime-counting stream pipeline - parallel version
static long pi(long n) {
    return LongStream.rangeClosed(2, n)
        .parallel()
        .mapToObj(BigInteger::valueOf)
        .filter(i -> i.isProbablePrime(50))
        .count();
}
```

redukuje czas do 9 sekund.