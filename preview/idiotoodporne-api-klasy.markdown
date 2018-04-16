---
layout:     post
titleSEO:	"Idiotoodporne API klasy - czyli API, które prowadzi klienta za rękę"
title:      "Idiotoodporne API klasy"
subtitle:   "Czyli API, które prowadzi klienta za rękę"
date:       2018-04-25 12:00:00
author:     "Codeboy"
category:   Notatnik-Juniora
tags:	    [Notatnik-Juniora, Dobre-praktyki, Java]
comments:   false
sitemap: false
---


W wpisie z serii "Effective Java" na moim blogu omawiałem [wzorzec projektowy Builder](/preview/wzorzec-projektowy-builder). Była tam mowa o tym, że zazwyczaj w metodzie {% code java %}public Goal build(){% endcode %} weryfikujemy przed zbudowaniem obiektu czy wszystkie wymagane pola zostały podane. Dla przykładowej klasy z poprzedniego wpisu wyglądało to tak:

```java 
public class Goal {
  private String name;
  private String description;
  private List<Level> levels;
  private Checklist checklist;
  private LocalDate deadline;
  private boolean achieved;
  
  public static Builder builder() {
    return new Builder();
  }

  public static final class Builder {
    //...
    
    public Goal build() {
      if(name.isEmpty()){
        throw new IllegalStateException("Name cannot be empty");
      }
      if(description.isEmpty()){
        throw new IllegalStateException("Name cannot be empty");
      }
      if(levels.isEmpty()){
        throw new IllegalStateException("Levels cannot be empty");
      }

      Goal goal = new Goal();
      goal.deadline = this.deadline;
      goal.name = this.name;
      goal.checklist = this.checklist;
      goal.levels = this.levels;
      goal.description = this.description;
      goal.achieved = this.achieved;
      return goal;
    }
  }
}
```
Mamy tu dwa problemy.

1. Dla każdego wymaganego pola musimy pisać `if`, który sprawdza czy pole zostało podane i jeśli nie to rzuca wyjątkiem, co nie jest zbyt ładnym rozwiązaniem. 
2. Klient, który używa buildera nie ma pojęcia o tym co jest wymagane, a co nie. Dowie się dopiero wtedy, gdy spróbuje odpalić program i dostanie wyjątek.

Możemy uprzyjemnić kod dla klienta i wyeliminować te problemy poprzez odpowiednie zaprojektowanie klasy. A z pomocą przychodzą interfejsy.

# Idiotoodporne API klasy

W przykładzie z builderem będzie to działało tak, że przed zbudowaniem obiektu klient będzie musiał użyć wszystkie wymagane metody w odpowiedniej kolejności, bo nawet nie będzie miał możliwości wywołania metody `build()` - jeśli tego nie zrobi. W skrócie - będzie cały czas prowadzony za rączkę.

Do klasy (w tym przypadku `Goal`) będziemy musieli dodać wewnętrzne publiczne interfejsy. Wewnętrzne, bo nie ma potrzeby definiowania ich w globalnym zasięgu, przez co drzewo pakietowe może całkiem spuchnąć (takich interfejsów może być sporo). Preferuję zrobić to na końcu klasy:

```java 
public class Goal {
  //fields

  public static class Builder {
    //builder implementation
  }

  public interface NeedName {
    public NeedDescription name(String name);
  }

  public interface NeedDescription {
    NeedLevels description(String description);
  }

  public interface NeedLevels {
    NeedLevels addLevel(Level level);

    CanBeBuild and();
  }

  public interface CanBeBuild {
    CanBeBuild checklist(Checklist checklist);

    CanBeBuild deadline(LocalDate deadline);

    CanBeBuild achieved();

    Goal build();
  }
}
```

{: .note}
Jeśli klasa będzie używana tylko w tym samym pakiecie, to interfejsy mogą pozostać *package-private*, czyli można im usunąć modyfikator dostępu `public`.

Interfejsy te odwzorowują kolejne kroki w używaniu API klasy. W tym przykładzie, interfejsy nazwane według konwencji `Need*` określają kolejne pola, które builder musi mieć zdefiniowane oraz zwracają kolejny interfejs, który odpowiada za następny krok. Ostatni interfejs `CanBeBuild` określa, że klasa jest już gotowa do wykonania finalnej metody (w tym przypadku `build()`) oraz umożliwia jeszcze ustawienie opcjonalnych pól.

Teraz wystarczy sprawić, żeby builder implementował wszystkie zdefiniowane interfejsy oraz zmodyfikować metodę `build()`, aby zwracała interfejs buildera reprezentujący pierwszy krok. W tym przypadku to `NeedName`:

```java 
public class Goal {
  //fields
  
  public static NeedName builder() {
    return new Builder();
  }
    
  public static class Builder {
    //builder implementation
  }

  //interfaces
}
```

Cała klasa z builderem będzie wyglądać następująco:

```java 
public class Goal {
  private String name;
  private String description;
  private List<Level> levels;
  private Checklist checklist;
  private LocalDate deadline;
  private boolean achieved;

  public static NeedName builder() {
    return new Builder();
  }

  public static class Builder implements NeedName, NeedDescription, NeedLevels, CanBeBuild {
    private String name;
    private String description;
    private List<Level> levels;
    private Checklist checklist;
    private LocalDate deadline;
    private boolean achieved = false;

    @Override
    public Builder name(String name) {
      this.name = name;
      return this;
    }

    @Override
    public Builder description(String description) {
      this.description = description;
      return this;
    }

    @Override
    public Builder checklist(Checklist checklist) {
      this.checklist = checklist;
      return this;
    }

    @Override
    public Builder deadline(LocalDate deadline) {
      this.deadline = deadline;
      return this;
    }

    @Override
    public Builder achieved() {
      this.achieved = true;
      return this;
    }

    @Override
    public Builder addLevel(Level level) {
      levels.add(level);
      return this;
    }

    @Override
    public Builder and() {
      return this;
    }

    public Goal build() {
      Goal goal = new Goal();
      goal.deadline = this.deadline;
      goal.name = this.name;
      goal.checklist = this.checklist;
      goal.levels = this.levels;
      goal.description = this.description;
      goal.achieved = this.achieved;
      return goal;
    }
  }

  public interface NeedName {
    public NeedDescription name(String name);
  }

  public interface NeedDescription {
    NeedLevels description(String description);
  }

  public interface NeedLevels {
    NeedLevels addLevel(Level level);

    CanBeBuild and();
  }

  public interface CanBeBuild {
    CanBeBuild checklist(Checklist checklist);

    CanBeBuild deadline(LocalDate deadline);

    CanBeBuild achieved();

    Goal build();
  }
}
```

Trochę zabiegu z tym jest, szczególnie w bardziej rozbudowanych przypadkach, ale dostajemy dzięki temu "idiotoodporną" klasę, której nie da się źle użyć. Bo jak teraz wygląda korzystanie z buildera?

Dobieramy się do instancji buildera i próbujemy wywołać metodę, a tam jest dostępna tylko opcja podania `name()`:

![builder ostepne metody](/img/effective-java/builder-step-1.PNG)

Zwracany jest interfejs `NeedDescription` i analogicznie można użyć tylko jednej metody:

![builder dostepne metody](/img/effective-java/builder-step-2.PNG)

Następnie zwracany jest interfejs `NeedLevels`, który umożliwia dodanie dowolnej liczby poziomów do naszego celu:

![builder dostepne metody](/img/effective-java/builder-step-3.PNG)
![builder dostepne metody](/img/effective-java/builder-step-4.PNG)
![builder dostepne metody](/img/effective-java/builder-step-5.PNG)

i z pomocą metody `and()` - przejście do ostatniego kroku, gdzie mamy już możliwość zbudowania obiektu lub jeszcze użyć jakiejś opcjonalnej metody:

![builder dostepne metody](/img/effective-java/builder-step-6.PNG)

Więc dodajmy jeszcze *deadline*:

![builder dostepne metody](/img/effective-java/builder-step-7.PNG)

i możemy w końcu zbudować klasę:

![builder dostepne metody](/img/effective-java/builder-step-8.PNG)


Jak widać dzięki takiemu rozwiązaniu możemy w dowolny sposób manipulować tym, w jaki sposób klasa ma być używana przez klienta. 

Można tak zaprojektować dowolną klasę. Jest to całkiem elastyczne i uniwersalne rozwiązanie.

Jeśli spodobał Ci się wpis to zajrzyj na blog autora - [devcave.pl](https://devcave.pl/)