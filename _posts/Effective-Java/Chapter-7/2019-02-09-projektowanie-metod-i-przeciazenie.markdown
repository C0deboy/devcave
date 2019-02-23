---
layout:     post
titleSEO:   "Projektowanie metod - Kilka dobrych praktyk"
title:      "Projektowanie metod"
subtitle:   "Kilka dobrych praktyk"
date:       2019-02-09 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    8
item:       51, 52
---

{% include effective-java/series-info.html %}

# Projektowanie metod

W tym temacie zebrane jest kilka wskazówek na temat projektowania API, aby było łatwiejsze w użyciu i bardziej odporne na błędy.

## Nazwy metod

Nazwy metod oczywiście zawsze powinny przestrzegać konwencji nazewniczych, ale równie ważne jest dobranie dobrej nazwy metody. Nazwa powinna być zwięzła, łatwa w zrozumieniu i dobrze opisująca co się w niej dzieje. Dobrze jest też trzymać się podobnej konwencji w obrębie klasy/pakietu.

## Argumenty metod

Powinniśmy unikać jak ognia przekazywania zbyt wielu argumentów do metody. Rozsądnym maximum są 4 parametry. Jeśli nie będziemy się tego trzymać, to nasze API stanie się toporne w użyciu, mało czytelne i nie obędzie się bez dokumentacji. Jest to szczególne ważne, jeśli metoda przyjmuje kilka argumentów tego samego typu.

Aby poradzić sobie z problemem dużej ilości parametrów można np.:
- podzielić metodę na kilka mniejszych, które potrzebują tylko niektórych z nich, ale też trzeba mieć na uwadze to, aby nie naprodukować ich zbyt wiele
- utworzyć dodatkową pomocniczą klasę, która zgrupuje powiązane ze sobą argumenty (zazwyczaj używa się do tego [*static member class*]({% post_url Effective-Java/Chapter-3/2018-09-08-klasy-wewnetrzne %}))
- skorzystać ze wzorca [*builder*]({% post_url Effective-Java/Chapter-1/2018-04-21-wzorzec-projektowy-builder %}), szczególnie jeśli niektóre parametry są opcjonalne.

## Typy argumentów

Jeśli istnieje interfejs jakiegoś typu, to powinniśmy preferować jego użycie jako deklaracji typu argumentu do metody, zamiast klasy konkretnej. Dzięki temu metoda będzie bardziej elastyczna i będzie mogła przyjąć różne implementacje.

## Enumy zamiast parametrów typy boolean

Lepiej jest użyć dwuelementowego Enuma, niż booleana, chyba że znaczenie booleana jest jasne dzięki nazwie metody. Enumy są bardziej czytelne i łatwiej się nimi posługiwać. Ułatwiają też dodanie kolejnych opcji w późniejszym czasie.

Dla przykładu, mając klasę `Thermometer`, która ma operować na stopniach celsjusza lub farenhaita, zamiast konstruktora, który przyjmuje wartość `true`, jeśli chcemy używać farenhaita:

```java
new Thermometer(true)
```

lepiej by było stworzyć takiego enuma:

```java
public enum TemperatureScale { FAHRENHEIT, CELSIUS }
```

i jego podawać do konstruktora:

```java
new Thermometer(TemperatureScale.CELSIUS)
```

Nie dość, że jest to dużo bardziej czytelne, to nie ma później problemu, aby dodać np. kolejną jednostkę - `KELVIN`. Ponadto możemy zrobić większy użytek z enumów dodając różne metody np. jedna z nich mogła by wspierać przekonwertowywanie jednostek.

# Przeciążanie metod - lepiej tego unikać

Przeciążanie metod może być czasem dezorientujące. Przykład nieudolnego zastosowania - klasa która próbuje klasyfikować czy kolekcja jest setem, listą czy jakąś inną kolekcją za pomocą przeciążania metod:


```java
// Broken! - What does this program print?
public class CollectionClassifier {
    public static String classify(Set<?> s) {
        return "Set";
    }

    public static String classify(List<?> lst) {
        return "List";
    }

    public static String classify(Collection<?> c) {
        return "Unknown Collection";
    }

    public static void main(String[] args) {
        Collection<?>[] collections = {
            new HashSet<String>(),
            new ArrayList<BigInteger>(),
            new HashMap<String, String>().values()
        };

        for (Collection<?> c : collections)
            System.out.println(classify(c));
    }
}
```

Intencją jest tutaj, aby program na podstawie typu w *runtime* wybrał odpowiednie przeciążenie i zwrócił konkretny typ kolekcji. Mogłoby się wydawać, że program wyprintuje kolejno "Set", "List" i "Unknown Collection" jednak tak się nie dzieje. Zamiast tego dostajemy 3 razy "Unknown Collection". 

Jak to się dzieje? Wybór która przeciążana metoda powinna zostać wywołana dzieje się podczas kompilacji. Dla wszystkich 3 iteracji pętli typ elementu kolekcji jest taki sam - `Collection<?>`. Podczas *runtime* za każdym razem jest to inny typ, ale nie wpływa to na wybór przeciążenia - liczy się tu typ *compile-time*, dlatego 3 razy wywoływane jest przeciążenie z `Collection<?>`.

Działa to dokładnie odwrotnie w przypadku nadpisywania metod. Wybór odpowiedniej nadpisanej metody dzieje się w *runtime* i bazuje na typie, który widoczny jest w *runtime*, a nie w *compile-time*. 

Przykład:

```java
class Wine {
    String name() { return "wine"; }
}

class SparklingWine extends Wine {
    @Override 
    String name() { return "sparkling wine"; }
}

class Champagne extends SparklingWine {
    @Override 
    String name() { return "champagne"; }
}

public class Overriding {
    public static void main(String[] args) {
        List<Wine> wineList = List.of(
            new Wine(), new SparklingWine(), new Champagne());

        for (Wine wine : wineList)
            System.out.println(wine.name());
    }
}
```

Tu jako wynik dostaniemy zgodnie z założeniem kolejno: "wine", "sparkling wine" i "champagne" mimo to, że typ *compile-time* to `Wine`.

Takie zachowanie przeciążanych metod może wprowadzać niejasności w API co do kwestii, która metoda zostanie wywołana, jeśli mamy kilka przeciążeń, które przyjmują taką samą ilość parametrów, a ich typy są "wymienialne" ze sobą. Jeśli mamy taki przypadek najlepiej jest użyć po prostu innej nazwy metody. (Dla konstruktorów nie mamy opcji podania innej nazwy, ale można zastosować tutaj *[static factory method]({% post_url Effective-Java/Chapter-1/2018-04-14-static-factory-method-zamiast-konstruktora %})*)

Weźmy na przykład klasę `ObjectOutputStream`. Posiada wariant metody `write` dla każdego typu prymitywnego. Zamiast przeciążać te metody, używa dla każdego z nich innej nazwy: np. `writeBoolean(boolean)`, `writeInt(int)` czy `writeLong(long)`. Podobnie jest w przypadku metody `read`.

Często możemy się też spotkać z problemem przeciążania, gdy używamy referencji do metod. Weźmy przykład:

```java
new Thread(System.out::println).start();

ExecutorService exec = Executors.newCachedThreadPool();
exec.submit(System.out::println);
```

Zarówno konstruktor `Thread` jak i metoda `sumbmit` przyjmują `Runnable`, jednak wywołanie metody `submit` nie skompiluje się poprawnie. Wszystko przez to, że metoda `submit` ma dodatkowe przeciążenie, które przyjmuje `Callable<T>`. Mogłoby się wydawać, że nie powinno to zrobić żadnej różnicy, bo metoda `println` zawsze zwraca `void`, więc ta referencja do metody nie mogłaby być `Callable`. Ma to sens, jednak nie tak działa algorytm wyboru przeciążenia. Równie zaskakujące jest to, że nie byłoby problemu, gdyby metoda `println` nie miała własnych przeciążeń. To kombinacja przeciążeń referencji do metody i tej wywoływanej psuje ten algorytm.

Dlatego nie powinno się tworzyć przeciążeń metod, które mogą przyjąć różne interfejsy funkcjonalne na tej samej pozycji. W powyższym przypadku trzeba by castować tę referencję na `Runnable`, aby kod się skompilował.

Jedyne przeciążanie metod, które nie szkodzi jest wtedy, gdy wszystkie te metody robią dokładnie to samo. Można się tym spotkać w przypadku rozszerzania istniejących klas. Miało to miejsce np. w klasie `String`, gdy został dodany interfejs `CharSequence`. Standardowym sposobem, aby to osiągnąć, jest wywołanie w tym bardziej konkretnym przeciążeniu tego bardziej ogólnego. Tak też zrobiono w klasie `String`:

```java
// Ensuring that 2 methods have identical behavior by forwarding
public boolean contentEquals(StringBuffer sb) {
    return contentEquals((CharSequence) sb);
}
```

Podsumowując, przeciążanie metod z taką samą ilością argumentów wprowadza niepotrzebny chaos, którego lepiej unikać.