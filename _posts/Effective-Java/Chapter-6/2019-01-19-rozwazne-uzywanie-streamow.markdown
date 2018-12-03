---
layout:     post
titleSEO:	"Rozważne używanie streamów"
title:      "Rozważne używanie streamów"
subtitle:   "Co to jest pure function?"
date:       2019-01-19 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    7
item:       45, 46
---

{% include effective-java/series-info.html %}

# Co to są streamy i kiedy je używać

W Javie 8 dodane zostały streamy, aby ułatwić wykonywanie wielu operacji na zbiorze danych - sekwencyjnie lub równolegle. API dostarcza dwie abstrakcje: *stream* - czyli skończona lub nieskończona sekwencja danych i *stream pipline* czyli wieloetapowe przekształcenia i przeliczenia tych danych. Składa się to na zero lub więcej operacji pośrednich (które przekształcają w jakiś sposób *stream*, np. mapowanie, sortowanie, filtrowanie itd.) i jedną końcową (np. wrzucenie elementów do kolekcji, zwrócenie konkretnego elementu czy wyświetlanie ich w konsoli).

Streamy są wykonywane leniwie tzn. dopóki nie nie wywołamy końcowej operacji, to żadna operacja się nie wykona. To pozwala na pracę z nieskończonymi streamami.

API streamów jest płynne, tzn. możemy dowolnie łączyć różne wywołania w jedno wyrażenie.

Domyślnie streamy wykonywane są sekwencyjnie. Zamienienie ich na pracę współbieżną jest tak proste, jak wywołanie metody `parallel()` na streamie, **jednak nie zawsze jest to odpowiednie** - ten temat poruszę w ostatnim itemie tego rozdziału.

Stream API jest bardzo wszechstronne i możemy w nich wykonać niemal wszystko, nie znaczy to jednak, że powinniśmy od teraz robić wszystko w streamach. Dobre używanie streamów może skrócić kod i zwiększyć czytelność naszych programów, jednak nadużywanie ich może sprawić, że będzie odwrotnie. Dlatego najlepiej znaleźć złoty środek.

Zobaczmy to na przykładzie - program, który czyta słowa z pliku i wyświetla wszystkie anagramy (słowa składające się z tych samych liter, jednak w innej kolejności), których długość jest większa niż ta podana przez użytkownika.

```java
// Prints all large anagram groups in a dictionary iteratively
public class Anagrams {
    public static void main(String[] args) throws IOException {
        File dictionary = new File(args[0]);
        int minGroupSize = Integer.parseInt(args[1]);

        Map<String, Set<String>> groups = new HashMap<>();
        try (Scanner s = new Scanner(dictionary)) {
            while (s.hasNext()) {
                String word = s.next();
                groups.computeIfAbsent(alphabetize(word),
                    (unused) -> new TreeSet<>()).add(word);
            }
        }

        for (Set<String> group : groups.values())
            if (group.size() >= minGroupSize)
                System.out.println(group.size() + ": " + group);
    }

    private static String alphabetize(String s) {
        char[] a = s.toCharArray();
        Arrays.sort(a);
        return new String(a);
    }
}
```

Czyli tak - czytamy wszystkie słowa i wkładamy je do mapy. Klucz mapy to ułożone alfabetycznie litery danego słowa (np. dla "programowanie" będzie to "aaegimnooprrw"). Jako wartość, będą to kolejne słowa, które mają takie same litery. Potem wyświetlane są te, które spełniają wymóg długości podany do program.

{: .note}
Wstawianie wartości do mapy robione jest metodą `computeIfAbsent`, która została dodana w Javie 8. Ta metoda sprawdza, czy klucz jest już w mapie i zwraca jego wartość, jeśli istnieje - jeśli nie, to metoda przypisuje wartość obliczoną w podanym obiekcie funkcyjnym jako drugi argument i zwraca tę wartość. Ta metoda upraszcza implementację map, które przypisują kilka wartości do każdego klucza.

Teraz zobaczymy to samo, tylko wszystko wrzucone do streamów jak leci:

```java
// Overuse of streams - don't do this!
public class Anagrams {
    public static void main(String[] args) throws IOException {
        Path dictionary = Paths.get(args[0]);
        int minGroupSize = Integer.parseInt(args[1]);

        try (Stream<String> words = Files.lines(dictionary)) {
            words.collect(
                groupingBy(word -> word.chars().sorted()
                    .collect(StringBuilder::new,
                        (sb, c) -> sb.append((char) c),
                        StringBuilder::append).toString()))
                .values().stream()
                .filter(group -> group.size() >= minGroupSize)
                .map(group -> group.size() + ": " + group)
                .forEach(System.out::println);
        }
    }
}
```

Jest to nieco krótsze, ale też mniej czytelne, zwłaszcza dla kogoś, kto nie jest zaprzyjaźniony ze streamami. **Złoty środek, o którym mówiłem, to korzystanie z obu sposobów**:

```java
// Tasteful use of streams enhances clarity and conciseness
public class Anagrams {
   public static void main(String[] args) throws IOException {
      Path dictionary = Paths.get(args[0]);
      int minGroupSize = Integer.parseInt(args[1]);

      try (Stream<String> words = Files.lines(dictionary)) {
         words.collect(groupingBy(word -> alphabetize(word)))
           .values().stream()
           .filter(group -> group.size() >= minGroupSize)
           .forEach(group -> System.out.println(group.size() + ": " + group));
      }
   }

   // alphabetize method is the same as in original version
}
```

Łącząc podejście iteracyjne i funkcyjne (streamy) dostaniemy najlepsze rezultaty. Układanie alfabetycznie liter wyrazu jest wydzielone do osobnej **nazwanej** funkcji, co jasno określa, co się dzieje pod spodem i wyodrębnia szczegóły implementacyjne poza główny kod.

{: .note}
Wobec tego, że typy nie są widoczne w lambdach, warto dobrze nazywać parametry lambd, aby zwiększyć czytelność streamów. Z tego samego powodu używanie metod pomocniczych (jak `alphabetize`) w streamach jest dużo ważniejsze niż w kodzie iteracyjnym.


Poza tym jest też kilka rzeczy, które możemy robić w zwykłych blokach kodu, a nie możemy robić w lambdach:

- **W lambdzie można tylko czytać zmienne `final` lub `effectively final` i nie można modyfikować żadnej zmiennej lokalnej**.

- **W lambdzie nie można zwrócić wyniku do zewnętrznej funkcji, wywołać `break` lub `continue` w zewnętrznej pętli, lub rzucić jakiegokolwiek wyjątku, który zewnętrzna funkcja zadeklarowała.**

# Pure functions

Streamy to nie tylko API, to paradygmat oparty na programowaniu funkcyjnym. Aby uzyskać ekspresyjność, wydajność i w niektórych przypadkach zdolność do równoległego przetwarzania, które streamy oferują, trzeba zaadaptować nie tylko API, ale i paradygmat.

Najważniejszą rzeczą, do której powinniśmy dążyć, jest to, aby nasze obiekty funkcyjne były jak najbardziej zbliżone do tzn. *pure function*. *Pure function* to taka, która polega tylko na tym, co dostaje w argumencie - nie polega na żadnym innym zmiennym stanie ani nie zmienia stanu żadnego innego obiektu. Jednym słowem jest funkcją bez żadnych efektów ubocznych (*pure function = side-effects free function*). 

Zobaczmy na ten kawałek kodu, który tworzy mapę częstotliwości słów pobranych z pliku:

```java
// Uses the streams API but not the paradigm--Don't do this!
Map<String, Long> freq = new HashMap<>();
try (Stream<String> words = new Scanner(file).tokens()) {
    words.forEach(word -> {
        freq.merge(word.toLowerCase(), 1L, Long::sum);
    });
}
```

Co jest z tym kodem złego, jest czytelny, używa streamów, lambd i referencji do metod. Nawet działa zgodnie z założeniem. A no to, że to wcale nie jest kod streamowy. Jest to zwykły kod iteracyjny wrzucony do streamu. Nie czerpie żadnych korzyści z używania streamów, jest dłuższy niż powinien być i jest mniej czytelny. 

A to wszystko dlatego, że wykonuje wszystko w końcowej operacji `forEach`, używając lambdy, która zmienia stan zewnętrznego obiektu (mapy `freq`). **Operacja `forEach`, która robi coś więcej niż prezentowanie wyniku czy dodanie wyniku do istniejącej już kolekcji, to *bad smell*.**

Właściwe wykorzystanie streamów powinno wyglądać tak:

```java
// Proper use of streams to initialize a frequency table
Map<String, Long> freq;
try (Stream<String> words = new Scanner(file).tokens()) {
    freq = words.collect(groupingBy(String::toLowerCase, counting()));
}
```

Jeśli ktoś pisze kod, podobny do wcześniejszego, to dlatego, że robi to w sposób, w który robił to dotychczas i z którym jest oswojony - niczym się to nie różni od pętli for-each.

Lepsza wersja używa **Collectors API** (metody `groupingBy` i `counting`, które zostały zaimportowane statycznie dla lepszej czytelności). Jest to aż 39 metod, które są swego rodzaju implementacją strategi redukcji, tzn. łączenie elementów (w tym przypadku streamu) w pojedynczy obiekt. 

Oprócz tego najczęściej używa się collectory, które zbierają elementy streamu w kolekcję: `toList()`, `toSet()`, i `toCollection(collectionFactory)`. Zwracają kolejno listę, set i inny podany przez nas typ kolekcji. Poza tym są jeszcze różne wariacje zbierania elementów do mapy. 

Dla przykładu wyciągnięcie 10 słów z największą częstotliwością z poprzedniej mapy:

```java
// Pipeline to get a top-ten list of words from a frequency table
List<String> topTen = freq.keySet().stream()
    .sorted(comparing(freq::get).reversed())
    .limit(10)
    .collect(toList());
```

W klasie `Collectors` jest jeszcze masa użytecznych metod. Polecam zajrzeć na ten wpis [baeldung.com/java-8-collectors](https://www.baeldung.com/java-8-collectors).