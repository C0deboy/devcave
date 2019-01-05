---
layout:     post
titleSEO:	 "Lambdy i referencje do metod"
title:      "Lambdy i referencje do metod"
subtitle:   "Czyli zamiennik dla klas anonimowych i nie tylko"
date:       2019-01-05 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    7
item:       42, 43
---

{% include effective-java/series-info.html %}

W tym rozdziale będzie mowa o elementach, które zostały dodane w Javie 8 - interfejsy funkcyjne, referencje do metod, lambdy i streamy.

# Preferuj lambdy zamiast klas anonimowych

Typy funkcyjne to interfejsy (rzadziej klasy abstrakcyjne), które mają tylko jedną abstrakcyjną metodę. Ich instancje nazywane są obiektami funkcyjnymi i reprezentują jedną konkretną funkcję. Przed Java 8, aby stworzyć obiekt funkcyjny, musieliśmy użyć klasy abstrakcyjnej. Dla przykładu kawałek kodu, który sortuje słowa na podstawie ich długości, definiując to w klasie anonimowej:

```java
// Anonymous class instance as a function object - obsolete!
Collections.sort(words, new Comparator<String>() {
    public int compare(String s1, String s2) {
        return Integer.compare(s1.length(), s2.length());
    }
});
```

Programowanie funkcyjne w Javie przy użyciu anonimowych klas wymaga dużo boilerplateu i nie jest zbyt przyjemne, dlatego w Javie 8 dodano lambdy. Są **podobne** funkcjonalnie do klas anonimowych, jednak dużo bardziej zwięzłe. To samo za pomocą lambdy wygląda tak:

```java
// Lambda expression as function object (replaces anonymous class)
Collections.sort(words, (s1, s2) -> Integer.compare(s1.length(), s2.length()));
```

{: .note}
Typ lambdy `Comparator<String>`, typy parametrów (`s1` i `s2`, oba `String`) i typ zwracany `int` nie jest widoczny w kodzie. Kompilator dedukuje te typy dzięki mechanizmowi zwanemu inferencją typów. W niektórych specyficznych przypadkach kompilator nie będzie potrafił tego zrobić i będzie trzeba je podać ręcznie. Szczególnie w lambdach nie powinniśmy używać surowych typów, bo to z generyków kompilator może zebrać najwięcej informacji.

Możemy to jeszcze nawet bardziej skrócić używając metody do budowania comparatora:

```java
Collections.sort(words, Comparator.comparing(s -> s.length()));
```

Od Javy 8 dodano metodę `sort` do interfejsu `List` z której możemy skorzystać, aby jeszcze nieco skrócić zapis:

```java
words.sort(Comparator.comparing(s -> s.length()));
```

Lambdy znacznie zwiększają przejrzystość kodu i mogą być zastosowane w wielu miejscach. Weźmy na przykład enuma `Operation` z [postu o enumach]({% post_url Effective-Java/Chapter-5/2018-11-03-enums %}):

```java
// Enum type with constant-specific class bodies & data (Item 34)
public enum Operation {
    PLUS("+") {
        public double apply(double x, double y) {
            return x + y;
        }
    },
    MINUS("-") {
        public double apply(double x, double y) {
            return x - y;
        }
    },
    TIMES("*") {
        public double apply(double x, double y) {
            return x * y;
        }
    },
    DIVIDE("/") {
        public double apply(double x, double y) {
            return x / y;
        }
    };
    private final String symbol;

    Operation(String symbol) {
        this.symbol = symbol;
    }

    @Override
    public String toString() {
        return symbol;
    }

    public abstract double apply(double x, double y);
}
```

Zamiast definiować osobne ciało dla każdej instancji, możemy przekazać lambdę do konstruktora, która implementuje dane zachowanie. To zachowanie zostanie przechowane w polu `DoubleBinaryOperator op`, które potem będzie wywoływane w metodzie `apply`:

```java
// Enum with function object fields & constant-specific behavior
public enum Operation {
    PLUS("+", (x, y) -> x + y),
    MINUS("-", (x, y) -> x - y),
    TIMES("*", (x, y) -> x * y),
    DIVIDE("/", (x, y) -> x / y);

    private final String symbol;
    private final DoubleBinaryOperator op;

    Operation(String symbol, DoubleBinaryOperator op) {
        this.symbol = symbol;
        this.op = op;
    }

    @Override
    public String toString() {
        return symbol;
    }

    public double apply(double x, double y) {
        return op.applyAsDouble(x, y);
    }
}
```

Widać znaczną redukcję boilerplateu i kod jest dużo bardziej czytelny.

{: .note}
Interfejs `DoubleBinaryOperator` jest jednym z wielu predefiniowanych interfejsów w bibliotece Javy, który reprezentuje funkcję, która pobiera dwa argumenty i zwraca wartość typu `double`.
Wszystkie pozostałe interfejsy z tej kategorii będą omówione w następnym poście.

**Nie jest jednak tak, że lambdy są niezastąpione.** W przeciwieństwie do metod i klas, lambdy nie mają nazwy ani dokumentacji. Jeśli operacje w niej wykonywane nie są zwięzłe i oczywiste lub są większe niż kilka linijek, to nie powinny się znaleźć w lambdzie, bo czytelność i łatwość zrozumienia znacznie ucierpi. Idealna lambda powinna być jednolinijkowa, ale kilka linijek to sensowne maximum.

Innym ograniczeniem w przypadku naszego enuma jest to, że lambda podana do konstruktora, nie ma dostępu do pól czy metod instancji.

A czy z kolei lambdy wypierają całkiem klasy anonimowe? Też nie do końca. W przeciwieństwie do klas anonimowych nie możemy utworzyć instancji lambdy, co za tym idzie - nie możemy również uzyskać do niej referencji i przekazać jej gdzieś indziej. Ponadto w lambdzie słowo kluczowe `this` odnosi się do obiektu, w którym jest wykonywana, a w klasie anonimowej odnosi się do klasy anonimowej.

Java dostarcza nawet lepszy sposób, aby stworzyć obiekty funkcyjne, które są jeszcze bardziej zwięzłe niż lambdy - referencje do metod.

# Referencje do metod

Poprzednie sortowanie z użyciem referencji do metody wyglądałoby tak:

```java
words.sort(Comparator.comparing(String::length));
```

Nie zmienia to wiele, dlatego lepszym przykładem może być funkcja `merge` w interfejsie `Map`, która przypisuje podaną wartość do danego klucza, jeśli ten nie istnieje lub sumuje ich wartości, jeśli już jest w mapie:

```java
map.merge(key, 1, (count, incr) -> count + incr);
```

W tym przypadku parametr `count` i `incr` nie dodają zbyt wiele wartości i zajmują sporo miejsca, a ta lambda po prostu mówi, że zwraca sumę podanych dwóch argumentów. Możemy to zrobić w lepszy sposób - podać referencję do metody `sum` w klasie `Integer`:

```java
map.merge(key, 1, Integer::sum);
```

Im więcej argumentów ma lambda, tym więcej boilerplateu można wyeliminować za pomocą referencji do metody. Czasem jednak, jeśli nazwy parametrów dużo jaśniej przedstawiają intencję funkcji, lepiej pozostać przy lambdzie.

Jeśli lambda zaczyna nam się robić zbyt długa i skompilowana, można wyciąć kod do nowej metody z opisową nazwą lub nawet dokumentacją i podać do lambdy tylko referencję do niej.

Zatem wybierajmy po prostu to, co jest krótsze, czytelniejsze i łatwiejsze do zrozumienia.

Najczęściej używany typ referencji to referencja do metody statycznej, ale są też cztery inne - *bound*, *unbound* oraz konstruktory klas i tablic:

{: .post-table}

| Method Ref Type   | Example                  | Lambda Equivalent                                  |
|-------------------|--------------------------|----------------------------------------------------|
| Static            | `Integer::parseInt`      | `str -> Integer.parseInt(str)`                     |
| Bound             | `Instant.now()::isAfter` | `t -> Instant.now().isAfter(t)`                    |
| Unbound           | `String::toLowerCase`    | `str -> str.toLowerCase()`                         |
| Class Constructor | `TreeMap<K,V>::new`      | `() -> new TreeMap<K,V>`                           |
| Array Constructor | `int[]::new`             | `len -> new int[len]`                              |