---
layout:     post
titleSEO:   "Metoda equals - czyli określanie równości obiektów"
title:      "Metoda equals"
subtitle:   "Czyli określanie równości obiektów. Kiedy i jak ją nadpisywać?"
date:       2018-06-16 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    3
item:       10
---

{% include /effective-java/series-info.html %}

W tym rozdziale serii omawiane będą wszystkie metody *non-final* (`equals`, `hashCode`, `toString`, `clone`, oprócz `finalize` - o której była już mowa w poście [unikaj finalizerow i cleanerów]({% post_url /Effective-Java/Chapter-1/2018-06-02-unikaj-finalizerow-i-cleanerow %})) z klasy `Object`, która jest klasą bazową każdej klasy (każda klasa domyślnie rozszerza tę klasę).

Metody te mają swoje domyślne zachowania, ale najczęściej, jeśli ich potrzebujemy, to je nadpisujemy. **Prawidłowa implementacja tych metod jest szczególnie ważna, bo wiele innych klas na nich polega, dlatego warto poświęcić im chwilę.**

W tym wpisie zajmiemy się metodą {% code java %}public boolean equals(Object obj){% endcode %}, która, jak sama nazwa wskazuje, służy do określania czy dany obiekt jest równy innemu, według określonych przez nas warunków.

Domyślnie implementacja wygląda tak:

```java
public boolean equals(Object obj) {
    return (this == obj);
}
```

Czyli zwracane jest `true` tylko wtedy, gdy `this` i `obj` odnoszą się do tego samego obiektu (wskazują na to samo miejsce w pamięci). Inaczej mówiąc — domyślnie (kiedy nie nadpiszemy zachowania metody `equals`) instancja klasy jest równa tylko sobie.

# Kiedy nie nadpisywać metody equals?

- Każda instancja klasy jest unikatowa w systemie (np. `Thread`).
- Logiczne porównywanie klasy nie ma sensu i jest zbędne (np. `Pattern`).
- Jeśli istnieje nadklasa, która nadpisuje już `equals` i to zachowanie jest poprawne dla naszej klasy (np. większość implementacji `Set`, `List` czy `Map` dziedziczy implementację metody `equals` odpowiednio z `AbstractSet`, `AbstractList` i `AbstractMap`.
- Kiedy klasa sama zarządza swoimi instancjami i zapewnia, że istnieje co najwyżej jedna instancja tej klasy (np. `Enum` należy do tej kategorii).
- Klasa jest `private` lub `package-private` i jesteśmy pewni, że `equals` nie zostanie nigdy wywołane.

Jeśli chcemy być ekstremalnie ostrożni, to możemy się upewnić, że metoda `equals` nie zostanie nigdy wywołana (zgodnie z założeniami):

```java
@Override
public boolean equals(Object o) {
    throw new AssertionError(); // Method is never called
}
```
Dzięki temu, jeśli gdzieś zostanie wywołana, to od razu zostaniemy poinformowani, że ktoś wcześniej założył, że nie powinno to mieć miejsca. Unikniemy przez to niespodziewanego zachowania klas zależnych od `equals`.

Częściej jednak metoda `equals` jest kluczowa i będziemy nadpisywać jej zachowanie.

# Kiedy nadpisywać metodę equals?

- Kiedy klasa nadaje się do logicznego porównywania, które nie polega tylko na unikatowym identyfikatorze i nie istnieje nadklasa, która już to robi w poprawny sposób.
- Kiedy klasa reprezentuje wartość (np. klasy takie jak `Integer` lub `String`).

Również wiele klas zależy od metody `equals` i jej dobra implementacja jest wymagana do poprawnego funkcjonowania tych klas.

Dla przykładu jest to niezbędne, aby używać obiekty jako klucze w mapach czy dodawać je do setów.

# Co equals musi spełniać?

Metoda `equals` dla każdej wartości `x`, `y`, `z` różnej od `null` powinna być:

- **Reflexive** - czyli dla {% code java %}x.equals(x){% endcode %} musi zwrócić `true`.
- **Symmetric** - czyli dla {% code java %}x.equals(y){% endcode %} musi zwrócić `true` wtedy i tylko wtedy gdy {% code java %}y.equals(x){% endcode %} zwraca `true`.
- **Transitive** - czyli jeśli {% code java %}x.equals(y){% endcode %} zwraca `true` i {% code java %}y.equals(z){% endcode %} zwraca `true` to {% code java %}x.equals(z){% endcode %} też musi zwracać `true`.
- **Consistent** - czyli wielokrotne wywołanie {% code java %}x.equals(y){% endcode %} bez zmiany parametrów używanych w `equals` zawsze konsekwentnie zwraca `true` lub `false`.
- **“Non-nullity”** - czyli dla {% code java %}x.equals(null){% endcode %} musi zostać zwrócone `false`.

Jest to **kontrakt**, który metoda `equals` musi spełniać.

**Jeśli te warunki nie zostaną spełnione, to wszystkie klasy, które polegają na metodzie `equals` obiektów (np. klasy kolekcji), będą zachowywać się nieregularnie, niepoprawnie i powodować błędy, dla których może być ciężko znaleźć przyczynę.**

{: #problem-z-dziedziczeniem}
Trzeba się też zastanowić, czy klasy, które rozszerzają inną klasę (również, gdy dodają wartość, która ma znaczenie w metodzie `equals`), powinny móc być równe nadklasom?

Joshua Bloch w swojej książce mówi, że tak — co jest zgodne z zasadą [Liskov substitution]({% post_url /Notatnik-juniora/2017-11-30-zasady-projektowania-kodu %}#l---liskov-substitution-principle). Ponadto mówi, że nie ma sposobu, aby rozszerzyć instancjonowalną klasę i dodać do niej wartość zachowując kontrakt `equals`, chyba że, chcemy zrezygnować z zalet obiektowych abstrakcji.

Z drugiej strony, przeciwne głosy idą za tym, że możemy zachować kontrakt `equals` używając sprawdzenia z `getClass` zamiast `instanceof`. Dla przykładu, dla prostej klasy `Point` będzie to wyglądać tak:

```java
// Broken - violates Liskov substitution principle (page 43)
@Override 
public boolean equals(Object o) {
    if (o == null || o.getClass() != getClass())
        return false;
    Point p = (Point) o;
    return p.x == x && p.y == y;
}
```

Co skutkuje tym, że obiekty są równe tylko wtedy, gdy mają również taką samą klasę. Jednak Joshua Bloch twierdzi, że jest to nieakceptowalne, bo narusza to zasadę [Liskov substitution]({% post_url /Notatnik-juniora/2017-11-30-zasady-projektowania-kodu %}#l---liskov-substitution-principle). Uzasadnia to tym, że podtyp danego obiektu jest nadal tym obiektem (Np. `ColorPoint` rozszerzając `Point` jest nadal `Point`-em ) i powinien funkcjonować jak ten obiekt, jednak nie jest to możliwe w tym podejściu. Wtedy nawet klasa, która rozszerza inną klasę i nie dodaje wartości, która ma znaczenie w `equals`, nie będzie jej równa.

Joshua Bloch wypowiedział się na ten temat też dodatkowo poza książką [tutaj](https://www.artima.com/intv/bloch17.html), jako że jest to dosyć kontrowersyjny temat w jego książce.

Jako obejście tego problemu można zastosować [Composition Over Inheritance]({% post_url Notatnik-juniora/2017-11-30-zasady-projektowania-kodu %}#composition-over-inheritance) (będzie też osobny wpis na ten temat w rozdziale 3 serii). Zamiast rozszerzać `Point`, dać klasie `ColorPoint` pole prywatne `Point` oraz udostępniając metodę dostępową do tego pola:

```java
// Adds a value component without violating the equals contract
public class ColorPoint {
    private final Point point;
    private final Color color;

    public ColorPoint(int x, int y, Color color) {
        point = new Point(x, y);
        this.color = Objects.requireNonNull(color);
    }

    /**
    * Returns the point-view of this color point.
    */
    public Point asPoint() {
        return point;
    }

    @Override public boolean equals(Object o) {
        if (!(o instanceof ColorPoint))
            return false;
        ColorPoint cp = (ColorPoint) o;
        return cp.point.equals(point) && cp.color.equals(color);
    }

    ... // Remainder omitted
}
```

Według mnie to, czy dany obiekt powinien być równy innemu, nawet jeśli jest jego podklasą to sprawa indywidualna. Na pewno znajdą się przypadki, kiedy `ColorPoint` powinien móc być równy `Point` jak i takie, kiedy nie powinno mieć to miejsca.

# Jak poprawnie zaimplementować metodę equals?

Kiedy nie mamy potrzeby definiowania jakiegoś specyficznego zachowania metody `equals` to najczęściej najlepiej zdać się na jej automatyczne wygenerowanie. Umożliwiają nam to IDE i bibloteki takie jak np. [Lombok](https://projectlombok.org/). Poprawność implementacji wtedy zrzucamy na IDE lub bibliotekę, przez co czasem możemy uniknąć naszych ludzkich błędów.

Nawiązując jeszcze do poprzedniego problemu, np. w InteliJ mamy do wyboru, czy podtypy klasy powinny być akceptowane w metodzie `Equals` czy nie.

W projekcie [Lombok](https://projectlombok.org/) również jest dostępna adnotacja, dzięki której zostanie wygenerowana dla nas implementacja `equals` i `hashCode` - {% code java %}@EqualsAndHashCode{% endcode %}. Obecnie Lombok łamie zasadę [Liskov substitution]({% post_url /Notatnik-juniora/2017-11-30-zasady-projektowania-kodu %}#l---liskov-substitution-principle) i jest to zrobione świadomie, a [tutaj](https://groups.google.com/forum/#!topic/project-lombok/jmhrTo0nAx8) można przeczytać dyskusję na ten temat.

Jeśli jednak zamierzmy samemu zadbać o implementację metody `equals` to można sugerować się tym przepisem:

1. Argument powinien być zawsze typu `Object`.
2. Użyj operatora `==` żeby sprawdzić, czy argument jest referencją do obiektu. Jeśli tak zwróć `true`.
3. Użyj operatora `instanceof` żeby sprawdzić, czy argument jest odpowiedniego typu. Jeśli nie jest, zwróć `false`.
4. Rzutuj argument na odpowiedni typ.
5. Dla każdego znaczącego pola w tym obiekcie sprawdź, czy to pole jest równe odpowiadającemu polu w argumencie. Jeśli wszystkie pola się zgadzają, zwróć `true`, w przeciwnym wypadku `false`.
- Dla prymitywów z wyjątkiem `float` i `double` używaj operatora `==` do porównywania.
- Dla pól przechowujących referencje do obiektów wywołuj ich `equals`.
- Dla pól typu `float` używaj metody {% code java %}Float.compare{% endcode %}, a dla `double` używaj {% code java %}Double.compare{% endcode %}.
- Dla tablic stosuj te wskazówki dla każdego elementu. Jeśli każdy element tablicy ma znaczenie, użyj metody {% code java %}Arrays.equals{% endcode %}.
- Niektóre z pól mogą być `null`. Aby uniknąć `NullPointerException` użyj do porównywania {% code java %}Objects.equals(Object, Object){% endcode %}.
- Wydajność metody `equals` zależy od kolejności kolejnych sprawdzeń. Aby uzyskać najlepszą wydajność, najpierw sprawdzaj pola, które najczęściej będą się różnić i ich porównywanie jest mniej kosztowne.
- Nie porównuj obiektów, które nie są częścią stanu logicznego obiektu.
- Nie porównuj pól, które są pochodnymi innych (ich wynik zależy od innych pól, które już sprawdzasz).
6. Sprawdź, czy twoja metoda `equals` spełnia wszystkie 5 warunków (kontrakt)

Przykład poprawnej implementacji:
```java
// Class with a typical equals method
public final class PhoneNumber {
    private final short areaCode, prefix, lineNum;

    public PhoneNumber(int areaCode, int prefix, int lineNum) {
        this.areaCode = rangeCheck(areaCode,  999, "area code");
        this.prefix   = rangeCheck(prefix,    999, "prefix");
        this.lineNum  = rangeCheck(lineNum,  9999, "line num");
    }

    private static short rangeCheck(int val, int max, String arg) {
        if (val < 0 || val > max)
           throw new IllegalArgumentException(arg + ": " + val);
        return (short) val;
    }

    @Override public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof PhoneNumber))
            return false;
        PhoneNumber pn = (PhoneNumber)o;
        return pn.lineNum == lineNum && pn.prefix == prefix
                && pn.areaCode == areaCode;
    }
    ... // Remainder omitted
}
```

**Nadpisując metodę `equals` musimy zawsze nadpisać również metodę `hashCode`, ale o niej w następnym wpisie.**
