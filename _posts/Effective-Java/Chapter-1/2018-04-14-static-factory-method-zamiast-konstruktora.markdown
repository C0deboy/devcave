---
layout:     post
titleSEO:   "Static factory method zamiast konstruktora"
title:      "Static factory method zamiast konstruktora"
subtitle:   "Zalety oraz wady tego rozwiązania"
date:       2018-04-14 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    2
item:       1
---

{% include effective-java/series-info.html %}

Tradycyjny sposób na tworzenie instancji klasy to użycie publicznego konstruktora. W tym wpisie przyjrzymy się innemu sposobowi, który również powinien być znany każdemu programiście.

# Static Factory Method

Jest to po prostu statyczna metoda, która zwraca instancję danej klasy:

```java
public static final SomeClass staticFactoryMethod(){
    return new SomeClass();
}
```

Na pewno już to kiedyś spotkałeś, choćby w standardowej bibliotece.

{: .note}
To nie jest to samo co wzorzec projektowy *Factory Method* znana z wzorców GOF.


Jeden z najpopularniejszych przykładów to:

```java
Integer number = Integer.valueOf("123");
```

A tu implementacja:

```java
public static Integer valueOf(String s) throws NumberFormatException {
    return Integer.valueOf(parseInt(s, 10));
}
```

Która korzysta z:

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}
```

Inny, trochę bardziej prosty przykład to:

```java
public static Boolean valueOf(boolean b) {
    return b ? Boolean.TRUE : Boolean.FALSE;
}
```

*Static factory method* może być jako dodatek do publicznych konstruktorów lub całkowicie je zastąpić. Ma to swoje wady i zalety.

# Zalety

{: .pros}
Ma swoją nazwę


Dzięki temu jaśniej może opisać obiekt, który zwraca lub w jaki sposób go tworzy, przez co kod jest łatwiejszy w użyciu jak i łatwiej go zrozumieć.

{: .pros}
Można zrobić kilka metod z parametrami o tym samym typie

W przypadku konstruktorów nie jest to możliwe.

Weźmy na przykład taką implementację klasy Coordinate, którą chcemy tworzyć na dwa sposoby:

```java
public class Coordinate {
    private double x;
    private double y;

    public Coordinate(double x, double y){
        this.x = x;
        this.y = y;
    }

    public Coordinate(double dist, double angle) {
        angle = Math.toRadians(angle);
        this.x = Math.round(dist * Math.cos(angle));
        this.y = Math.round(dist * Math.sin(angle)));
    }
}
```
Nie mamy takiej możliwości, bo nie da się zadeklarować dwóch konstruktorów z taką samą sygnaturą. Tu z pomocą przychodzi nam nasza statyczna fabryka:

```java
public class Coordinate {
  private double x;
  private double y;

  private Coordinate(double x, double y){
      this.x = x;
      this.y = y;
  }

  public static Coordinate fromXY(double x, double y){
      return new Coordinate(x, y);
  }

  public static Coordinate fromPolar(double dist, double angle){
      angle = Math.toRadians(angle);
      return new Coordinate(Math.round(dist * Math.cos(angle)), Math.round(dist * Math.sin(angle)));
  }
  //Override equals
}
```

Tu dodatkowo zadeklarowałem konstruktor jako `private`. Jest to opcjonalne - mogliśmy równie dobrze zostawić publiczny konstruktor i zrezygnować z fabryki {% code java %}Coordinate fromXY(double x, double y){% endcode %}.

W ten sposób możemy utworzyć obiekt na dwa sposoby, podając argumenty o tym samym typie, ale o innym znaczeniu:

```java
Coordinate coordFromPolar = Coordinate.fromPolar(3 * Math.sqrt(2), 45);
Coordinate coordFromXY = Coordinate.fromXY(3, 3);

coordFromPolar.equals(coordfromXY);//true
```
Widać też, że nazwy jasno określają intencję, czego nie możemy osiągnąć używając konstruktorów.

{: .pros}
Nie jest wymuszone tworzenie nowego obiektu z każdym wywołaniem


W przeciwieństwie do konstruktorów, statyczną fabryką możemy zwracać cały czas ten sam obiekt. Dzięki temu klasy niemutowalne mogą używać wcześniej stworzonych instancji lub cachować instancję podczas jej tworzenia i później ją zwracać z każdym wywołaniem tej metody, co eliminuje tworzenie niepotrzebnych duplikatów danego obiektu.

Przykładem tu jest wcześniej pokazywana metoda {% code java %}Boolean.valueOf(boolean){% endcode %}, która nigdy nie tworzy nowego obiektu lub {% code java %}Integer.valueOf(int i){% endcode %}, która zwraca "scacheowaną" instancję `Integer`, jeśli jest w zakresie od -128 do 127, a w inny przypadku tworzy nową. Liczby w tym przedziale występują znacznie częściej, więc taka optymalizacja ma sens.

{: .pros}
Może zwracać każdy podtyp zwracanego obiektu

Mamy możliwość zwrócenia dowolnego podtypu, co ważne - bez konieczności deklarowania go jako publiczny.

Dzięki temu możemy zdefiniować metodę na interfejsie, która zwróci nam konkretną implementację tego interfejsu.

{: .note}
Przed Java 8 nie było możliwe definiowanie statycznych metod w interfejsach. Wtedy takie metody np. dla interfejsu `Type` lądowały w nieinstancjowalnej klasie `Types`. Dosyć popularnym przykładem jest `java.util.Collections`. W Java 8+ możemy umieścić wszystkie statyczne fabryki bezpośrednio w interfejsie. I tak też zrobiono w Javie 9 na interfejsach List, Set i Map.

{: .pros}
Z każdym wywołaniem może być zwrócona inna implementacja

A to dzięki przekazywanemu parametrowi na podstawie którego może zostać wybrana implementacja. Pozwala to np. na zwrócenie wydajniejszej implementacji dla konkretnego przypadku. Jest to niewidoczne dla klienta i może być rozszerzalne.

Przykładem może być `EnumSet` z standardowej biblioteki. Nie posiada publicznego konstruktora, tylko statyczne fabryki, które zwracają różne implementację w zależności od wielkości Enuma. Jeśli ma mniej niż 64 elementy zwracany jest `RegularEnumSet`, w przeciwnym wypadku `JumboEnumSet`.

```java
public static <E extends Enum<E>> EnumSet<E> of(E first, E... rest) {
    EnumSet<E> result = noneOf(first.getDeclaringClass());
    result.add(first);
    for (E e : rest)
        result.add(e);
    return result;
}

public static <E extends Enum<E>> EnumSet<E> noneOf(Class<E> elementType) {
    Enum<?>[] universe = getUniverse(elementType);
    if (universe == null)
        throw new ClassCastException(elementType + " not an enum");

    if (universe.length <= 64)
        return new RegularEnumSet<>(elementType, universe);
    else
        return new JumboEnumSet<>(elementType, universe);
}
```

Wszystko po to żeby zadbać o wydajność.

# Wady

*Static factory method* nie ma żadnych poważnych wad. Jeśli można by się do czegoś przyczepić to:

{: .cons}
Klasa bez konstruktora nie może być rozszerzana


Jednak może to wyjść też na korzyść, bo zachęca to do używania [kompozycji zamiast dziedziczenia]({% post_url /Notatnik-juniora/2017-11-30-zasady-projektowania-kodu %}#composition-over-inheritance) oraz jest wymagane przez klasy *immutable*.


{: .cons}
Jest wymieszana razem z innymi metodami


Mały minusem jest też to, że statyczne fabryki nie są traktowane inaczej niż zwykłe metody, a więc są z nimi wymieszane. Trzeba więc przelecieć całą listę dostępnych metod w obiekcie w poszukiwaniu takiej, która zwraca ten obiekt. Przy szukaniu/tworzeniu takich metod warto zaznajomić się z konwencją nazewniczą takich metod, a najczęściej wyglądają tak:

`from` - konwersja np.:

```java
Date d = Date.from(instant);
```

`of` - agregacja np.:

```java
Set<Rank> faceCards = EnumSet.of(JACK, QUEEN, KING);
```

`valueOf` - bardziej rozwlekła wersja `from` lub `of` np.:

```java
BigInteger prime = BigInteger.valueOf(Integer.MAX_VALUE);
```

`instance` lub `getInstance` - może zwracać obiekt opisany przez parametr np.:

```java
StackWalker luke = StackWalker.getInstance(options);
```

`create` lub `newInstance` - podobnie jak `instance` lub `getInstance`, tyle, że tu za każdym razem powinien być to nowy obiekt np.:

```java
Object newArray = Array.newInstance(classObject, arrayLen);
```

`getType` - podobnie jak `getInstance`, tyle, że używamy wtedy kiedy metoda-fabryka jest w innej klasie np.:

```java
FileStore fs = Files.getFileStore(path);
```

`newType` - podobnie jak `newInstance`, tyle, że używamy wtedy kiedy metoda-fabryka jest w innej klasie np.:

```java
BufferedReader br = Files.newBufferedReader(path);
```

`type` - zwięzła alternatywa dla `getType` i `newType` np.:

```java
List<Complaint> litany = Collections.list(legacyLitany);
```

Jak widać statyczne fabryki mają dużo zalet, dlatego warto rozważyć ich implementowanie. Z kolei kiedy używamy jakiegoś API i są dostępne zarówno konstruktory jak i statyczne fabryki, w większości przypadków powinniśmy użyć tych drugich. Często wewnątrz uruchamiane są funkcje inicjujące, które są niezbędne do stworzenia danego obiektu lub mają znaczenie wydajnościowe.
