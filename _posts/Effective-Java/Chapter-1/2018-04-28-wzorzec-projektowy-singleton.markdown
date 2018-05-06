---
layout:     post
titleSEO:	"Wzorzec projektowy Singleton - kiedy warto używać?"
title:      "Wzorzec projektowy Singleton"
subtitle:   "Różne warianty. Wady i zalety. Antywzorzec?"
date:       2018-04-28 12:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java Wzorce-projektowe
comments:   true
toc:        true
chapter:    2
item:       3
---

{% include effective-java/series-info.html %}

Czasem może się zdarzyć, że:
 - klasa ma być unikatowa w systemie
 - chcemy zarządzać jednym spójnym obiektem dostępnym z wielu miejsc aplikacji

Wtedy warto zastosować wzorzec projektowy *Singleton*.

# Singleton
*Singleton* jest to po prostu klasa, która jest instancjowana w systemie tylko jeden raz. Każde użycie takiej klasy odnosi się do tej samej instancji.

Jest kilka sposobów implementacji *Singletona*.

## Public final field Singleton
Dwa pierwsze polegają na deklarowaniu konstruktora jako prywatny i udostępnianiu statycznego dostępu do obiektu:

```java
public class Singleton {
  public static final Singleton INSTANCE = new Singleton();

  private Singleton() {
  }
}
```

Prywatny konstruktor jest wywołany tylko raz, aby zainicjalizować {% code java %}Singleton.INSTANCE{% endcode %}. Brak publicznego konstruktora zapewnia, że w systemie będzie istnieć tylko jedna instancja tego obiektu. No chyba, że użyjemy refleksji i metody `setAccessible()`. Możemy wykluczyć taką opcję rzucając wyjątek w konstruktorze - jeśli instancja już istnieje:

```java
  private Singleton() {
    if (INSTANCE != null) {
      throw new IllegalStateException("Singleton already constructed");
    }
  }
```

## Static factory method Singleton
Drugi sposób różni się od pierwszego tym , że udostępniania [static factory method]({% post_url /Effective-Java/Chapter-1/2018-04-14-static-factory-method-zamiast-konstruktora %}) w celu zwracania `INSTANCE`, tym samym zadeklarowania tego pola jako prywatne:

```java
public class Singleton {
  private static final Singleton INSTANCE = new Singleton();

  private Singleton() {
  }

  public static Singleton getInstance() {
    return INSTANCE;
  }
}
```

{% code java %}Singleton.getInstance();{% endcode %} zawsze zwróci ten sam obiekt.

{: .pros}
Bardziej elastyczny sposób.

Pozwala nam w każdym momencie zmienić zdanie np. możemy sprawić, że ta klasa nie będzie już *Singletonem* bez zmieniania API.

{: .pros}
Możliwość napisania generycznej fabryki Singletonów.

{: .pros}
Referencja do metody może być użyta jako Supplier.

`Singleton::instance`

### Singleton i lazy loading

Obie powyższe implementacje tworzą instancję klasy już w momencie załadowania klasy (chciwa inicjalizacja), nawet jeżeli nigdy nie zajdzie potrzeba jej wykorzystania.

Dzięki implementacji leniwego tworzenia obiektu można odwlec w czasie moment budowania instancji oraz potencjalnie oszczędzić zasoby, jeżeli nie będzie wcale potrzeby jego utworzenia. Można to zrobić w prosty sposób:

```java
public class Singleton {
  private static Singleton INSTANCE;

  private Singleton() {
  }

  public static Singleton getInstance() {
    if(INSTANCE == null) {
      INSTANCE = new Singleton();
    }
    return INSTANCE;
  }
}
```
Dzięki temu możemy też używać jej statycznych metod bez tworzenia instancji tej klasy.

### Singleton i Serializable

{: .note}
O serializacji będą osobne wpisy, ale dopiero w *Chapter 12. Serialization*. Jeśli nie wiesz co to jest, a chciałbyś się dowiedzieć, to polecam ten [wpis](http://www.samouczekprogramisty.pl/serializacja-w-jezyku-java/) na blogu samouczekprogramisty.pl.

Dodanie {% code java %}implements Serializable{% endcode %} do klasy nie jest wystarczające, aby singleton był rzeczywiście singletonem. Aby zagwarantować, że w systemie będzie tylko jedna klasa, musimy zadeklarować wszystkie pola jako `transient` oraz zdefiniować metodę:

```java
private Object readResolve() {
    return getInstance();
}
```

(lub {% code java %}return INSTANCE;{% endcode %} w przypadku gdy nie korzystamy z leniwej inicjalizacji)

Jeżeli klasa posiada taką metodę, to podczas deserializacji zwracany jest wynik jej działania.

W przeciwnym wypadku, za każdym razem kiedy serializowana klasa zostanie deserializowana, zostanie utworzona nowa instancja singletona.

### Singleton i wielowątkowość

Aby zabezpieczyć nasz naszą klasę singletona przed wielowątkowością, musimy nieco zmodyfikować metodę `getInstance()`:

```java
public class Singleton {
  private static volatile Singleton INSTANCE;

  public static Singleton getInstance() {
    if(INSTANCE == null) {
      synchronized (Singleton.class) {
        if (instance == null) {
          INSTANCE = new Singleton();
        }
      }
    }
    return INSTANCE;
  }
}
```

Jest to tak zwany *double-check-locking pattern*.

Jeśli dwa wątki jednocześnie przejdą pierwszego ifa i będą chciały pobrać instancję to zakolejkują się przed `synchronized()`. Dodatkowy zagnieżdżony `if` wyeliminuję próbę stworzenia duplikatu.

Zwróc uwagę, że zmienna `INSTANCE` jest oznaczona jako `volatile`. Jest to niezbędne. W przeciwnym wypadku *double-check-locking* nie działa. Jeśli interesuje Cię dlaczego tak musi być to na razie odsyłam do tematu [*Double-Checked Locking is Broken*](http://www.cs.umd.edu/~pugh/j[...]del/DoubleCheckedLocking.html). W rozdzale 11 (*Concurrency*) serii będzię poświecony temu osobny wpis.

## Static holder Singleton

Jest to bezpieczne rozwiązanie, które działa zgodnie z oczekiwaniami w wielowątkowym środowisku. Dzięki niemu mamy również zapewnione leniwe tworzenie instancji.

```java
public class Singleton {

  private Singleton() {
    if(Holder.INSTANCE != null) {
      throw new IllegalStateException("Singleton already constructed");
    }
  }

  public static Singleton getInstance() {
    return Holder.INSTANCE;
  }

  private static class Holder {
    private static final Singleton INSTANCE = new Singleton();
  }
}
```

W tym rozwiązaniu cały trud poprawnej implementacji wzorca zrzucamy na maszynę wirtualną Javy. Zmienna `INSTANCE` zostanie zainicjowana dopiero w momencie załadowania klasy `Holder`, czyli podczas pierwszego wywołania metody `getInstance()`. W konstruktorze opcjonalnie bronimy się przed refleksją.

{: .pros}
Static factory method

{: .pros}
Lazy initialization

{: .pros}
Thread safe

{: .pros}
Dobry zamiennik za *double-check-locking pattern*, który jest uważany za antywzorzec.

## Enum Singleton

```java
public enum Singleton {
  INSTANCE;
  //...
}
```
Korzystając z tego rozwiązania, osiągniemy wynik bardzo podobny do klasy [Public final field Singleton](#public-final-field-singleton).

Ten sposób jednak:

{: .pros}

Jest bardziej zwięzły
{: .pros}

Zapewnia odpowiednią serializację od razu
{: .pros}

Zapewnia nienaruszalna gwarancję jednej instancji

{: .pros}
Jest odporny na refleksję

{: .pros}
Jest odporny na klonowanie

Jeśli można się do czegoś przyczepić to:

{: .cons}
Brak *lazy loading*

{: .cons}
Enum nie może rozszerzać innej klasy

Ale za to może implementować interfejs.

Ten sposób wydaję się nieco nienaturalny, ale w książce *Effective Java* autor mówi, że często jest to najlepszy sposób implementacji *Singletona*. Jednak [Singleton static holder](#static-holder-singleton)  też jest całkiem dobrym rozwiązaniem - jest podobnie łatwy w implementacji, również cały ciężar poprawnej implementacji zrzucamy na mechanizmy Javy i wydaje się być bardziej naturalnym rozwiązaniem.

# Singleton jako antywzorzec

Singleton przez wielu programistów uważany jest za antywzorzec projektowy. Dzieje się tak głównie dlatego, że jest on dość często nadużywany lub często niepoprawnie implementowany.

Większość z zarzutów wobec niego przy odrobienie elastyczności można obejść lub nawet odrzucić.

{: .cons}
Utrudnia testowanie aplikacji

Testy są tylko utrudnione, jeżeli w singletonie przechowywany jest stan. Należy wtedy pamiętać, by był on odpowiednio zainicjowany lub wyczyszczony przed każdym wywołaniem testu.
Może też być problem w zmockowaniu *Singletona*, chyba, że implementuje interfejs, który służy jako jego typ.

{: .cons}
Zwiększa powiązania w kodzie (*tight coupling*)

{: .cons}
Łamie zasadę jednej odpowiedzialności (single responsibility principle)

Klasa zaimplementowana jako singleton z założenia jest już odpowiedzialna za dwie rzeczy: za realizację swoich funkcji biznesowych oraz zarządzanie instancją.

{: .cons}
Łamie zasadę [otwarte-zamknięte]({{ site.baseurl }}{% post_url /Notatnik-juniora/2017-11-30-zasady-projektowania-kodu %}#o---openclosed-principle) (Open/Closed principle), ponieważ nie można go rozszerzać

W pierwotnej wersji wzorca rzeczywiście ciężko jest go rozszerzać. Można jednak połączyć singleton z fabryką i nie będzie stanowiło to już problemu.

```java
interface Singleton {
}

public class SingletonFactory {

  private static Singleton instance;

  public static Singleton getInstance() {
    if (instance == null) {
      instance = new Singleton() {
        // singleton implementation
      };
    }

    return instance;
  }
}
```

{: .cons}
Jest to obiektowy zamiennik zmiennej globalnej

A jak wiemy zmienne globalne to zło...

# Podsumowanie
Singleton nie musi być wcale zły, pod warunkiem, że zaimplementujemy go w odpowiedni sposób. Należy jednak pamiętać, by go nie nadużywać i nie starać się go wprowadzać wszędzie na siłę. Wzorzec ten powinien być stosowany raczej sporadycznie.

Również z rozwagą trzeba podejść do przedstawianych zabezpieczeń przed różnymi atakami. W przypadku prostych aplikacji, szczególnie jeśli zajmujemy się nią tylko my, najprostsza implementacja w zupełności wystarczy.
