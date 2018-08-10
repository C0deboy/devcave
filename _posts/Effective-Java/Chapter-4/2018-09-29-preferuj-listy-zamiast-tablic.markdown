---
layout:     post
titleSEO:	"Nie używaj surowych typów"
title:      "Generyczne typy i metody"
subtitle:   "Dlaczego tablice są problematyczne wraz z generykami"
date:       2018-09-29 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    5
item:       28, 29, 30
---

{% include effective-java/series-info.html %}

# Tablice, a generyki

Podczas pracy z generycznymi klasami i metodami lepiej jest używać list zamiast tablic. Dlaczego?

Tablice mają dwie ważne różnice. Pierwsza, są zamienne. To znaczy, jeśli `Sub` jest podtypem `Super`, to tablica o typie `Sub[]` jest podtypem tablicy `Super[]`. Generyki przeciwnie - dla dwóch różnych typów `Type1` i `Type2`, `List<Type1>` nie jest pod ani nad-typem `List<Type2>`.

Używając tablic, takie coś przejdzie przez kompilator i wysypie się w dopiero w *runtime*:

```java
// Fails at runtime!
Object[] objectArray = new Long[1];
objectArray[0] = "I don't fit in"; // Throws ArrayStoreException
```

Używając odpowiadającej generycznej listy, taki kod nie przejdzie kompilacji:

```java
// Won't compile!
List<Object> objectList = new ArrayList<Long>(); // Incompatible types
objectList.add("I don't fit in");
```

Drugą różnicą jest to, że tablice mają swój typ na stałe i wymuszają go w *runtime*. Generyki z kolei są zaimplementowane tak, że ich typy są wymazywane - to znaczy, że wymuszają typy tylko podczas kompilacji, a w *runtime* już ich nie ma. Dzięki wymazywaniu typów generyki mogą bez problemu współpracować z *legacy code* z przed Javy 5.

Przez te różnice nie możemy na przykład utworzyć generycznej tablicy (`new List<E>[]`, new `List<String>[]`, `new E[]`. Takie operacje nie byłby *typesafe*.

To ograniczenie może być denerwujące, bo na przykład nie ma możliwości zwrócenia tablicy o typie, który jest w generycznej kolekcji. Przez to też będziemy dostawać mylące ostrzeżenia, gdy będziemy używać *varargs* w metodach w połączeniu z generykami, a to dlatego, że varargi są przekonwertowywane na tablice podczas kompilacji.
Adnotacja *SafeVarargs* adresuje ten problem i będzie omówiona w następnych wpisach.

Kiedy dostajemy *generic array creation error* lub *unchecked cast warning* gdy castujemy na tablicę, najlepiej jest zmienić implementację na listę List<E> zamiast tablicy E[]. Nie będzię to miało dużego wpływu na wydajność czy zwięzłość, a uzyskamy lepsze *typesafty*.

Przykładowo, prosta klaska, która będzie podawała losowe przedmioty z podanej kolekcji:

```java
// Chooser - a class badly in need of generics!
public class Chooser {
    private final Object[] choiceArray;

    public Chooser(Collection choices) {
        choiceArray = choices.toArray();
    }

    public Object choose() {
        Random rnd = ThreadLocalRandom.current();
        return choiceArray[rnd.nextInt(choiceArray.length)];
    }
}
```
Ta implementacja aż się prosi o generyki. Teraz za każdym razem, gdy pobieramy wartość, musimy ją sami castować i zadbać o zgodność typów.

Próbując użyć generyków i generycznej tablicy w ten sposób:

```java
// A first cut at making Chooser generic - won't compile
public class Chooser<T> {
    private final T[] choiceArray;

    public Chooser(Collection<T> choices) {
        choiceArray = choices.toArray();
    }

    // choose method unchanged
}
```

Jest nie możliwe, tak jak było to powiedziane wcześniej. Dostaniemy taki błąd kompilacji:

```
Chooser.java:9: error: incompatible types: Object[] cannot be
converted to T[]
        choiceArray = choices.toArray();
                                     ^
  where T is a type-variable:
    T extends Object declared in class Chooser
```

Jeśli scastujemy tablicę `Object` na `T`:

```java
choiceArray = (T[]) choices.toArray();
```

To dostaniemy warning:

```
Chooser.java:9: warning: [unchecked] unchecked cast
        choiceArray = (T[]) choices.toArray();
                                           ^
  required: T[], found: Object[]
  where T is a type-variable:
T extends Object declared in class Chooser
```
Kompilator mówi tu, że nie da sobie ręki uciąć, że ta operacja jest *typesafe*, ponieważ nie będzie wiedział jakim typem będzie `T` (typy są wymazywane). Program będzie działał prawidłowo, no ale kompilator nie może być tego pewny - stąd ostrzeżenie.
Można by dodać adnotację `@SuppressWarning` tak jak to było omawiane w poprzednim wpisie, ale tutaj lepszym rozwiązaniem byłoby wyeliminować przyczynę - użyć `List` zamiast tablicy:

```java
// List-based Chooser - typesafe
public class Chooser<T> {
    private final List<T> choiceList;

    public Chooser(Collection<T> choices) {
        choiceList = new ArrayList<>(choices);
    }

    public T choose() {
        Random rnd = ThreadLocalRandom.current();
        return choiceList.get(rnd.nextInt(choiceList.size()));
    }
}
```

Podsumowując, tablice zapewniają *runtime typesafty*, a generyki *compile time typesafty*. Podczas używania generycznych klas i metod, lepiej używać list zamiast tablic.

Jednak nie zawsze jest to możliwe lub pożądane. Java nie wspiera list natywnie, więc klasy jak `ArrayList` muszą być zbudowane na tablicach. Inne generyki jak np. `HashMap` są zbudowane na tablicach ze względu na wydajność.

Są dwa sposoby na używanie tablic z generykami.

Weźmy na przykład zabawkową klasę `Stack` z wcześniejszych wpisów:

```java
// Object-based collection - a prime candidate for generics
public class Stack {
    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Stack() {
        elements = new Object[DEFAULT_INITIAL_CAPACITY];
    }

    public void push(Object e) {
        ensureCapacity();
        elements[size++] = e;
    }

    public Object pop() {
        if (size == 0)
            throw new EmptyStackException();
        Object result = elements[--size];
        elements[size] = null; // Eliminate obsolete reference
        return result;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    private void ensureCapacity() {
        if (elements.length == size)
            elements = Arrays.copyOf(elements, 2 * size + 1);
    }
}
```

Ta klasa aż się prosi, aby była generyczną. Próbując napisać coś takiego:

```java
// Initial attempt to generify Stack - won't compile!
public class Stack<E> {
    private E[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Stack() {
        elements = new E[DEFAULT_INITIAL_CAPACITY];
    }

    public void push(E e) {
        ensureCapacity();
        elements[size++] = e;
    }

    public E pop() {
        if (size == 0)
            throw new EmptyStackException();
        E result = elements[--size];
        elements[size] = null; // Eliminate obsolete reference
        return result;
    }
    ... // no changes in isEmpty or ensureCapacity
}
```

Dostaniemy *generic array creation error*. Możemy rozwiązać ten problem na 2 sposoby:

Pierwszy, stworzyć tablicę typu `Object`, scastować to na generyczną tablicę i wyciszyć ostrzeżenie z komentarzem:

```java
//...

private E[] elements;

// The elements array will contain only E instances from push(E).
// This is sufficient to ensure type safety, but the runtime
// type of the array won't be E[]; it will always be Object[]!
@SuppressWarnings("unchecked")
public Stack() {
    elements = (E[]) new Object[DEFAULT_INITIAL_CAPACITY];
}

//...
```

Ten sposób wymaga castowania tylko raz.

Drugim sposobem jest zmiana typu tablicy z `E[]` na `Object[]`, jednak to zmusi nas do castowania każdego pobranego elementu z tablicy:

```java
private Object[] elements;

//...

// Appropriate suppression of unchecked warning
public E pop() {
    if (size == 0)
        throw new EmptyStackException();

    // push requires elements to be of type E, so cast is correct
    @SuppressWarnings("unchecked") E result =
        (E) elements[--size];

    elements[size] = null; // Eliminate obsolete reference
    return result;
}

//...
```

Dlatego preferowany jest sposób pierwszy i to z nim częściej się spotkamy.

# Metody generyczne

Generyczne mogą być również same metody. Często się takie przydają w statycznych klasach *utility*.
Wszystkie algorytmiczne metody z `Collections` takie jak `binarySearch`, `sort` itd. są generyczne.

Przykładowo metoda używająca gołych typów z poprzedniego wpisu:

```java
// Uses raw types - unacceptable! (Item 26)
public static Set union(Set s1, Set s2) {
    Set result = new HashSet(s1);
    result.addAll(s2);
    return result;
}
```

Mamy w niej dwa ostrzeżenia i aż się prosi, aby była generyczną metodą:

```
Union.java:5: warning: [unchecked] unchecked call to
HashSet(Collection<? extends E>) as a member of raw type HashSet
        Set result = new HashSet(s1);
                     ^
Union.java:6: warning: [unchecked] unchecked call to
addAll(Collection<? extends E>) as a member of raw type Set
        result.addAll(s2);
                     ^
```

Sparametryzujmy ją zatem. Parametr typu musi znajdować się między modyfikatorami, a typem zwrotnym funkcji. 

```java
// Generic method
public static <E> Set<E> union(Set<E> s1, Set<E> s2) {
    Set<E> result = new HashSet<>(s1);
    result.addAll(s2);
    return result;
}
```

Taka metoda nie wymaga żadnego castowania po stronie klienta i kompiluje się bez żadnych ostrzeżeń:

```java
// Simple program to exercise generic method
public static void main(String[] args) {
    Set<String> guys = Set.of("Tom", "Dick", "Harry");
    Set<String> stooges = Set.of("Larry", "Moe", "Curly");
    Set<String> aflCio = union(guys, stooges);
    System.out.println(aflCio);
}
```

Tym sposobem, wszystkie trzy sety (oba z argumentów i ten zwracany) muszą być tego samego typu. Możemy sprawić, aby było to bardziej elastyczne, używając *bounded wildcard type*. O tym w następnym wpisie.

Możemy również ograniczyć typ parametru, używając kolejnego typu zawierajacego ten parametr typu. Jest to *recursive type bound*. Często jest to używane w połączeniu z interfejsem `Comparable` (który był już [omawiany]()):

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

Podsumowując, generyki to użyteczne narzędzie - jest bezpieczniejsze i łatwiejsze w użyciu niż ciągłe castowanie i dbanie o *typesafty*. Uzywając generyków zrzucamy ten obowiązek na kompilator. Powinniśmy unikać sytuacji, gdzie klient musi castować otrzymywany obiekt i próbować stworzyć generyczną klasę lub metodę. Można to zrobić nawet na istniejących klasach i metodach bez uszkadzania obecnych klientów.