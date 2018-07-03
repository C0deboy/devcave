---
layout:     post
titleSEO:	"Projektowanie interfejsów i klas - kilka dobrych praktyk"
title:      "Projektowanie interfejsów i klas"
subtitle:   "Kilka dobrych praktyk"
date:       2018-09-01 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    4
item:       21, 22, 23, 25
---

{% include effective-java/series-info.html %}

Postanowiłem zebrać dobre praktyki z tych 5 tematów w jeden spis, bo według mnie, są one jasne i nie ma się za bardzo co rozwodzić na temat każdej z nich w osobnym wpisie.

# Domyślne metody w interfejsach

Przed Javą 8 nie było możliwości dodania do interfejsu nowej metody bez uszkadzania istniejących implementacji. Gdybyśmy to zrobili, to dostalibyśmy błąd kompilacji z powodu braku tej metody w implementacjach interfejsu. No, chyba że mamy kontrolę nad wszystkimi implementacjami interfejsu i byśmy ją wszędzie dodali.

W Javie 8 dodano domyślne metody do interfejsów, aby umożliwić dostarczenie domyślnej implementacji bezpośrednio w interfejsie. Dzięki temu, klasy, które implementują ten interfejs, nie spowodują błędu kompilacji, bo wszystkie odziedziczą domyślną implementację z interfejsu.

**Dodawanie nowym metod w ten sposób nie jest jednak pozbawione ryzyka błędu.** 

Przykładem może być metoda `removeIf`, która została dodana do interfejsu `Collection` w Javie 8 i usuwa wszystkie elementy, które spełnią warunek w funkcji podanej jako argument:

```java
// Default method added to the Collection interface in Java 8
default boolean removeIf(Predicate<? super E> filter) {
    Objects.requireNonNull(filter);
    boolean removed = false;
    final Iterator<E> each = iterator();
    while (each.hasNext()) {
        if (filter.test(each.next())) {
            each.remove();
            removed = true;
        }
    }
    return removed;
}
```

Jest to dobra, uniwersalna implementacja `removeIf`, jednak może nie działać w niektórych implementacjach interfejsu `Collection`. Przykładem jest `org.apache.commons.collections4.-collection.SynchronizedCollection`.

Jeśli jest używana razem z Java 8, to odziedziczy domyślną implementację `removeIf`, która nie spełnia fundamentalnego założenia klasy: synchronizowania każdego wywołania funkcji. Domyślna implementacja nie ma pojęcia o synchronizacji. 
Jeśli wywołamy `removeIf` na `SynchronizedCollection` podczas równoczesnej modyfikacji przez inny wątek, to dostaniemy `ConcurrentModificationException` lub jakieś inne nieprzewidywalne zachowanie.

Klasa `SynchronizedCollection` od Apache jest nadal aktywnie utrzymywana, ale na dzień dzisiejszy nadal nie nadpisuje zachowania `removeIf`. 

Podobna implementacja w standardowej bibliotece Javy zwracana przez `Collections.synchronizedCollection` musiała zostać dostosowana i metoda `removeIf` została nadpisana, aby wykonać synchronizację. Implementacje spoza biblioteki Javy nie mogły zrobić tego w tym samym czasie.

{: .note}
Gdy dodamy domyślne metody do interfejsu, istniejące implementacje skompilują się bez błędu, ale mogą wysypać się w trakcie wykonywania programu.

Dlatego przed **dodaniem** domyślnej metody do **istniejącego** interfejsu trzeba się mocno zastanowić czy nie popsuje to jakiejś implementacji. 

Jeśli jednak dopiero tworzymy interfejs, to domyślne metody są bardzo przydatne i śmiało można je używać bez żadnego ryzyka.


# Interfejs tylko jako definicja typu

**To, że klasa implementuje jakiś interfejs, powinno nam mówić, co możemy zrobić z instancją tej klasy i nic więcej.**

Przykładowo, żeby nikomu nie przyszło do głowy używanie interfejsu do definiowania stałych, tylko po to, by klasy, które używają tych stałych, implementowały go, w celu uniknięcia deklarowania nazwy klasy razem z nazwą stałej. Przykładowo:

// Constant interface antipattern - do not use! 
public interface PhysicalConstants {
    // Avogadro's number (1/mol)  
    static final double AVOGADROS_NUMBER = 6.022_140_857e23;

    // Boltzmann constant (J/K)  
    static final double BOLTZMANN_CONSTANT = 1.380_648_52e-23;

    // Mass of the electron (kg)  
    static final double ELECTRON_MASS = 9.109_383_56e-31;
}

Używanie stałych jest detalem implementacyjnym. Gdy implementujemy taki interfejs, to wszystko wycieka do publicznego API. 

Takie interfejsy można znaleźć nawet w standardowej bibliotece. Np. `java.io.ObjectStreamConstants`. Z całą pewnością nie powinniśmy się na tym wzorować.

Do przetrzymywania stałych są lepsze opcje:
 - Jeśli są mocno związane tylko z jedną klasą, to powinny występować tylko w niej
 - W przeciwnym wypadku można użyć:
	 - Nieinstancjowalnej klasy *utility*
	 - Lub Enumów, jeśli jest to bardziej odpowiednie.

A żeby pozbyć się problemu definiowania nazwy klasy razem z nazwą stałej, wystarczy użyć statycznych importów:

```java
import static com.example.PhysicalConstants.*;
```

# Preferuj hierarchię klas, zamiast otagowanych klas

Tutaj Joshua wspomina o *tagged classes*. Są to klasy, które mają jakby pod spodem typ (tag), zależnie od którego zmieniają zachowanie. Przykładowo:

```java
class Figure {
    enum Shape {RECTANGLE, CIRCLE};

    // Tag field - the shape of this figure  
    final Shape shape;

    // These fields are used only if shape is RECTANGLE  
    double length;
    double width;

    // This field is used only if shape is CIRCLE  
    double radius;

    // Constructor for circle  
    Figure(double radius) {
        shape = Shape.CIRCLE;
        this.radius = radius;
    }

    // Constructor for rectangle  
    Figure(double length, double width) {
        shape = Shape.RECTANGLE;
        this.length = length;
        this.width = width;
    }

    double area() {
        switch (shape) {
            case RECTANGLE:
                return length * width;
            case CIRCLE:
                return Math.PI * (radius * radius);
            default:
                throw new AssertionError(shape);
        }
    }
}
```

Szczerzę, w życiu z takim czymś się nie spotkałem i nawet do głowy mi nie przyszło takie użycie. Dla mnie naturalnym jest definiowanie osobnych klas i hierarchii w takich przypadkach:

```java
// Class hierarchy replacement for a tagged class
abstract class Figure {
    abstract double area();
}

class Circle extends Figure {
    final double radius;

    Circle(double radius) { this.radius = radius; }

    @Override
    double area() {
        return Math.PI * (radius * radius);
    }
}

class Rectangle extends Figure {
    final double length;
    final double width;

    Rectangle(double length, double width) {
        this.length = length;
        this.width = width;
    }

    @Override
    double area() {
        return length * width;
    }
}
```

I taki płynie też przekaz z tego itemu - preferuj hierarchie klas, zamiast tworów tego typu. Nie używaj "tagów" do określenia typu klasy - od tego są właśnie klasy.
 
*Tagged classes* nie mają żadnego uzasadnionego prawidłowego użycia ani zalet, nad którymi można by się zastanowić.

# Jedna top-level klasa na jeden plik źródłowy

Java pozwala na deklarowanie kilku top-level klas w pojedynczym pliku źródłowym:

```java
// Two classes defined in one file. Don't ever do this!
class Utensil { // top level class
    static final String NAME = "pan";
}

class Dessert { // top level class
    static final String NAME = "cake";
}
```
**ale nie powinniśmy nigdy z tej możliwości korzystać**. Deklarując klasy w tym samym pliku dużo łatwiej o kolizję i czytelność znacznie spada. 

Poza tym nie widać żadnych zalet w takim rozwiązaniu.

Kolejne dosyć naturalne (przynajmniej dla mnie) zachowanie. Nic dodać, nic ująć.

Jeśli z kolei klasa rzeczywiście służy tylko innej w tym samym pliku, to można rozważyć zadeklarowanie jej jako *static member*. Jest to bardziej czytelne i możemy zredukować dostępność, deklarując ją jako `private`. O klasach wewnętrznych będzie następny wpis.