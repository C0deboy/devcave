---
layout:     post
titleSEO:   "Refleksja i metody natywne"
title:      "Refleksja i metody natywne"
subtitle:   "Użycie interfejsów z kodem refleksji i czy metody natywne to zawsze dobry pomysł?"
date:       2019-03-09 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    9
item:       65, 66
---

{% include effective-java/series-info.html %}

# Preferuj interfejsy zamiast bezpośredniej refleksji

Refleksja, którą w Javie mamy w pakiecie `java.lang.reflect`, umożliwia uzyskać dostęp do konstruktorów, metod i pól każdej klasy, a także do ich nazw, typów, sygnatur itd.

Dzięki temu możemy manipulować niemal każdym elementem klasy. Możemy również budować instancje, wywoływać metody czy nawet uzyskać dostęp do pól, które są zadeklarowane jako `private`.

Ponadto refleksja pozwala jednej klasie użyć drugiej, mimo że ta druga nie istniała podczas kompilacji tej pierwszej. 

Jest to zatem potężne narzędzie, jednak ma swoją cenę:
- tracimy wszystkie zalety sprawdzania typów i wyjątków. Jeśli spróbujemy wywołać metodę nieistniejącą metodę refleksją, to program wysypie się dopiero w *runtime*.
- Kod refleksji jest zazwyczaj paskudny i rozwlekły - ciężko się go piszę i czyta
- Wydajność jest dużo gorsza w porównaniu ze zwykłym wywoływaniem metod

Są aplikacje, które wręcz polegają na refleksji. Są to między innymi narzędzia analizy kodu czy frameworki *dependency injection*. 

Można jednak czerpać korzyści z refleksji, jednocześnie redukując przy tym jej koszt poprzez używanie refleksji w ograniczonej formie.

Kiedy program musi używać klasy, która jeszcze nie jest dostępna w czasie kompilacji, możemy posłużyć się istniejącym interfejsem lub nadklasą, by odnosić się do tej klasy. Możemy wtedy utworzyć instancję refleksją i używać jej przez interfejs lub nadklasę.

Dla przykładu program, który tworzy instancje `Set<String>`, której klasa jest podawana jako pierwszy argument w cmd. Pozostałe argumenty lądują w tym secie i są printowane na konsolę. Kolejność, w jakiej będą pokazane, zależy od implementacji setu np. jeśli podamy `HashSet` to kolejność będzie losowa, a gdy `TreeSet` to będzie alfabetycznie:

```java
// Reflective instantiation with interface access
public static void main(String[] args) {
    // Translate the class name into a Class object
    Class<? extends Set<String>> cl = null;
    try {
        cl = (Class<? extends Set<String>>)  // Unchecked cast!
                Class.forName(args[0]);
    } catch (ClassNotFoundException e) {
        fatalError("Class not found.");
    }
    // Get the constructor
    Constructor<? extends Set<String>> cons = null;
    try {
        cons = cl.getDeclaredConstructor();
    } catch (NoSuchMethodException e) {
        fatalError("No parameterless constructor");
    }
    // Instantiate the set
    Set<String> s = null;
    try {
        s = cons.newInstance();
    } catch (IllegalAccessException e) {
        fatalError("Constructor not accessible");
    } catch (InstantiationException e) {
        fatalError("Class not instantiable.");
    } catch (InvocationTargetException e) {
        fatalError("Constructor threw " + e.getCause());
    } catch (ClassCastException e) {
        fatalError("Class doesn't implement Set");
    }
    // Exercise the set
    s.addAll(Arrays.asList(args).subList(1, args.length));
    System.out.println(s);
}
private static void fatalError(String msg) {
    System.err.println(msg);
    System.exit(1);
}
```
Np. dla argumentów `java.util.TreeSet b c d g i s a` dostalibyśmy w wyniku `[a, b, c, d, g, i, s]`.

Ten przykład pokazuję też jak kod refleksji jest rozwlekły i ile wymaga boilerplateru - generuje aż 6 różnych wyjątków. Można by je jednak zredukować, łapiąc `ReflectiveOperationException`, który jest nadklasą wyjątków refleksji i został dodany w Javie 7. Używając refleksji dostajemy też wiele *unchecked cast warning*. Więc ignorując poszczególne wyjątki otrzymalibyśmy taki kod:

```java
// Reflective instantiation with interface access
public static void main(String[] args) {

    // Translate the class name into a Class object
    Class<? extends Set<String>> cl;
    Set<String> s = null;

    try {
        cl = (Class<? extends Set<String>>)  // Unchecked cast!
            Class.forName(args[0]);
        // Get the constructor
        Constructor<? extends Set<String>> cons;
        cons = cl.getDeclaredConstructor();
        // Instantiate the set
        s = cons.newInstance();
        // Exercise the set
        s.addAll(Arrays.asList(args).subList(1, args.length));
    } catch (ReflectiveOperationException e) {
        System.err.println("Constructor not accessible");
        System.exit(1);
    }

    System.out.println(s);
}
```

Nie jest już aż tak rozwlekły, ale nadal nie należy do najpiękniejszych.

Podsumowując, refleksja to potężne narzędzie do specyficznych zastosowań i ma kilka wad. Jeśli jednak musimy jej użyć, powinniśmy (jeśli jest tylko taka możliwość) ograniczyć jej użycie do stworzenia instancji klasy, a później już operować na interfejsie czy nadklasie, która jest dostępna w czasie kompilacji.

# Metody natywne

Java Native Interface (JNI) pozwala na wywoływanie natywnych metod, które są napisane w natywnych dla danego systemu językach jak C czy C++. Może to być wykorzystane w celu uzyskania dostępu do specyficznych funkcji systemu jak np. rejestry czy do użycia bibliotek, które są napisane w natywnych językach. W natywnych językach mogą też być napisane części systemu, które są krytyczne pod względem wydajności i które później wywołamy z Javy.

Obecnie jednak nie potrzebujemy używania natywnego kodu do większości specyficznych części systemu, bo Java wspiera już wiele z nich sama z siebie. Dla przykładu w Javie 9 dodano `process API`, które daje nam wygodny dostęp do procesów systemu operacyjnego. 

Również pisanie natywnych metod w celu zapewnienia lepszej wydajności w wielu przypadkach nie jest już zalecane. JVM stał się dużo szybszy, niż to miało miejsce w pierwszych wersjach Javy i obecnie można uzyskać porównywalną wydajność w Javie. Na przykład, historycznie w Javie 1.1, `BigInteger` polegał wtedy na szybkiej bibliotece napisanej w C, a w Javie 3 zmieniono implementację na Javę i doprowadzono do tego, że była szybsza niż oryginalna, natywna implementacja.

Wywoływanie metod natywnych wiąże się z kosztowną komunikacją między kodem działającym na JVM a tym natywnym. Używając natywnych metod uzależniamy się od systemu i aplikacja staje się mniej przenośna między systemami. Aplikacje takie są też mniej bezpieczne i trudniejsze w debugowaniu.

Jeśli nigdy nie spotkałeś się z metodami natywnymi, to polecam: [Guide to JNI (Java Native Interface)](https://www.baeldung.com/jni)
