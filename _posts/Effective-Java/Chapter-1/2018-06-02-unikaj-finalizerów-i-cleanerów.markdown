---
layout:     post
titleSEO:	"Finalizery i Cleanery - dlaczego powinniśmy ich unikać?"
title:      "Finalizery i Cleanery"
subtitle:   "Dlaczego powinniśmy ich unikać?"
date:       2018-06-02 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    2
item:       8
---

{% include /effective-java/series-info.html %}

# Finalizery
Metoda `finalize()`  jest zdefiniowana w `Object` i jest nazywana *finalizerem*. Możemy nadpisać jej zachowanie w dowolnym obiekcie. Została stworzona głównie do tego, aby można było zwolnić zasoby używane przez dany obiekt, kiedy ten zostanie usunięty z pamięci.

Metoda `finalize()` jest więc odpalana wtedy, kiedy *garbage collector* stwierdzi, że nie ma już referencji do danej klasy.

**W praktyce może to nigdy nie nastąpić**, dlatego nasz program nigdy nie powinien polegać na metodzie `finalize()`. To kiedy *garbage collector* zostanie odpalony jest uzależnione od konkretnej implementacji JVM jak i systemu.  Dlatego  jej zachowanie jest nieprzewidywalne i źle wpływa na przenośność programu (różne zachowanie na różnych systemach). Ma też negatywny wpływ na wydajność, bo JVM musi wykonać dużo więcej operacji podczas tworzenia i usuwania obiektów, które mają nadpisaną metodę `finalize()`.

Kolejnym problemem jest to, że finalizery nie kontrolują wyjątków - jeśli finalizer rzuci wyjątek, to jego process zostaje przerwany, wyjątek zostaje zignorowany, a nasz obiekt pozostawiony w niepoprawnym stanie bez żadnej informacji.

Ponadto używanie finalizerów jest często zbędne.

Swoją drogą, od Javy 9 metoda `finalize()` jest *deprecated* - głównie z wymienionych przeze mnie powodów, a w miejsce finalizerów powstały cleanery. Jako dowód zostawiam oficjalne uzasadnienie:

> _Finalizers are inherently problematic and their use can lead to performance issues, deadlocks, hangs, and other problematic behavior_.
> Furthermore, the timing of finalization is unpredictable with no guarantee that a finalizer will be called. Classes whose instances hold non-heap resources should provide a method to enable explicit release of those resources, and they should also implement  `java.lang.AutoCloseable`  if appropriate.

# Cleanery
Cleanery są mniej niebezpieczne niż finalizery (np. rozwiązują problem finalizerów z kontrolowaniem wyjątków), jednak nadal są nieprzewidywalne, wolne i również często zbędne.

Czy w takim razie cleanery i finalizery są do czegoś w ogóle potrzebne? Jednym z niewielu przypadków kiedy ich użycie może być uzasadnione, to gdy służą jako "siatka bezpieczeństwa" - czyli w przypadku, gdy metoda `close()` nie zostanie wywołana na zasobie przez jego właściciela. Nie jest zagwarantowane kiedy się to stanie, ale lepiej późno niż wcale.

Jednak zanim się na to zdecydujemy, trzeba się dobrze zastanowić, czy jest to warte kosztu takiego rozwiązania.

Niektóre klasy standardowe Javy (np. `FileInputStream`, `FileOutputStream`, `ThreadPoolExectuor` czy `java.sql.Connection`) mają finalizery, które służą właśnie jako taka "siatka bezpieczeństwa".

Spróbujmy zobrazować to na przykładzie klasy `Room`:

```java
public class Room implements AutoCloseable {
    private static final Cleaner cleaner = Cleaner.create();

    // Resource that requires cleaning. Must not refer to Room!
    private static class State implements Runnable {
        int numJunkPiles; // Number of junk piles in this room

        State(int numJunkPiles) {
            this.numJunkPiles = numJunkPiles;
        }

        // Invoked by close method or cleaner
        @Override
        public void run() {
            System.out.println("Cleaning room");
            numJunkPiles = 0;
        }
    }

    // The state of this room, shared with our cleanable
    private final State state;

    // Our cleanable. Cleans the room when it’s eligible for gc
    private final Cleaner.Cleanable cleanable;

    public Room(int numJunkPiles) {
        state = new State(numJunkPiles);
        cleanable = cleaner.register(this, state);
    }

    @Override
    public void close() {
        cleanable.clean();
    }
}
```

Klasa implementuje interfejs `AutoCloseable`, a jako szczegół implementacyjny metody `close()` używany jest `Cleaner`. Jest to poniekąd zaleta cleanerów, że nie widnieją w publicznym API klasy, więc można w dowolnym momencie zmienić implementację.

Klasa `State` odgrywa rolę zasobu, który wymaga czyszczenia. Implementuje ona `Runnable` i jest rejestrowana w cleanerze. Jej metoda `run()` jest wywoływana przez metodę `clean()`, którą klient może użyć bezpośrednio lub jeśli tego nie zrobi -  przez nasz `Cleaner` (miejmy nadzieję) - kiedy klasa `Room` stanie się dostępna dla *garbage collectora*.

"Miejmy nadzieję" to słowo klucz, bo nie jest to zagwarantowane.

Używając takiej klasy z *try-with-resources* nie będzie problemu i automatyczne czyszczenie nie będzie nigdy potrzebne:

```java
try (Room myRoom = new Room(7)) {
  System.out.println("Goodbye");
}
```
Najpierw zobaczymy komunikat "Goodbye", a następnie "Cleaning". Jednak jeśli klient tego nie zrobi, zachowanie jest nieprzewidywalne:

```java
Room myRoom2 = new Room(2);
System.out.println("Peace out");
```
Pojawi się komunikat "Peace out", ale w moim przypadku "Cleaning" nigdy się nie uruchomi. I to jest ta nieprzewidywalność o której była mowa.

Dopiero dorzucenie:

```java
System.gc();
```

Sprawia, że u mnie "Cleaning" się uruchomi, ale to również nie gwarantuje takiego samego zachowania na każdej maszynie ani nie jest dobrą praktyką.

Podsumowując, unikaj stosowania clenearów i przed Java 9 - finalizerów.

{: .note}
Cleanerów i finalizerów nie można porównywać do destruktorów, np. znanych z C++. Destruktory używane są do zwalniania zasobów z pamięci powiązanych z danym obiektem. W Javie tym się zajmuje *garbage collector*.  Destruktory z C++ służą też do zwalniania innych zasobów (nie z pamięci). W Javie w tym celu jest używane *try-finally* lub *try-with-resources*.

# Co zamiast nich?

Jak zwalniać zatem zasoby z obiektów, jeśli nie za pomocą finalizerów i cleanerów?

Ano sprawić, żeby nasza klasa implementowała `AutoCloseable` i wywoływać metodę `close()` bezpośrednio, kiedy zasób nie jest już potrzebny, lub bardziej preferowany sposób - używać z *try-with-resources* (o tym w kolejnym wpisie).
