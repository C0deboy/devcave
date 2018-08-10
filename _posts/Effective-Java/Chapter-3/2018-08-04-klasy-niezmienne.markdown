---
layout:     post
titleSEO:	"Klasy niemutowalne - jak takie stworzyć i dlaczego są preferowane"
title:      "Klasy niemutowalne"
subtitle:   "Jak takie stworzyć i dlaczego są preferowane."
date:       2018-08-04 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        false
chapter:    4
item:       17
---

{% include effective-java/series-info.html %}

Klasy niemutowalne to po prostu klasy, które w żaden sposób nie mogą zostać zmodyfikowane. Wszystkie pola są stałe przez cały okres trwania obiektu. W bibliotece Javy mamy mnóstwo takich klas np. `String`, `BigInteger`, `BigDecimal` czy klasy opakowujące prymitywy. Jest ku temu kilka powodów: klasy niemutowalne są łatwiejsze i bezpieczniejsze w użyciu oraz mają większą odporność na błędy - szczególnie w środowisku wielowątkowym.

Aby zaimplementować klasę niemutowalną, musimy zapewnić 5 rzeczy:

1. **Nie udostępniać metod, które mogą zmodyfikować stan obiektu** (m.in. gettery do klas mutowalnych).

2. **Zapewnić by klasa nie mogła być rozszerzana.** Najczęściej można to zrobić oznaczając klasę jako `final`, ale jest też alternatywne rozwiązanie, o którym powiem za chwilę.

3. **Zadeklarować wszystkie pola jako `final`.** Dzięki temu nie będzie można przypisać do pola nowej referencji i będziemy mogli przekazywać ją między wątkami bez synchronizacji.

4. **Zadeklarować wszystkie pola z referencjami do mutowalnych obiektów jako `private`.** Dzięki temu klient klasy nie będzie miał bezpośredniego dostępu do mutowalnego obiektu, który mógłby zmienić.

5. **Ograniczyć dostęp do zmiennych obiektów otrzymywanych od klienta.** Jeśli klasa ma pole, które odnosi się do mutowalnego obiektu, musimy zapewnić, że klient nie będzie miał dostępu do tej referencji. Dlatego nie możemy inicjować pola obiektem, który dostajemy od klienta, lub zwracać taki obiekt getterem. Możemy wykonać *deffensive copy* na takim obiekcie i dopiero wtedy go przypisać lub zwrócić w getterze.

Jeśli nasza klasa ma być niemutowalna, to wszystkie operacje na naszym obiekcie powinny zwracać nowy obiekt. Przykład takiej klasy niemutowalnej:

```java
// Immutable complex number class
public final class Complex {
    private final double re;
    private final double im;

    public Complex(double re, double im) {
        this.re = re;
        this.im = im;
    }

    public double realPart() {
        return re;
    }

    public double imaginaryPart() {
        return im;
    }

    public Complex plus(Complex c) {
        return new Complex(re + c.re, im + c.im);
    }

    public Complex minus(Complex c) {
        return new Complex(re - c.re, im - c.im);
    }

    public Complex times(Complex c) {
        return new Complex(re * c.re - im * c.im,
            re * c.im + im * c.re);
    }

    public Complex dividedBy(Complex c) {
        double tmp = c.re * c.re + c.im * c.im;
        return new Complex((re * c.re + im * c.im) / tmp,
            (im * c.re - re * c.im) / tmp);
    }

    @Override
    public boolean equals(Object o) {
        if (o == this) {
            return true;
        }
        if (!(o instanceof Complex)) {
            return false;
        }
        Complex c = (Complex) o;

        // See page 47 to find out why we use compare instead of ==
        return Double.compare(c.re, re) == 0
            && Double.compare(c.im, im) == 0;
    }

    @Override
    public int hashCode() {
        return 31 * Double.hashCode(re) + Double.hashCode(im);
    }

    @Override
    public String toString() {
        return "(" + re + " + " + im + "i)";
    }
}
```

Klasa jest zadeklarowana jako `final`. Są gettery do dwóch prywatnych pól, ale są to prymitywy zadeklarowane jako `final`. Ponadto mamy 4 różne działania, **które nie modyfikują obiektu**, a zwracają nowy. Jest to poprawna implementacja całkowicie niemutowalnej klasy.

Podobnie jest w klasach `BigInteger`, `BigDecimal` czy `String`. Dla przykładu:

```java
BigInteger i = BigInteger.valueOf(20);
BigInteger j = i.add(BigInteger.valueOf(20));
// i = 20
// j = 40
```
Wartość `i` nigdy się nie zmieni. Wszystkie działania na `BigInteger` zwracają nowy obiekt.

Innym sposobem na to, by uniemożliwić rozszerzanie klasy, jest zadeklarowanie wszystkich konstruktorów jako `private` lub `package-private` i dodać [public static factory method]({% post_url Effective-Java/Chapter-1/2018-04-14-static-factory-method-zamiast-konstruktora %}). Jest to bardziej elastyczny sposób niż deklarowanie klasy jako `final`. Pozwala nam to na używanie kilku implementacji z tego samego pakietu, a dla klientów spoza pakietu zachowuje się tak jakby była `final`, ponieważ nie ma możliwości rozszerzenia klasy, gdy nie mamy dostępu do konstruktora. Poza tym *static factory method* ma sama w sobie wiele zalet, które były już [omawiane]({% post_url Effective-Java/Chapter-1/2018-04-14-static-factory-method-zamiast-konstruktora %}).

Inne zalety klas niemutowalnych:

**Obiekty niemutowalne są proste.** Mogą być w dokładnie jednym stanie - w tym, w którym zostały utworzone. Jeśli dodatkowo w konstruktorze zadbamy o poprawność argumentów, to mamy pewność, że obiekt będzie zawsze w poprawnym stanie.

**Obiekty niemutowalne są *thread-safe*.** Nie wymagają synchronizacji, ponieważ nie mogą być w niepoprawnym stanie, gdy są używane przez kilka wątków jednocześnie. Jest to najłatwiejsze podejście, aby uzyskać *thread safty*.

Używając obiektów niemutowalnych **nigdy nie będziemy musieli robić ich kopii**. Nie jesteśmy narażeni na niechciane modyfikacje, więc żaden obiekt nie zostanie uszkodzony i nie ma potrzeby robienia kopii.

**Niemutowalne obiekty są dobrym budulcem innych obiektów (mutowalnych lub nie)**. Dużo łatwiej zapewnić poprawność obiektu, gdy wiemy, że jego komponenty są niemutowalne. Doskonale nadają się jako klucze w mapach i jako elementy w setach - nie musimy się martwić, że ich wartości zmienią się po tym, jak zostaną dodane do kolekcji (co by powodowało ich niepoprawne działanie).

**Nie ma możliwości na niepoprawny stan obiektu, np. po rzuceniu wyjątku.** Są zawsze spójne.

I to by była większość zalet klas niemutowalnych. Całkiem tego sporo.

**Główną wadą klas niemutowalnych jest to, że wymagają nowego obiektu dla każdej nowej wartości pola.** Może to być kosztowne, gdy obiekty są duże i używane bardzo często.

Dlatego powstają tzw. *companion classes*, które są mutowalnym odpowiednikiem danej klasy niemutowalnej. Najlepszym tego przykładem w bibliotece Javy jest `StringBuilder`, który pozwala modyfikować stringa w wydajny sposób, po czym później zwrócić go jako niemutowalną instancję `String`.

{: .warning}
Gdy tworzono klasy `BigInteger` i `BigDecimal` nie było jeszcze powszechnie wiadomo, że niemutowalne klasy nie powinny być rozszerzane, dlatego jest to możliwe i wszystkie jej metody mogą zostać nadpisane. Ze względu na kompatybilność wsteczną nie mogło to być poprawione. Dlatego, jeśli piszesz aplikację, która polega na niemutowalności którejś z tych klas podanych jako argument od klienta, to powinieneś sprawdzić, czy jest to "prawdziwy" `BigInteger` lub `BigDecimal`, a nie jakaś niezaufana podklasa.<br>Można na przykład zwrócić *deffensive copy*, gdy mamy do czynienia z drugim przypadkiem:

```java
public static BigInteger safeInstance(BigInteger val) {
    return val.getClass() == BigInteger.class ?
            val : new BigInteger(val.toByteArray());
}
```

Podsumowując, nie generuj automatycznie *settera* do każdego *gettera*. **Klasy powinny być niemutowalne, chyba że mamy dobry powód, aby było inaczej.** Klasy niemutowalne mają dużo zalet, a jedyną ich wadą może być zmniejszona wydajność w specyficznych warunkach. Małe klasy zawsze powinny być niemutowalne. Warto rozważyć też niemutowalność w przypadku większych obiektów jak `String` czy `BigInteger` i ewentualnie stworzyć *mutable companion class*, jeśli rzeczywiście wydajność nie jest zadowalająca w specyficznych przypadkach.

**Oczywiście są przypadki klas, kiedy ich niemutowalność jest niepraktyczna.** Wtedy warto tylko ograniczyć jej mutowalność w miarę możliwości, co zmniejszy prawdopodobieństwo na błędy i ułatwi z nią pracę.

Łącząc rady z tego wpisu z tymi z poprzedniego, wychodzi na to, że **powinniśmy deklarować wszystkie pola jako `private final`, chyba że mamy dobry powód, aby było inaczej.**