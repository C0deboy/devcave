---
layout:     post
titleSEO:	"Gettery i settery - dlaczego unikać publicznych pól"
title:      "Gettery i settery"
subtitle:   "Dlaczego unikać publicznych pól"
date:       2018-07-28 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        false
chapter:    4
item:       16
---

{% include effective-java/series-info.html %}

Czasem możemy potrzebować klasy, która jest niczym więcej niż zbiorem powiązanych pól. Na przykład:

```java
// Degenerate classes like this should not be public!
class Point {  
    public double x;
    public double y;
}
```

Przez to, że pola tej klasy są używane bezpośrednio ({% code java %}point.x{% endcode %}, {% code java %}point.y{% endcode %} to porzucamy wszystkie zalety płynące z enkapsulacji, o której była mowa w poprzednim wpisie.

W takich klasach nie możemy zmienić reprezentacji bez zmieniania API, nie możemy wymusić jej poprawności ani wykonać żadnej innej akcji, podczas gdy pole jest pobierane.

Niektórzy powiedzieliby, że takie klasy zawsze powinny być zamienione na klasy z prywatnymi polami i getterami/setterami:

```java
// Encapsulation of data by accessor methods and mutators
class Point {  
    private double x;
    private double y;

    public Point(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public double getX() { return x; }
    public double getY() { return y; }

    public void setX(double x) { this.x = x; }
    public void setY(double y) { this.y = y; }
}
```

I rzeczywiście mają rację, jeśli mowa o publicznych klasach. Jeśli klasa jest dostępna poza pakietem, to warto zadeklarować jej pola jako prywatne i udostępnić *gettery*. Dzięki temu mamy elastyczność, która pozwala na zmianę wewnętrznej reprezentacji klasy bez zmieniania API. Kiedy pola używane są bezpośrednio, to zmiana taka jest niemożliwa, bo uszkodzi to wszystkie klasy, które jej używają.

**Jednak trzeba dobrze rozważyć czy na pewno chcemy udostępniać *settery*. Minimalizowanie mutowalności (ang. *mutability*) klasy jest preferowaną praktyką.** O tym będzie następny wpis.

Jednak jeśli klasa jest `package-private` lub wewnętrzną prywatną klasą, to właściwie nie jest to nic złego. Takie podejście nie generuje zbędnego wizualnego zaśmiecenia kodu metodami dostępowymi i dużo łatwiej i czytelniej używa się taką klasę.

Jeśli zajdzie potrzeba zmiany reprezentacji klasy to zmiany są ograniczone tylko do pakietu, w którym jest używana lub w przypadku wewnętrznej klasy - do klasy, która ją zawiera.

W większości wypadków wystawianie publicznie pól klasy nie jest dobrym pomysłem, ale jest to mniej szkodliwe, jeśli są to pola *immutable*. Nadal nie możemy zmienić reprezentacji bez zmieniania API, nadal nie możemy wykonać żadnej dodatkowej akcji, ale możemy wymusić tworzenie prawidłowych klas. Na przykład ta klasa zapewnia, że każda instancja będzie poprawną reprezentacją czasu:

```java
// Public class with exposed immutable fields - questionable
public final class Time {
    private static final int HOURS_PER_DAY = 24;
    private static final int MINUTES_PER_HOUR = 60;

    public final int hour;
    public final int minute;

    public Time(int hour, int minute) {
        if (hour < 0 || hour >= HOURS_PER_DAY)
            throw new IllegalArgumentException("Hour: " + hour);
        if (minute < 0 || minute >= MINUTES_PER_HOUR)
            throw new IllegalArgumentException("Min: " + minute);
        this.hour = hour;
        this.minute = minute;
    }
    ... // Remainder omitted
}
```

Nie znaczy to jednak, że od tej pory powinniśmy wszystko deklarować jako `private` i wybierać w naszym IDE *"Genarate Getters and Setters"* dla każdego pola. Nie, absolutnie nie. Gettery i settery są lepsze niż bezpośredni dostęp do pól, ale jeśli jest taka możliwość, to nie powinniśmy używać ani jednego, ani drugiego. Tzn. nie powinniśmy wystawiać na świat pola, które jest szczegółem implementacyjnym. Na tym polega enkapsulacja.

Jeśli chodzi o kwestię nazewniczą getterów i setterów, to nie zawsze powinny to być nazwy zaczynające się od *set* lub *get*. Jeśli istnieje inne słowo, które lepiej pasuje do wykonywanej czynności, to powinniśmy je użyć. Jest to bardziej zgodne z OOP. Dla przykładu:

```java
dog.take(new Ball());
```
ma dużo więcej sensu niż:

```java
dog.setBall(new Ball());
```
No może z wyjątkiem, gdy klasa (w tym przypadku `Dog`) jest tylko rekordem w bazie danych.

Podsumowując, publiczne klasy nigdy nie powinny wystawiać **publicznych mutowalnych** pól. Mniej szkodliwe jest wystawianie niemutowalnych pól, jednak nadal problematyczne - w niektórych przypadkach. Jeśli rzeczywiście potrzebujemy taką klasę, to wtedy najlepiej ograniczyć taką klasę do pakietu lub jeśli jest możliwe - do jednej klasy.