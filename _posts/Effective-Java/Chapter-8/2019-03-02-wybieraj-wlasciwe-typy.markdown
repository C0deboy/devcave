---
layout:     post
titleSEO:   "Wybieraj właściwe typy"
title:      "Wybieraj właściwe typy"
subtitle:   "Typy zmiennoprzecinkowe, nadużywanie stringów i preferowanie interfejsów"
date:       2019-03-02 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:        Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    9
item:       60, 61, 62, 63, 64
---

{% include effective-java/series-info.html %}

# Unikaj float i double kiedy potrzebujesz precyzji 

Typy `float` i `double` były zaprojektowane początkowo do naukowych obliczeń. Skupiają się na jak najlepszej wydajności, jednak nie dostarczają one dokładnych wyników. Przykładowo nie powinny być stosowane w obliczeniach walutowych, bo nie jest możliwe precyzyjne reprezentowania 0.1 lub innej ujemnej potęgi 10 jako `float` lub `double`.

Dla przykładu, mając 1.03 zł i odejmując od tego 42 gr, dostalibyśmy w wyniku 0.6100000000000001.

```java
System.out.println(1.03 - 0.42);
// 0.6100000000000001
```

Inny przykład - mając 1 zł i odejmując od tego 9 razy coś za 10 gr zostałoby nam 0.09999999999999998 zł.

```java
System.out.println(1.00 - 9 * 0.10);
// 0.09999999999999998
```
Może się zdawać, że ten problem można by rozwiązać, po prostu zaokrąglając wyniki, jednak nie jest to prawda - nie zawsze by to działało.

Rozwiązanie jest prostsze - tam gdzie jest wymagana precyzja, używaj - `BigDecimal`, `int`, lub `long`.

{: .note}
Najlepiej jest używać konstruktora `BigDecimal`, który przyjmuje `String` - wtedy unikamy wprowadzania niedokładnych wartości do obliczeń.

Używanie `BigDecimal` ma jednak dwie wady:
- jest dużo mniej wygodne niż używanie prymitywnych typów
- jest też od nich mniej wydajne

Jednak tym drugim w większości wypadków nie ma się co przejmować.

# Preferuj typy prymitywne

Ten temat już był i dobrze go opisałem w poście [Unikaj nadmiarowego tworzenia obiektów]({% post_url Effective-Java/Chapter-1/2018-05-19-unikaj-tworzenia-niepotrzebnych-obiektow %}), wyjaśniając i pokazując na przykładzie, dlaczego powinniśmy preferować typy prymitywne zamiast ich odpowiedników klasowych (*boxed primitives*).


# Unikaj używania stringów tam, gdzie istnieją lepsze alternatywy

`String` został zaprojektowany by reprezentować tekst, jednak jest tendencja, by go używać do innych celów, podczas gdy mamy do tego lepsze alternatywy.

`String` często dostajemy w żądaniach z przeglądarki, czytając plik i z wielu innych źródeł - jest to naturalne, jednak nie powinniśmy tego zostawiać w tej postaci, jeśli istnieje lub możemy stworzyć odpowiedni typ reprezentujący te dane. Niby jest to oczywiste, ale i tak często `String` jest nadużywane.

Kolejną złą praktyką jest używanie stringów zamiast enumów - opisywałem to w temacie [Enumy - kilka dobrych praktyk]({% post_url Effective-Java/Chapter-5/2018-11-03-enums %}).

Przed użyciem `String` warto się zastanowić czy nie ma lepszej alternatywy dla danego zastosowania.

# Wydajność konkatenacji stringów

Jak pewnie Ci wiadomo `String` w Javie jest niemutowalny, więc każde użycie operatora `+` między stringami (konkatenacja) tworzy nowy obiekt `String`. Jest to całkowicie w porządku w przypadku łączeniu kilku stringów o stałej długości, jednak mało wydajne przy budowaniu dużych ciągów tekstu, szczególnie w pętli. Przykład:


```java
// Inappropriate use of string concatenation - Performs poorly!
public String statement() {
    String result = "";
    for (int i = 0; i < numItems(); i++)
        result += lineForItem(i);  // String concatenation
    return result;
}
```

Tu dla każdej iteracji pętli tworzy się niepotrzebnie nowy `String`, przez co metoda jest mało wydajna. Rozwiązaniem tutaj jest użycie klasy `StringBuilder`, która jest mutowalnym odpowiednikiem klasy `String`:


```java
public String statement() {
    StringBuilder b = new StringBuilder(numItems() * LINE_WIDTH);
    for (int i = 0; i < numItems(); i++)
        b.append(lineForItem(i));
    return b.toString();
}
```

W prostych przypadkach nie ma sensu używać `StringBuilder`-a ponieważ kompilator Javy automatycznie robi to za nas (taka automatyczna optymalizacja z jego strony). Użycie `StringBuilder`-a w prostych przypadkach tylko źle wpływa na czytelność kodu. Lepiej jest użyć wtedy po prostu operatora `+`. Jednak w przypadku pętli i w bardziej złożonych operacjach konkatenacji, kompilator Javy nie jest w stanie podmienić jej na użycie `StringBuilder`-a, więc w takich przypadkach warto go użyć.

# Odnoś się do obiektów po ich interfejsach

Podobny rada była w poście [Projektowanie metod]({% post_url Effective-Java/Chapter-7/2019-02-09-projektowanie-metod-i-przeciazenie %}), gdzie była mowa o używaniu interfejsów w typie parametrów. Ten temat rozszerza tę radę do wszystkich możliwych miejsc deklaracji typu - parametry, wartości zwracane, zmienne czy pola. Jeśli istnieje odpowiedni interfejs, to bez względu na miejsce deklaracji, zawsze powinniśmy deklarować typ jako interfejs zamiast konkretnej klasy.

Jedyny moment, gdzie musimy odnieść się do klasy konkretnej, jest tam, gdzie tworzymy ten obiekt konstruktorem.

Zatem miejmy w nawyku taki kod:

```java
// Good - uses interface as type
Set<Son> sonSet = new LinkedHashSet<>();
```

A nie taki:

```java
// Bad - uses class as type!
LinkedHashSet<Son> sonSet = new LinkedHashSet<>();
```

Dostajemy dzięki temu bardziej zwięzły kod, ale co ważniejsze - większą elastyczność. Możemy w każdej chwili zmienić implementację, a cały kod dookoła będzie dalej się kompilował:

```java
Set<Son> sonSet = new HashSet<>();
```

I prawdopodobnie działał. Jest jednak jeden wyjątek od tej zasady. Jeśli konkretna implementacja oferuję jakąś specjalną funkcjonalność, która nie jest zagwarantowana przez interfejs i kod polega na tej funkcjonalności, to nie powinniśmy używać ogólnego interfejsu jako deklaracji typu.

Przykładem tutaj mogłoby być to, że nasz kod polegałby na sortowaniu zapewnionym przez `LinkedHashSet`. Wtedy byłoby nieodpowiednie zadeklarowanie typu tej zmiennej jako `Set` ponieważ interfejs `Set` sam w sobie nie daję żadnej gwarancji odnośnie sortowania.

Oczywiście jest wiele przypadków, gdzie klasy nie mają swoich interfejsów, szczególnie tzw. *value classes* jak np. `String` czy `BigInteger`. Wtedy naturalnie będziemy używać konkretnych klas i nie ma w tym nic złego. Postarajmy się wtedy używać po prostu klasę najwyżej w hierarchii, która ma wymaganą przez nas funkcjonalność.

Czasem musimy zrobić też użytek z metod, które występują w klasie konkretnej, a nie ma ich na interfejsie - wtedy też użyjemy klasy konkretnej jako deklaracji typu i nie ma w tym nic złego.

