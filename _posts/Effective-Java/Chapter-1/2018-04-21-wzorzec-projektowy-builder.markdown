---
layout:     post
titleSEO:	"Wzorzec projektowy Builder - kiedy warto używać?"
title:      "Wzorzec projektowy Builder"
subtitle:   "3 warianty. Kiedy jaki stosować? Wady i zalety."
date:       2018-04-21 10:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java Wzorce-projektowe
comments:   true
toc:        true
chapter:    2
item:       2
---

{% include effective-java/series-info.html %}

Zazwyczaj tworzymy klasy i inicjujemy jej pola za pomocą konstruktora z argumentami lub bezargumentowym konstruktorem i setterami. Nic złego w tym nie ma dopóki ilość argumentów nie przekracza 4-5 i mamy pola, które muszą zostać dostarczone. W takich wypadkach warto zastanowić się nad lepszym rozwiązaniem.

Weźmy na przykład taką oto klasę:

```java
public class Goal {
    private String name;
    private String description;
    private List<Level> levels;
    private Checklist checklist;
    private LocalDate deadline;
    private boolean achieved;
}
```

Posiada 6 pól do zainicjowania, nie wszystkie są wymagane, ale część jest kluczowa. Jak w takim przypadku będzie wyglądał konstruktor, jeśli chcemy użyć tego podejścia?

```java
public Goal(String name, ArrayList<Level> levels, Checklist checklist, boolean achieved) {
    this.name = name;
    this.levels = levels;
    this.checklist = checklist;
    this.achieved = achieved;
}
```
Nie jest źle, ilość wymaganych argumentów nie jest jeszcze przytłaczająca. Jak wygląda tworzenie instancji takiej klasy przez klienta?

```java
List<Level> levels = new ArrayList<>();
levels.add(new Level("5km", "Cookie"));
levels.add(new Level("10km", "Wine"));
levels.add(new Level("25km", "New laptop"));

Checklist checklist = new Checklist("Todos");
checklist.addItem(new ListItem("Buy shoes"));
checklist.addItem(new ListItem("Run every second day"));
checklist.addItem(new ListItem("Other"));


Goal goal = new Goal("Run the marathon", "My goal", levels, checklist, false);

//goal.setDeadline();  //Optional
```
Opcjonalnymi i wymaganymi polami można łatwo zarządzać używając konstruktorów. Możemy przypisać im wartości domyślne, wymusić utworzenie obiektu z określonymi parametrami itd.. Jednak to co zaczyna być mało praktyczne to konstruktor:

```java
Goal goal = new Goal("Run the marathon", "My goal", levels, checklist, false);
```

Ma 5 argumentów i zaczyna to być już mało czytelne. Szczególnie dla osoby, która nie pisała tego kodu. Po jakimś czasie i dla nas samych. Nie jest od razu jasne co jest czym. Przekazujemy jakieś dwa stringi, dwie listy i jakąś wartość boolean. Obecnie niektóre IDE np. InteliJ mają funkcje, które dopisują nazwę argumentu przed nim. Jest to małe ułatwienie, jednak nie powinniśmy na tym polegać. Kod powinien być czysty sam w sobie, a nie polegać na IDE.

Użycie podejścia z bezargumentowym konstruktorem i setterami poprawia czytelność kodu:

```java
Goal goal = new Goal();
goal.setName("Run the marathon");
goal.setDescription("My goal");
goal.setLevels(levels);
goal.setChecklist(checklist);
goal.setAchievied(false);
```

Jednak nie gwarantuje ono spójności klasy. Nie ma tutaj opcji, aby zmusić klienta, żeby ustawił wszystkie wymagane pola. Uniemożliwia to też stworzenie klasy niemutowalnej, co wymaga dodatkowego wysiłku, aby zapewnić *thread safety*. I tu z pomocą przychodzi *Builder*.

# Budowniczy (Builder) - wzorzec projektowy

Ten wzorzec projektowy ma kilka wariantów. W książce *Effective Java* poruszany jest tylko ten pierwszy. Dwa pozostałe są jako dodatek, który warto porównać. Ogólnie mówiąc Buildery są dodatkowymi klasami, który ułatwiają tworzenie innych złożonych klas.

## Inner Static Fluent Builder

```java
public class Goal {
    private String name;
    private String description;
    private List<Level> levels;
    private Checklist checklist;
    private LocalDate deadline;
    private boolean achieved;

    public static final class Builder {
        private String name;
        private String description;
        private List<Level> levels;
        private Checklist checklist;
        private LocalDate deadline;
        private boolean achieved = false;

        public Builder name(String name) {
           this.name = name;
           return this;
        }

        public Builder description(String description) {
           this.description = description;
           return this;
        }

        public Builder levels(List<Level> levels) {
            this.levels = levels;
            return this;
        }

        public Builder checklist(Checklist checklist) {
            this.checklist = checklist;
            return this;
        }

        public Builder deadline(LocalDate deadline) {
            this.deadline = deadline;
            return this;
        }

        public Builder achieved() {
            this.achieved = true;
            return this;
        }

        public Goal build() {
            if(name.isEmpty()){
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
Kolejne metody służą do konfigurowania pól w klasie `Goal` (możemy przeprowadzić też w nich walidację), które zwracają obiekt buildera, aby umożliwić ciągłe wywoływanie kolejnych metod (Fluent API). Ostatnia z nich - {% code java %}public Goal build(){% endcode %} służy do zbudowania obiektu i najczęściej przed tym do zweryfikowania czy wszystkie wymagane pola zostały zainicjowane.

**Istnieje też inny fajny sposób, aby wymusić ustawienie wszystkich pól w builderze** - napisałem o tym osobny post [idiotoodporne-api-klasy](https://bulldogjob.pl/news/348-idiotoodporne-api-klasy-czyli-jakie) dla [bulldogjob.pl](https://bulldogjob.pl/).

Stosując wzorzec *builder* możemy zagwarantować, że stworzona zostanie poprawna i kompletna klasa, zachowując czysty i łatwy w użyciu kod. Instancjowanie klasy wygląda wtedy tak:

```java
Goal goal = new Goal.Builder()
    .name("Run the marathon")
    .description("My goal")
    .levels(levels)
    .checklist(checklist)
    .achieved()
    .build();
```
Jak widać jest to dużo łatwiejsze do czytania jak i używania. Kolejne pola możemy podać w dowolnej kolejności, ze względu na wspomniane wcześniej *fluent API*.

Osobiście dla mnie składnia {% code java %}new Goal.Builder(){% endcode %} wygląda paskudnie, dlatego preferuję użyć tutaj [*static factory method*]({% post_url Effective-Java/Chapter-1/2018-04-14-static-factory-method-zamiast-konstruktora %}), żeby uzyskać dostęp do buildera w statyczny sposób, bez użycia *new* :

```java
public static Builder builder() {
    return new Builder();
}
```

I wtedy *buildera* możemy używać tak:

```java
Goal goal = Goal.builder()
    .name("Run the marathon")
    .description("My goal")
    .levels(levels)
    .checklist(checklist)
    .achieved()
    .build();
```

Możemy też uniemożliwić instancjowanie klasy zwykłym konstruktorem dodając go jako prywatny:

```java
private Goal() {
}
```

Zalety takiego rozwiązania:

{: .pros}
*Pozwala zachować niemutowalność klasy*

W tym wariancie buildera nie musimy udostępniać publicznego konstruktora ani setterów dla budowanego obiektu.

{: .pros}
Wymuszone użycia buildera, aby utworzyć instancję klasy


Dzięki temu możemy zapewnić, że klasa będzie zawsze spójna (jeśli zadbamy o to w Builderze).

{: .pros}
Builder może mieć kilka parametrów *var args*

A to dzięki temu, że każdy parametr jest w oddzielnej metodzie.


Dodatkowym plusem jest to, że możemy dodawać elementy np. do list w dynamiczny sposób, zamiast wypełniać całą listę wcześniej i przekazywać ją do konstruktora. W przykładzie *buildera* można to zrobić np. dla listy poziomów:

```java
    //...
    public Builder addLevel(Level level) {
        this.levels.add(level);
        return this;
    }
    //...
```
i wtedy zamiast takiego podawania poziomów:
```java
List<Level> levels = new ArrayList<>();
levels.add(new Level("5km", "Cookie"));
levels.add(new Level("10km", "Wine"));
levels.add(new Level("25km", "New laptop"));

Goal goal = Goal.builder()
    .name("Run the marathon")
    .description("My goal")
    .levels(levels)
    .checklist(checklist)
    .achieved(false)
    .build();
```

Można podać tak:

```java
Goal goal = Goal.builder()
    .name("Run the marathon")
    .description("My goal")
    .addLevel(new Level("5km", "Cookie"))
    .addLevel(new Level("10km", "Wine"))
    .addLevel(new Level("25km", "New laptop"))
    .checklist(checklist)
    .achieved(false)
    .build();
```

Podobnie można by zrobić z *checklistą*. Wszystko ku lepszej czytelności.


## Fluent Builder

Ten różni się od pierwszego tym, że *Builder* implementujemy jako osobną klasę:

```java
public final class GoalBuilder {
    private String name;
    private String description;
    private List<Level> levels;
    private Checklist checklist;
    private LocalDate deadline;
    private boolean achieved = false;

    public GoalBuilder name(String name) {
        this.name = name;
        return this;
    }

    //other methods..

    public Goal build() {
        //...
    }
}
```

Niesie to za sobą pewne konsekwencje:

{: .cons}
Musimy udostępnić settery dla prywatnych pól budowanego obiektu.


{: .cons}
Musimy udostępnić publiczny konstruktor.


Często takie rozwiązanie się nie sprawdza np. ze względu na to, że obiekt powinien być niemutowalny, dlatego preferowana jest implementacja jako wewnętrzna statyczna klasa.

Użycie wygląda podobnie:

```java
Goal goal = new GoalBuilder()
        .name("Run the marathon")
        .description("My goal")
        .levels(levels)
        .checklist(checklist)
        .achieved(false)
        .build();
```

{: .idea}
Pisanie builderów jest nużące i powtarzalne, dlatego powstały liczne pluginy do IDE, które generują je za nas. Dla InteliJ mamy na przykład plugin *Builder Generator*. Po zainstalowaniu wystarczy kliknąć <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> i wyskoczy nam opcja do wygenerowania buildera. <br> <br>
    Powstały również do tego całe biblioteki. Jedną z nich jest np. [Lombok](https://projectlombok.org/) (Który udostępnia szereg innych funkcji). Wystarczy dorzucić do klasy adnotację {% code java %}@Builder{% endcode %} i już możemy korzystać z *Buildera* za pomocą statycznej metody {% code java %}builder(){% endcode %}.


## Classic Builder GOF
Klasyczny budowniczy od gangu czworga (*Gang of four*) adresuje całkiem inny problem i wygląda całkiem inaczej. Jest to bardziej strategia tworzenia obiektów, której celem jest oddzielenie tworzenia obiektu od jego reprezentacji, dzięki czemu ten sam proces konstrukcji jest wykorzystywany do powstawania różnych reprezentacji.

W tym wzorców mamy kilka elementów:

- *Builder* - interfejs dla builderów
- *ConcreteBuilders* - jego implementacje, zawierają tak jakby plan wykonania poszczególnych części
- *Director*  - tworzy obiekty wykorzystując *Buildery*, czyli wykorzystuje plany na poszczególne części
- *Product* - czyli to co dostaje klient od *Directora*

Ten wzorzec nie ma zastosowania w przykładzie z tworzeniem klasy *Goal*, ponieważ "cel" nie ma zazwyczaj predefiniowanych konkretnych implementacji. Moglibyśmy tak zrobić, ale to raczej mało realny przykład. Jako przykład mogę podać narzędzie do zbierania statystyk dla języków programowania, które tworzyłem dla mojej strony [jaki-jezyk-programowania.pl](https://jaki-jezyk-programowania.pl/). Tam zaprojektowałem kod w podobny sposób.

*Builder*:

```java
public interface DataScraper {

  void scrapDataFor(String[] languages);

  String getName();

  JSONObject getData();

}
```

Jest to "scraper", ale zasada podobna. Po prostu zamiast metod z przedrostkiem `build`, są `get`. Buildery mają zazwyczaj więcej takich metod, ponieważ stosuje je się do tworzenia skomplikowanych obiektów.

*ConcreteBuilders*:

```java
public class GithubDataScraper implements DataScraper {
    private static final String NAME = "Github";
    private Map<String, JSONObject> githubData = new HashMap<>();

    @Override
    public void scrapDataFor(String[] languages) {
       //scraping implementation for Github
    }

    @Override
    public String getName() {
       return NAME;
    }

    @Override
    public JSONObject getData() {
        return new JSONObject(githubData);
    }
}
```

```java
public class StackOverflowDataScraper implements DataScraper {
   private static final String NAME = "StackOverflow";
   private Map<String, JSONObject> stackOverflowData = new HashMap<>();

   @Override
   public void scrapDataFor(String[] languages) {
      //scraping implementation for StackOverflow
   }

   @Override
   public String getName() {
       return NAME;
   }

   @Override
   public JSONObject getData() {
       return new JSONObject(stackOverflowData);
   }
}
```

```java
public class MeetupDataScraper implements DataScraper {
    private static final String NAME = "Meetup";
    private Map<String, JSONObject> meetupData = new HashMap<>();

    @Override
    public void scrapDataFor(String[] languages) {
        //scraping implementation for Meetup
    }

    @Override
    public String getName() {
        return NAME;
    }

    @Override
    public JSONObject getData() {
        return new JSONObject(meetupData);
    }
}
```
i tak dalej jeszcze dla SpectrumDataScraper, TiobeIndexDataScraper i LanguageVersionsDataScraper.

*Director*:

```java
public class Statistics {
    private String[] languages;

    public void collectFor(String[] languages) {
        this.languages = languages;
    }

    public JSONObject build(DataScraper dataScraper) {
        JSONObject statistics = new JSONObject();
        dataScraper.scrapDataFor(languages);
        statistics.put("name", dataScraper.getName());
        statistics.put("data", dataScraper.getData());
        return statistics;
    }
}
```
Tu jest nieco zmodyfikowana wersja. W książkowym przykładzie *Director* dostaje *Builder* w konstruktorze, jednak nie do końca rozumiem dlaczego tak jest. Wymusza to tworzenie nowej instancji *Directora* za każdym razem, gdy tworzymy nowy obiekt. Ja zaimplementowałem to tak, że używamy cały czas tego samego *Directora* do budowania różnych obiektów. A tak wygląda użycie przez klienta:

```java
public class App {
    String[] languages = {"C", "C++", "Java", "JavaScript", "Python", "Swift", "R", "Csharp", "Ruby", "PHP"};

    Statistics statistics = new Statistics();
    statistics.collectFor(languages);

    JSONObject tiobeIndexStats = statistics.build(new TiobeIndexDataScraper());
    JSONObject meetupStats = statistics.build(new MeetupDataScraper());
    JSONObject stackOverFlowStats = statistics.build(new StackOverflowDataScraper());
    JSONObject spectrumStats = statistics.build(new SpectrumDataScraper());
}
```

*Productem* jest po prostu JSONObject.

Jeśli chciałbym to zrobić jak w książkowym przykładzie to wyglądałoby to tak:

```java
JSONObject tiobeIndexStats = new Statistics(new TiobeIndexDataScraper()).build();
JSONObject meetupStats = new Statistics(new MeetupDataScraper()).build();
JSONObject stackOverFlowStats = new Statistics(new StackOverflowDataScraper()).build();
JSONObject spectrumStats = new Statistics(new SpectrumDataScraper()).build();
```

Tylko problem pojawia się w tym, że nie mam jak podać do *Directora* listy języków dla których ma zebrać dane. Musiałbym za każdym razem podawać go do konstruktora *Directora* lub *Scrapera*:

```java
String[] languages = {"C", "C++", "Java", "JavaScript", "Python", "Swift", "R", "Csharp", "Ruby", "PHP"};

JSONObject tiobeIndexStats = new Statistics(new TiobeIndexDataScraper(), languages).build();
JSONObject meetupStats = new Statistics(new MeetupDataScraper(), languages).build();
JSONObject stackOverFlowStats = new Statistics(new StackOverflowDataScraper(), languages).build();
JSONObject spectrumStats = new Statistics(new SpectrumDataScraper(), languages).build();
```

lub

```java
String[] languages = {"C", "C++", "Java", "JavaScript", "Python", "Swift", "R", "Csharp", "Ruby", "PHP"};

JSONObject tiobeIndexStats = new Statistics(new TiobeIndexDataScraper(languages)).build();
JSONObject meetupStats = new Statistics(new MeetupDataScraper(languages)).build();
JSONObject stackOverFlowStats = new Statistics(new StackOverflowDataScraper(languages)).build();
JSONObject spectrumStats = new Statistics(new SpectrumDataScraper(languages)).build();
```

Co jest nieco nadmiarowe i przynajmniej w tym wypadku robienie nowej instancji *Directora* za każdym razem jest zbędne.

Widziałem też przykłady gdzie wszystko było instancjonowane w osobnej linijce... Według mnie to *overkill* bo zamiast jednej linijki:

```java
JSONObject tiobeIndexStats = statistics.build(new TiobeIndexDataScraper());
```
 byłoby coś takiego:

```java
TiobeIndexDataScraper tiobeIndexDataScraper = new TiobeIndexDataScraper();
Statistics tiobeIndexDirector = new Statistics(new TiobeIndexDataScraper());
tiobeIndexDirector.collectFor(languages):
JSONObject tiobeIndexStats = tiobeIndexDirector.build();
```

To mówi chyba samo za siebie ;)

## Wady

{: .cons}
Koszt tworzenia buildera

Kod buildera jest dosyć rozwlekły. Koszt napisania buildera nie jest może zbyt duży (szczególnie jeśli zostanie wygenerowany), jednak może mieć znaczenie wydajnościowe. Dlatego ten wzorzec powinniśmy stosować tylko wtedy kiedy klasa będzie mieć przynajmniej 4 wymagane pola (lub wiemy, że ta liczba urośnie) i nie jest to aplikacja *performance-critical*. Przy mniejszej ilości parametrów jest to *overengineering*.

{: .note}
Gdyby w Javie występowały parametry nazwane (tak jak np. w Kotlinie), to ten wzorzec byłby zbędny. Można by powiedzieć, ze jest to bardziej obejście dla brakującej funkcjonalności języka niż wzorzec projektowy. Gdyby Java miała taki *feature* to wystarczyłoby użyć konstruktora:

{% highlight java %}
Goal goal = new Goal(
    name="Run the marathon",
    description="My goal",
    levels=levels,
    checList=checklist
    achieved=false);
{% endhighlight %}
