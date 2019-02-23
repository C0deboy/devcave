---
layout:     post
titleSEO:   "Adnotacje - kilka dobrych praktyk"
title:      "Adnotacje"
subtitle:   "Kilka dobrych praktyk"
date:       2018-11-10 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    6
item:       39, 40, 41
---

{% include effective-java/series-info.html %}

# Adnotacje zamiast specyficznego nazewnictwa

Dawniej, kiedy w Javie nie było adnotacji, używało się specjalnego nazewnictwa (np. prefixy), aby zaznaczyć, że dany element potrzebuje specjalnego traktowania (np. przez framework).

Dla przykładu miało to miejsce w frameworku do testowania - JUnit (do wersji 4). Aby metoda będąca testem była odpalona przez framework, musiała zaczynać się od słowa "test". Ta technika działa, ale ma wiele niedoskonałości, a od momentu wprowadzenia adnotacji, w ogóle nie powinna być stosowana.

Do wad można zaliczyć:
 - nie ma mechanizmu wymuszenia pisowni
 - ani wymuszenia elementu dla którego może być aplikowany
 - Nie ma dobrego sposobu, aby przekazać dodatkowy parametr

 Chcąc zdefiniować np. test, który przechodzi pomyślnie tylko wtedy, gdy zostanie rzucony podany wyjątek, musielibyśmy hardcodować nazwę wyjątku w nazwie metody, wymuszając dany format, co by było brzydkie, mało funkcjonalne i nie miałoby wsparcia kompilatora.

 Adnotacje rozwiązują wszystkie te problemy i to je właśnie powinniśmy używać (tak też zrobił JUnit wraz z wersją 4).

 Aby zobaczyć z czego składają się adnotację, zobaczmy zabawkowy framework do odpalania testów.

 Więc najpierw adnotacja, którą będziemy oznaczać metody, które są testami:

```java
// Marker annotation type declaration
import java.lang.annotation.*;

/**
 * Indicates that the annotated method is a test method.
 * Use only on parameterless static methods.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Test {
}
```

W deklaracji widzimy dwie dodatkowe adnotacje:
- `@Retention(RetentionPolicy.RUNTIME)` - oznacza, że ta adnotacja powinna być obecna w *runtime*. Bez tego po kompilacji nie byłaby widoczna dla naszego frameworka.
- `@Target(ElementType.METHOD)` - definiuje elementy, na jakich może zostać użyta - w tym przypadku tylko metody

Jest też mały komentarz na adnotacji - `Use only on parameterless static methods.` Jest to w JavaDoc-u, ponieważ kompilator nie może tego wymusić, chyba że napiszemy *annotation processor* (implementując `javax.annotation.processing.AbstractProcessor`), który to zrobi (javax.annotation.processing). Bez niego, jeśli damy adnotację na niepoprawną metodę, to program skompiluje się bez błędu, a problem będzie musiał zostać obsłużony przez framework w *runtime*.

{: .note}
Adnotacje bez parametrów nazywa się *markerami*, jako że tylko oznaczają dany element i nie robiąc nic więcej.

Przykładowa klasa zawierająca testy:

```java
// Program containing marker annotations
public class Sample {
    @Test
    public static void m1() { }  // Test should pass

    public static void m2() { }

    @Test
    public static void m3() {     // Test should fail
        throw new RuntimeException("Boom");
    }

    public static void m4() { }

    @Test
    public void m5() { } // INVALID USE: nonstatic method

    public static void m6() { }

    @Test
    public static void m7() {    // Test should fail
        throw new RuntimeException("Crash");
    }

    public static void m8() { }
}
```

Jeden test powinien przejść, dwa powinny się wysypać i jeden jest niepoprawny. Metody bez adnotacji `@Test` powinny być pominięte.

Brakuje nam jeszcze *runnera*, który odpali testy:

```java
// Program to process marker annotations
import java.lang.reflect.*;

public class RunTests {
    public static void main(String[] args) throws Exception {
        int tests = 0;
        int passed = 0;
        Class<?> testClass = Class.forName(args[0]);
        for (Method m : testClass.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Test.class)) {
                tests++;
                try {
                    m.invoke(null);
                    passed++;
                } catch (InvocationTargetException wrappedExc) {
                    Throwable exc = wrappedExc.getCause();
                    System.out.println(m + " failed: " + exc);
                } catch (Exception exc) {
                    System.out.println("Invalid @Test: " + m);
                }
            }
        }
        System.out.printf("Passed: %d, Failed: %d%n",
                          passed, tests - passed);
    }
}
```
*Runner* działa tak, że pobiera pełną ścieżkę klasy i wywołuje wszystkie metody będące testami (używając refleksji).

Odpalając naszą klasę, dostajemy taki wynik:

```
public static void Sample.m3() failed: RuntimeException: Boom
Invalid @Test: public void Sample.m5()
public static void Sample.m7() failed: RuntimeException: Crash
Passed: 1, Failed: 3
```

Wspominałem wcześniej o typie testu, który przechodzi wtedy, kiedy rzucony jest dany wyjątek. Adnotacja spełniająca taką funkcję może wyglądać tak:

```java
// Annotation type with a parameter
import java.lang.annotation.*;
/**
 * Indicates that the annotated method is a test method that
 * must throw the designated exception to succeed.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
    Class<? extends Throwable> value();
}
```

A używa się ją w ten sposób:

```java
// Program containing annotations with a parameter
public class Sample2 {
    @ExceptionTest(ArithmeticException.class)
    public static void m1() {  // Test should pass
        int i = 0;
        i = i / i;
    }
    @ExceptionTest(ArithmeticException.class)
    public static void m2() {  // Should fail (wrong exception)
        int[] a = new int[0];
        int i = a[1];
    }
    @ExceptionTest(ArithmeticException.class)
    public static void m3() { }  // Should fail (no exception)
}
```

Trzeba też obsłużyć nową adnotację w *runnerze*:

```java
if (m.isAnnotationPresent(ExceptionTest.class)) {
    tests++;
    try {
        m.invoke(null);
        System.out.printf("Test %s failed: no exception%n", m);
    } catch (InvocationTargetException wrappedEx) {
        Throwable exc = wrappedEx.getCause();
        Class<? extends Throwable> excType =
            m.getAnnotation(ExceptionTest.class).value();
        if (excType.isInstance(exc)) {
            passed++;
        } else {
            System.out.printf(
                "Test %s failed: expected %s, got %s%n",
                m, excType.getName(), exc);
        }
    } catch (Exception exc) {
        System.out.println("Invalid @Test: " + m);
    }
}
```

Widać jak łatwo z pomocą adnotacji możemy przekazać dodatkowy parametr (w tym przypadku typ wyjątku).

Adnotacje wspierają również dostarczenie na raz kilku elementów. Wystarczy zamienić zwracany typ przez metodę `value` na tablice:

```java
// Annotation type with an array parameter
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
    Class<? extends Exception>[] value();
}
```
Co więcej wszystkie poprzednie definicje adnotacji (z jednym parametrem) dalej będą poprawne, bo składnia jest elastyczna - po prostu będą potraktowane jako jednoelementowa tablica.

Chcąc podać kilka, używamy dodatkowych nawiasów i wypisujemy je po przecinku:

```java
// Code containing an annotation with an array parameter
@ExceptionTest({ IndexOutOfBoundsException.class, NullPointerException.class })
public static void doublyBad() {
    List<String> list = new ArrayList<>();

    // The spec permits this method to throw either
    // IndexOutOfBoundsException or NullPointerException
    list.addAll(5, null);
}
```

{: .note}
Od Javy 8 jest też inny sposób, aby podać kilka argumentów. Możemy oznaczyć naszą adnotację za pomocą `@Repeatable`, która oznacza, że adnotacja może być wielokrotnie użyta na jednym elemencie, jednak wymaga to dodatkowej uwagi przy obsłudze. Można jej wtedy używać w ten sposób:

```java
@ExceptionTest(IndexOutOfBoundsException.class)
@ExceptionTest(NullPointerException.class)
public static void doublyBad() { ... }
```

Przekaz tego tematu jest prosty - używajmy adnotacji, zamiast wymuszania konwencji nazewniczych.

# Adnotacja @Overrride

Jedna z najważniejszych i najpopularniejszych adnotacji w standardowej bibliotece Javy to `@Override`. Używana jest na metodach i deklaruje, że dana metoda nadpisuje metodę w nadklasie. Warto ją używać na każdej metodzie, która według naszych intencji powinna nadpisywać inną. Jest ważna, ze względu na to, że dzięki niej kompilator pomoże nam uniknąć pomyłek dotyczących deklaracji klasy. Dla przykładu:

```java
// Can you spot the bug?
public class Example {
    private final char first;
    private final char second;

    public Bigram(char first, char second) {
        this.first  = first;
        this.second = second;
    }

    public boolean equals(Bigram b) {
        return b.first == first && b.second == second;
    }

    public int hashCode() {
        return 31 * first + second;
    }
}
```

Widzisz jakiś problem z tą klasą? Na pierwszy rzut oka może to być nie widoczne, ale ta klasa przeciąża metodę `equals` zamiast ją nadpisywać. Typ argumentu powinien być `Object`. Przez to na przykład kolekcje takie jak `Set` nie będą działać poprawnie z tą klasą, ponieważ polegają na dobrej implementacji `equals`.

Jeśli byśmy dodali adnotację `@Override` do tej metody to kompilator poinformowałby nas o błędzie:


```
Bigram.java:10: method does not override or implement a method
from a supertype
    @Override public boolean equals(Bigram b) {
    ^
```

Przekaz z tego tematu jest prosty - używajmy adnotacji `@Override` na każdej metodzie, która nadpisuje metodę z nadklasy. Wyjątkiem od tej zasady **mogą** być klasy abstrakcyjne - tak czy siak, jeśli nie zaimplementujemy metody abstrakcyjnej nasz program się nie skompiluje.

# Marker interfejs jako definicja typu

W tym temacie mowa o tzw. *marker interface*. Jest to interfejs, które nie ma żadnych metod i tylko "zaznacza", że klasa jest do czegoś przeznaczona. Przykładem jest interfejs `Serializable`, który wskazuje, że jego instancje mogą być serializowane.

W poprzednim poście była mowa o *marker annotation*, które też tylko oznaczają dany element, więc jaka jest między nimi różnica?

Po pierwsze, interfejsy definiują typ, a adnotacje tego nie robią. Typ możemy używać w naszym API i wszelkie błędy z tym związane (np. próba podania innego typu niż nasz *marker interface*) zostaną wykryte przez kompilator, a nie w *runtime* tak jak w przypadku adnotacji.

{: .note}
Co ciekawe, metoda `ObjectOutputStream.write` nie korzysta z tej zalety i jej argument zadeklarowany jest jako `Object`, więc próba serializowania obiektu, który nie implementuje `Serializable` wysypie się dopiero w *runtime*.

Dodatkową zaletą marker interfejsów jest to, że mogą bardziej ograniczyć target, dla którego mogą być użyte. Załóżmy, że chcemy mieć marker, który może być stosowany tylko dla implementacji konkretnego interfejsu. Jeśli zadeklarujemy target adnotacji na `Element.Type` to będziemy mogli jej użyć na jakimkolwiek interfejsie lub klasie i nie możemy tego ograniczyć. Używając *marker interface* możemy sprawić, by rozszerzał interfejs, którego implementacje mogą być "oznaczane" przez ten interfejs. Dzięki temu mamy zagwarantowane, że wszystkie "zaznaczone" klasy, będą jednocześnie implementacją interfejsu, dla której są aplikowalne.

Przekaz z tego tematu jest prosty - jeśli chcemy używać "oznaczonych" klas w naszym API, skorzystajmy z *marker interface* zamiast *marker annotation*, jeśli możemy skorzystać z którejś z wymienionych zalet.