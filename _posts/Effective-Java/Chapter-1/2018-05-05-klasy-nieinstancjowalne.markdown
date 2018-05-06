---
layout:     post
titleSEO:	"Klasy typu utility / helper. Lepiej ich unikać?"
title:      "Klasy typu utility / helper"
subtitle:   "Czyli klasy nieinstancjowalne. Lepiej ich unikać?"
date:       2018-05-05 10:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        false
chapter:    2
item:       4
---

{% include effective-java/series-info.html %}

# Klasy nieinstancjowalne

Klasy nieinstancjowalne to takie, dla których nie możemy utworzyć instancji - czyli używamy ich w sposób statyczny (nie mam tu na myśli klas abstrakcyjnych, które też są nieinstancjowalne). Takie klasy mają dosyć złą reputację, bo często są nadużywane i stosowane tam, gdzie nie powinny. Szczególnie widoczne jest to u początkujących programistów, którzy unikają myślenia obiektowego i mają "proceduralne" nawyki. Jednak takie klasy mają też i swoje akceptowalne zastosowania.

Klasy nieinstancjowalne to zazwyczaj klasy typu *utility*/*helper*, które są zbiorem statycznych metod i pól (często operujące na prymitywach). Przykładem takich klas są np. `java.lang.Math` i `java.util.Arrays`. Innym przykładem są klasy, które zawierają [*static method factories*]({{ site.baseurl }}{% post_url /Effective-Java/Chapter-1/2018-05-05-klasy-nieinstancjowalne %}) dla obiektów o wspólnym interfejsie np. `java.util.Collections`. (Od Javy 8 można je umieszczać na interfejsie, nie ma potrzeby tworzenia do tego specjalnej klasy). Klasy nieinstancjowalne znajdziemy również w wielu bibliotekach.

Są to klasy, które z założenia nie powinny być instancjowalne - bo po prostu instancja takiej klasy nie ma sensu. Nie przechowują żadnego stanu - są tylko zbiorem często wykorzystywanych metod, które z reguły powinny być ze sobą powiązane (nie ładujemy wszyskiego do jednej klasy, np. metody operujące na stringach nie powinny się mieszać z metodami operującymi na plikach...)

Jedynym słusznym sposobem na to, by klasa była nieinstancjowalna jest zadeklarowanie dla niej prywatnego konstruktora:

```java
// Noninstantiable utility classChapter-1
public class UtilityClass {
    private UtilityClass() {
        throw new AssertionError();
    }
}
```

**Deklaracja klasy jako abstrakcyjnej nie jest odpowiednim sposobem, aby to osiągnąć (ani do końca nie działa).** Można ją rozszerzyć i wtedy podklasa może być instancjowalna. Po drugie zachęca to do myślenia, że klasa została stworzona do rozszerzania, a tak nie jest.

Kiedy konstruktor jest prywatny, nie ma możliwości stworzenia instancji klasy poza jej wnętrzem.

{% code java %}throw new AssertionError();{% endcode %} jest tutaj opcjonalnie - zapewnia, aby konstruktor nie zostanie wywołany omyłkowo wewnątrz tej klasy lub poprzez refleksję.

Kiedy implementujemy takie klasy trzeba rozważyć następujące problemy:

{: .cons}
Nie ma możliwości rozszerzania klasy z prywatnym konstruktorem.

{: .cons}
Trudność w testowaniu jednostkowym.

Podczas gdy klasę utility można łatwo przetestować w izolacji, to klasy, które ją używają już nie. Klasy utility najczęściej wykorzystywane są bezpośrednio ({% code java %}UtilityClass.DoStuff(){% endcode %}) co w konsekwencji utrudnia ich mockowanie. Ma to tym większe znaczenie im klasa utility wykonuje cięższe operacje (najczęsciej na , które chcielibyśmy zmockować, aby zwiększyć wydajność testu.

*W Javie istnieje narzędzie do testowania o nazwie [Powermock](https://github.com/powermock/powermock), które to potrafi, ale uznawane jest, że jeśli twoja aplikacja potrzebuję tego narzędzia, aby coś mogło zostać przetestowane, to najprawdopodobniej twoja aplikacja jest źle zaprojektowana i na tym powinieneś się skupić.

Szczególne znaczenie ma to podczas korzystania z frameworków *Dependency Injection* jak np. Spring. Wtedy takie klasy powinniśmy być w stanie wstrzyknąć jako zależność, żeby później można było łatwo je zmockować. W takich przypadkach powinny to być instancjowalne klasy bez statycznych metod, które można wstrzyknąć jako Singletony.

{: .note}
W Springu *beany* są Singletonami domyślnie.

Podsumowując, klasy "statyczne" nie są czystym złem, jednak powinny być używane raczej sporadycznie. Zanim zdecydujesz się na ich użycie, upewnij się czy kolejna metoda, którą będziesz chciał dorzucić do klasy typu "helper", nie powinna się znaleźć w bardziej odpowiedniej i konkretnej klasie.
