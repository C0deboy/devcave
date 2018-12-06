---
layout:     post
titleSEO:	"Minimalizowanie dostępności - modyfikatory dostępu i enkapsulacja"
title:      "Minimalizowanie dostępności"
subtitle:   "Czyli modyfikatory dostępu i enkapsulacja"
date:       2018-07-21 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    4
item:       15
---

{% include effective-java/series-info.html %}

Enkapsulacja jest jednym z ważniejszych czynników określających dobry design i jego podstawą.

# Czym jest enkapsulacja?

Enkapsulacja polega na ukrywaniu szczegółów implementacyjnych przed innymi komponentami. Dobrze zaprojektowane komponenty ukrywają je wszystkie, jasno rozdzielając jego API od jego implementacji. Wtedy, komponenty komunikują się przez swoje API i nie są świadome, co wykonywane jest pod spodem. 

Enkapsulacja jest ważne z wielu powodów, jednak najważniejszym z nich jest fakt, że rozdziela komponenty, które tworzą system. Sprawia to że mogą być rozwijane, testowane, optymalizowane, analizowane i modyfikowane w izolacji.
Dzięki temu możemy pracować na nich równolegle, bez ryzyka uszkodzenia innych komponentów, co znacznie przyspiesza proces rozwijania systemu.

**Best practice: ograniczaj dostęp do klas, interfejsów i elementów klasy najbardziej jak jest to możliwe.**

Cytując dokumentację:

> Use the most restrictive access level that makes sense for a particular member. Use private unless you have a good reason not to.

Mowa tu o mechanizmie _access control_, dzięki któremu określamy dostępność do klas, interfejsów i elementów klasy na podstawie modyfikatorów dostępu, którymi są oznaczane.

# Modyfikatory dostępu

W Javie dostępne mamy cztery modyfikatory dostępu: `private`, `protected`, `public` i `package-private`, który jest domyślny, tzn. wtedy kiedy nie podamy żadnego (**z wyjątkiem elementów zadeklarowanych w interfejsie, które domyślnie są publiczne**).


## Dla klas i interfejsów

Dla top-level (niewewnętrznych) klas i interfejsów możliwe są tylko dwa - `package-private` i `public`. `package-private` jest wtedy, gdy nie oznaczymy klasy modyfikatorem `public`, czyli domyślnie. Jeśli jest możliwość, żeby klasa lub interfejs był `package-private` to powinno tak się stać. Dzięki temu nasza klasa lub interfejs nie widnieje w API, a jest częścią implementacji i możemy ją dowolnie modyfikować, zastąpić czy nawet usunąć, bez uszkadzania istniejących klientów. Z kolei, jeśli nasza klasa lub interfejs jest publiczny, to jesteśmy zobowiązani wspierać go do końca, by zachować kompatybilność wsteczną.

{: .note}
Obecnie większość IDE przy tworzeniu nowych klas domyślnie wstawia modyfikator dostępu `public`. Warto to zmienić na `package-private` (czyli bez modyfikatora dostępu) i w miarę potrzeby deklarować `public` tylko wtedy kiedy jest to rzeczywiście potrzebne.

Jeśli klasa lub interfejs `package-private` jest używany tylko przez jedną klasą, to możemy rozważyć przeniesienie jej do tej klasy jako wewnętrznej klasy `private static`. Redukuje to dostępność tej klasy w innych klasach w obrębie tego samego pakietu. Będzie o tym mowa w *Item 24*. Jednak zdecydowanie ważniejsze jest redukowanie dostępu klas publicznych, jako że klasy *top-level* `package-private` i tak są już częścią implementacji, a nie publicznego API.

## Dla elementów klasy
Poprzez "elementy klasy" mam na myśli pola, metody, wewnętrzne klasy i interfejsy. Mamy dla nich dostępne wszystkie cztery modyfikatory dostępu:

- **private** — element jest dostępny tylko w klasie, w której jest zadeklarowany.
- **package-private** — element jest dostępny z każdej klasy w obrębie tego samego pakietu.
- **protected** — element jest również dostępny w klasach w obrębie tego samego pakietu oraz dodatkowo w podklasach klasy, w której jest zadeklarowany.
- **public** — element jest dostępny wszędzie.

Łatwiej to zobrazować na podstawie tabelki:

{: .post-table}

| Modyfikator | Klasa | Pakiet | Podklasa | Wszędzie |
|:------------|:------|:-------|:---------|:---------|
| `public`    | TAK   | TAK    | TAK      | TAK      |
| `protected` | TAK   | TAK    | TAK      | NIE      |
| brak        | TAK   | TAK    | NIE      | NIE      |
| `private`   | TAK   | NIE    | NIE      | NIE      |

Dla przykładu rozważmy, że mamy taką strukturę klas:

![modyfikatory przykład](/img/effective-java/classes-access.png)

Wtedy pola klasy `Alpha` oznaczone danym modyfikatorem będą miały taką widoczność w innych klasach:

{: .post-table}

| Modyfikator | Alpha | Beta | AlphaSub | Gamma |
|:------------|:------|:-----|:---------|:------|
| `public`    | TAK   | TAK  | TAK      | TAK   |
| `protected` | TAK   | TAK  | TAK      | NIE   |
| brak        | TAK   | TAK  | NIE      | NIE   |
| `private`   | TAK   | NIE  | NIE      | NIE   |

Duży przeskok w dostępności jest z `package-private` na `protected`. Element oznaczony jako `protected` jest już częścią API i musi być wspierany wiecznie. Jednak potrzeba ich stosowania powinna być sporadyczna.

Czasem modyfikatory dostępu są z góry wymuszone, na przykład, kiedy nadpisujemy metodę z nadklasy, to nie może ona mieć bardziej restrykcyjnego dostępu niż w nadklasie. Również wtedy, gdy klasa implementuje interfejs, to implementowane metody będą zawsze `public`.

**Pola klasy nie powinny być publiczne**.

Jeśli pole nie jest zadeklarowane jako `final` lub jest referencją do mutowalnego obiektu, to deklarując takie pole jako `public` umożliwiamy jego modyfikację lub podmianę. Ponadto podczas takiej modyfikacji możemy wykonać na nim jakąkolwiek akcję, więc **klasy z publicznymi modyfikowalnymi polami nie są _thread safe_**.

To samo tyczy się statycznych pól, z wyjątkiem stałych, które są integralną częścią abstrakcji klasy. Takie pola zazwyczaj upubliczniamy za pomocą `public static final` i przyjęło się je nazywać za pomocą drukowanych wyrazów rozdzielonymi podłogą, np.:

```java
public static final int DAYS_IN_WEEK = 7;
```
Ważne jest to, żeby takie pola zawierały tylko prymitywy lub referencje do obiektów *immutable*. Referencje do obiektów *mutable* mają wszystkie wady pola niezadeklarowanego jako `final`. Referencja nie może być zmieniona, ale sam obiekt już może.

{: .warning}
Tablice niezerowej długości są zawsze *mutable*, więc tablice nigdy nie powinny być deklarowane jako `public static final` ani klasa nie powinna udostępniać do niej *gettera* w przypadku kiedy jest `private`.  W przeciwnym wypadku klient będzie mógł zmodyfikować taką tablicę.

Możemy rozwiązać ten problem zwracając w getterze kopię tablicy.

```java
private static final Thing[] PRIVATE_VALUES = { ... };

public static final Thing[] values() {
	return PRIVATE_VALUES.clone();
}
```

Jednak jeśli obiekt typu `Thing` jest *mutable* to będzie trzeba wykonać *deep copy*. Temat klonowania omawiałem dwa wpisy wcześniej.

Podsumowując, powinniśmy redukować dostępność komponentów najbardziej jak to możliwe. Publiczne API nie powinno być zanieczyszczone klasami będącymi szczegółami implementacyjnymi innych klas. Publiczne klasy nie powinny mieć publicznych pól, z wyjątkiem stałych, które powinny być *immuatable*.

# Moduły Java 9

Java 9 daje nam nową abstrakcję ponad pakietami — moduły. Analogicznie tak jak pakiet jest zbiorem powiązanych klas, tak moduły są zbiorem powiązanych pakietów.

System modułów daje nam to nowe możliwości określania dostępności danych komponentów. Domyślnie żaden pakiet w module nie jest publiczny (dostępność wewnątrz modułu się nie zmienia). Jeśli chcemy, aby dany pakiet był dostępny w innym module, to musimy o tym wyraźnie poinformować w *module descriptor*. Jest to plik o nazwie <span class="file">module-info.java</span>.

Jego struktura wygląda mniej więcej tak:

```java
module my.module {
    exports com.my.package.name;
    //...
}
```

Dzięki temu możemy udostępniać klasy między pakietami wewnątrz modułów bez udostępniania ich całemu światu.

System modułów nie jest jeszcze szeroko używany w Javie i ciężko powiedzieć czy kiedykolwiek tak będzie.

Jeśli chciałbyś więcej się dowiedzieć o tym mechanizmie, to polecam [baeldung.com/java-9-modularity](http://www.baeldung.com/java-9-modularity).