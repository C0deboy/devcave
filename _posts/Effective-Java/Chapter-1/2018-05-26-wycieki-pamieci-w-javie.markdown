---
layout:     post
titleSEO:   "Wycieki pamięci, zarządzanie pamięcią i garbage collector w Javie"
title:      "Wycieki pamięci w Javie"
subtitle:   "Zarządzanie pamięcią - czy garbage collector zawsze to zrobi za nas?"
date:       2018-05-26 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    2
item:       7
---

{% include /effective-java/series-info.html %}

Java posiada *garbage collector*, który zajmuję się za nas zarządzaniem pamięcią. Można by pomyśleć, że możemy całkowicie zapomnieć o zarządzaniu pamięcią, jednak nie do końca.

# Wycieki pamięci

Czym są wycieki pamięci? Wyciek pamięci następuje wtedy, kiedy dane obiekty nie są już używane przez aplikację, ale *garbage collector* nie jest w stanie ich usunąć, ponieważ w naszej aplikacji nadal są przechowywane do nich referencje. W rezultacie zużywane jest coraz więcej zasobów znacząco spowalniając naszą aplikację, aż do momentu, kiedy ich braknie i rzucony zostanie `OutOfMemoryError`.

Jednak brak `OutOfMemoryError` nie jest jednoznaczne z tym, że nie mamy do czynienia z wyciekiem pamięci. Wyciek pamięci może mieć miejsce bez żadnych zgłoszonych errorów. Po prostu skończy się na tym, że gwałtownie spadnie wydajność naszej aplikacji ze względu nadmiernej pracy *garbage collectora*.

Wycieki pamięci nie dają o sobie znać w oczywisty sposób.  Są zazwyczaj wykrywane podczas ostrożnego przeglądania kodu lub z pomocą narzędzi do debugowania znanych jako *heap profiler*. Dlatego warto jest poznać temat i zapobiegać takim sytuacją wcześniej.

Tutaj jest przykładowa implementacja klasy `Stack`, która pozornie wygląda w porządku, jednak może prowadzić do wycieków pamięci:

```java
public class Stack {
   private Object[] elements;
   private int size = 0;
   private static final int DEFAULT_INITIAL_CAPACITY = 16;

   public Stack() {
      elements = new Object[DEFAULT_INITIAL_CAPACITY];
   }

   public void push(Object e) {
      ensureCapacity();
      elements[size++] = e;
   }

   public Object pop() {
      if (size == 0)
         throw new EmptyStackException();
      return elements[--size];
   }

   /**
   * Ensure space for at least one more element, roughly
   * doubling the capacity each time the array needs to grow.
   */
   private void ensureCapacity() {
      if (elements.length == size)
         elements = Arrays.copyOf(elements, 2 * size + 1);
   }
}
```

Problem jest w metodzie `pop`. Obiekty, które zostały już pobrane ze stosu, nie są zbierane przez *garbage collector*, nawet jeśli stos już ich nie używa.  Dzieje się tak dlatego, że nieumyślnie zachowujemy referencje do nieużywanych już obiektów w tablicy `elements`. Po angielsku nazywamy je *obsolate references*.

Ponadto wszystkie referencje do innych obiektów, które są w nich przetrzymywane również są wykluczone z *garbage collection*, co może powodować, że wiele obiektów może nie być zebranych przez *garbage collector*, powodując potencjalny spadek wydajności aplikacji.

### Nullowanie nieużywanych referencji

Problem można naprawić dosyć łatwo - nullować niepotrzebne już referencje do obiektów.

Poprawna implementacja metody `pop()`:

```java
public Object pop() {
   if (size == 0)
      throw new EmptyStackException();
   Object result = elements[--size];
   elements[size] = null; // Eliminate obsolete reference
   return result;
}
```
Dodatkowym plusem jest to, że jeśli potem przez pomyłkę znów program chciałby uzyskać do niej dostęp, to od razu wyrzuci `NullPointerException`, zamiast po cichu robić coś nieplanowanego.

**Nie oznacza to jednak, że powinniśmy nullować każdą możliwą referencję do obiektu, jeśli program przestał jej już używać. Należy to robić tylko w wyjątkowych sytuacjach.**

{: .note}
Nieużywane referencje do obiektów są automatycznie zbierane przez *garbage collector*, gdy zmienna przechowująca referencję wypada z zasięgu. <br>  <br>
**Best practice:** definiuj zmienne w najmniejszym możliwe *scope-ie*.

Kiedy więc nullować referencje? Dlaczego w klasie `Stack` powinniśmy to robić?

A no dlatego, że sama zarządza swoją pamięcią. W tym przykładzie *storage pool* składa się z elementów tablicy `elements`. Tylko te elementy, które są w aktywnej części tablicy (czyli te o indeksach mniejszych od wielkości stosu) są ważne, a pozostałe są wolne i nie będą już nigdy użyte. Ale nie ma opcji, żeby *garbage collector* o tym wiedział. Tylko programista o tym wie, dlatego powinien dać o tym znać *garbage collectorowi* poprzez nullowanie nieużywanych już obiektów w tablicy `elements`.

**Zatem powinniśmy nullowac referencję tylko wtedy, kiedy klasa sama zarządzająca swoją pamięcią.**

W innych przypadkach jest to zbędne i tylko zaśmieca kod.

## Cachowanie

Innym źródłem wycieków pamięci jest cachowanie.  Najprostszym typem danych w którym możemy trzymać dane w cachu  jest `HashMap`. W wielowątkowych zastosowaniach będzie to `ConcurrentHashMap`.

Kiedy dodamy obiekt do *cache* łatwo jest o nim zapomnieć i trzymać go w nim długo po tym jak jest potrzebny. Jest kilka rozwiązań tego problemu:

Jeśli obiekt w *cache* jest ważny tylko przez czas kiedy na zewnątrz są referencje do klucza tego obiektu - użyj `WeakHashMap` , bo tak właśnie działa `WeakHashMap`.

{: .warning}
Referencje do samego obiektu nie są ważne, liczy się tylko referencja do klucza.

Częściej jednak to, czy obiekt jest już bezużyteczny, nie jest tak łatwo zdefiniowane. Może np. tracić na wartości z czasem. W takich przypadkach *cache* powinien być zwalniany okazjonalnie z obiektów, które już od jakiegoś czasu wyszły z użycia. Możemy to zrobić używając wątku w tle (np. `ScheduledThreadPoolExecutor`) lub wtedy, kiedy dodajemy nowy obiekt do *cache*.

Tego drugiego sposobu używa np. `LinkedHashMap` ze swoją metodą `removeEldestEntry`, którą możemy nadpisać z naszą logiką określającą, czy powinniśmy usunąć najstarszy obiekt w mapie:

```java
int MAX_ENTRIES = 3;

Map<Integer, String> lhm = new LinkedHashMap<Integer, String>(MAX_ENTRIES + 1, .75F, false) {

  protected boolean removeEldestEntry(Map.Entry<Integer, String> eldest) {
     return size() > MAX_ENTRIES;
  }
};

lhm.put(0, "H");
lhm.put(1, "E");
lhm.put(2, "L");
lhm.put(3, "L");
lhm.put(4, "O");

System.out.println(lhm);
//{2=L, 3=L, 4=O}
}
```

W tym przykładzie działa to tak, że jeśli mapa przekroczy określoną wielkość (w tym przypadku 3) to zostanie z niej usunięta najstarsza wartość. Jak widać z pięciu włożonych elementów `H, E, L, L, O` zostały 3 najnowsze `L, L, O`.

W książce autor pisze, że dla bardziej złożonych *cache*-y można użyć klas z pakietu `java.lang.ref`, które reprezentują różne typy referencji do obiektów, jednak implementowanie swojego *cache* zazwyczaj jest złym pomysłem. Mamy do tego gotowe rozwiązania jak [Guava Cache](http://www.baeldung.com/guava-cache), [Ehcache](http://www.baeldung.com/ehcache) czy mechanizm cachowania w Springu.

Jako rozszerzenie tego tematu polecam prezentację [On-heap cache vs Off-heap cache w Javie - Radek Grębski](https://www.youtube.com/watch?v=wfPl_aNj4Pc)

## Listenery i inne callback-i

Jest to kolejne popularne źródło wycieków pamięci. Jeśli implementujesz API, gdzie klient rejestruje *callback*, ale nie wyrejestrowuje ich bezpośrednio, to będą się gromadzić dopóki nie wykonasz jakiejś akcji. Jednym sposobem na zagwarantowanie, że zostaną one zebrane przez *garbage collector* jak nie będą już potrzebne, jest przechowywane tylko ich *weak references* np. przechowując je jako klucze w `WeakHashMap`.

## Inne drogi do wycieków pamięci

- deklarowanie "ciężkiego" obiektu lub kolekcji jako *static* - cykl życia obiektu zadeklarowanego jako *static* jest równy cyklu życia JVM, czyli nigdy nie zostanie zebrany przez GC.
- Niezamknięte streamy i inne `Closeable`
- Dodawanie obiektów bez `hashCode()` i  `equals()` do *hash* kolekcji np. `HashSet` - metody takie jak `remove()`, `contains()` itd. nie będą działać poprawnie. Również próby dodania duplikatów zakończą się sukcesem, co nie powinno mieć miejsca w przypadku `HashSet`. Będzie o tym też mowa w kolejnych postach z rozdziału *Methods Common to All Objects*
- Autoboxing, czyli mieszanie typów prostych i ich wraperów w pętlach - przykład był w [poprzednim poście]({% post_url Effective-Java/Chapter-1/2018-05-19-unikaj-tworzenia-niepotrzebnych-obiektow %})