---
layout:     post
titleSEO:   "Matura z informatyki - przydatne funkcje - Java"
title:      "Matura z informatyki - przydatne funkcje - Java"
subtitle:   "Zbiór funkcji, które używałem rozwiązując zadania maturalne."
date:       2017-04-25 00:13:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017 Matura-Informatyka Java
comments:   true
toc:        true
---

W tym poście zaprezentuję funkcje, z których korzystałem rozwiązując zadania maturalne z informatyki. Nie wiem jak w innych językach, ale w Javie jest całkiem sporo wbudowanych, które od razu robią za nas robotę. Jeśli znasz jakieś lepsze/szybsze sposoby na któreś rozwiązanie lub jeszcze inne przydatne funkcje, których nie wymieniłem, to daj znać!

## Wczytanie pliku

Od tego zawsze zaczynamy. Ja korzystam z funkcji, która pakuje wszystkie dane z pliku tekstowego do tablicy o rożnych wymiarach, w zależności od zadania. Przykładowo dla tego typu danych:

{% highlight text %}
AIHAHGHBEAFJAJDI HGIHFEHHJGBCBGD
FBJHCFFGADD EHADJAJBJBEGD
JHGHADJ AGFEHHEHIAEJFC
...
{% endhighlight %}

wygląda tak:

{% highlight java %}
private static String[][] readFile(String file) throws IOException{
    String[][] array = new String[1000][2];
    Scanner data = new Scanner(new File("C:\\sciezka\\do\\pliku\\"+file));
    int i = 0;
    while (data.hasNextLine()){
        array[i][0] = data.next();
        array[i][1] = data.next();
        i++;
    }
    data.close();
    return array;
}
{% endhighlight %}

<p class="note">
Należy pamiętać o escape'owaniu ukośników (\\\\) w ścieżce do pliku.
</p>

## Konwersja liczb
Jak wiadomo to podstawa. Uzyskamy to szybko dzięki dwóm metodom, które przyjmują liczbę oraz system liczbowy jako argumenty:
<hX>Z różnych systemów na dziesiętny</hX>
{% highlight java %}
public static int convertToInt(String number, int base){
    return Integer.parseInt(number, base);
}
{% endhighlight %}
<hX>I z dziesiętnego na inny:</hX>
{% highlight java %}
public static String convertInt(int number, int base){
    return Integer.toString(number, base);
}
{% endhighlight %}

## Zaokroglanie liczb

Równie często jest to nam potrzebne. Gdy mamy podać tylko wydrukowany wynik to jest to całkiem proste. Z pomocą przychodzi printf, np:

{% highlight java %}
System.out.printf("%.2f%n", 265.335);
//265,34
{% endhighlight %}

<hX>Gdzie:</hX>
* %.2 - określa precyzję, czyli ilość miejsc po przecinku, w tym przypadku 2
* f - typ danych, w tym przypadku float
* %n - nowa linia

Jeśli jednak musimy operować na zaokrąglonych liczbach, potrzebne jest nam coś więcej.

Na Stack OverFlow często znajdowałem takie rozwiązanie:
{% highlight java %}
Math.round(x*100.0)/100.0
{% endhighlight %}
gdzie zera określają dokładność "przybliżenia". Jednak nie zawsze zwraca to prawidłową odpowiedź. Przykładowo, jeśli za "x" podstawimy 265.335, to dostaniemy 265.33, co jest oczywiście niepoprawnym wynikiem, bo powinniśmy dostać 265.34.

Ja rozwiązałem to w ten sposób:
{% highlight java %}
public static double round(double x, int n) {
    String rounded = String.format(Locale.ROOT,"%."+n+"f", x);
    return Double.parseDouble(rounded);
}
{% endhighlight %}
Wykorzystuje to podobną metodę co printf, tyle że później parsujemy to na double.

<p class="note">
Zauważ, że tutaj, jako argument podałem jeszcze Locale.ROOT. Wynika to z tego, że w różnych regionach inaczej jest formatowany tekst i tak dla Polski w metodzie printf/format separatorem liczby typu double jest ",", co całkowicie nam psuje obliczenia, bo typ double korzysta z ".". Zmiana Locale na ROOT rozwiązuje ten problem.
</p>

## Max/min wartość
W zadaniach zazwyczaj proszą o maksymalną lub minimalną wartość z jakiegoś zbioru. Gdy dane przetrzymujemy w tablicy mamy do tego gotowe funkcje:

{% highlight java %}
public static int max(int[] array) {
    return Arrays.stream(array).max().getAsInt();
}
    
public static int min(int[] array) {
    return Arrays.stream(array).min().getAsInt();
}
{% endhighlight %}

## Suma wartości

Również czasem sumowanie wszystkich wartości się zdarza i tu też mamy gotowca:

{% highlight java %}
public static int sum(int[] array) {
    return Arrays.stream(array).sum();
}
{% endhighlight %}

Wszystko dzięki streamom, które są z nami od Java 8. Jeśli operujemy na listach, też mamy gotowe metody do wyznaczania min/max:

{% highlight java %}
ArrayList<Integer> numbers = new ArrayList<>();
numbers.addAll(Arrays.asList(1,2,3,4));

Collections.max(numbers);
//4
Collections.min(numbers);
//1
{% endhighlight %}

Chociaż do sumowania już jest nieco mniej przyjaźnie i musimy użyć streamów:

{% highlight java %}
numbers.stream().mapToInt(i->i.intValue()).sum()
//10
{% endhighlight %}

## Odwracanie stringa

Często w zadaniach trzeba odwracać stringi (np. aby sprawdzić czy są tzw. "palindromami"). Można to zrobić błyskawicznie z pomocą StringBuildera.

{% highlight java %}
public static String reverse(String string) {
    return new StringBuilder(string).reverse().toString();
}
{% endhighlight %}

## Operowanie na literach w słowie
Tu znacznie ułatwia sprawę funkcja, która każdy znak pakuje nam do tablicy, dzięki czemu później łatwo możemy na nich operować:

{% highlight java %}
char[] letters = "Anagram".toCharArray();
//[A, n, a, g, r, a, m]
{% endhighlight %}

## Znajdowanie podciągów w stringach
Sprawdzanie czy dany ciąg znaków zawiera inny podciąg jest bajecznie proste:
{% highlight java %}
"fooandbar".contains("and");
//true
{% endhighlight %}

Zdarzyło się też porównywać prefiksy lub sufiksy między stringami, ale również do tego mamy gotowe metody, które sprawdzają czy ciąg zaczyna się lub kończy podanym stringiem:

{% highlight java %}
"fooandbar".startsWith("foo");
//true
"fooandbar".endsWith("bar");
//true
{% endhighlight %}

Czasem jednak musimy dobrać się do środka ciągów. W jednym zadaniu, z genotypu trzeba było wyciągać geny, które rozpoczynały się od "AA" a kończyły na "BB" i na nich przeprowadzać operację. Do tego typu zadań warto znać klasy Pattern i Matcher oraz umieć posługiwać się regexami. Do tego zadania użyłem metodę podobną do tej, jednak tę przerobiłem do ogólnego użytku, nie tylko pod zadanie:

{% highlight java %}
public static String[] getMatchesBetween(String string, String a, String b) {
    Pattern between = Pattern.compile(a+"(.*?)"+b);
    Matcher next = between.matcher(string);
    
    ArrayList<String> matches = new ArrayList<>();
    
    while(next.find()){
        matches.add(next.group());
    }
    
    return matches.toArray(new String[matches.size()]);
}
{% endhighlight %}

W skrócie, znajduję nam wszystkie podciągi miedzy argumentami a i b, oraz pakuje je do listy, którą na koniec konwertujemy na tablicę.

Gdybyśmy mieli tylko sprawdzać czy dany ciąg pasuje do innego podciągu, moglibyśmy się posłużyć tą metodą:

{% highlight java %}
"fooandbar".matches("foo(.*?)bar");
//true
{% endhighlight %}

<p class="note">
Kluczowy w tych metodach jest regex: <span class="s">(.\*?)</span> gdzie <span class="s">.</span> oznacza dowolny znak, a <span class="s">\*?</span> to "leniwy" kawntyfikator? (ang. Reluctant quantifier), który określa, że <span class="s">.</span> (dowolny znak) może się wystąpić zero lub więcej razy. Jeśli, np. nie uznawalibyśmy pustych ciągów między a i b to użylibyśmy kwantyfikatora <span class="s">+?</span>, który określa, że znak musi wystąpić co najmniej raz. Z kolei inny rodzaj kwantyfikatora - zachłanny (ang. greedy), w np. w postaci <span class="s">*</span> pobrałby najwięcej ile się da, czyli w naszym przypadku od znalezienia pierwszego 'AA'  po ostatnie 'BB'. Różnica miedzy kwantyfikatorami leniwymi a zachłannymi polega na tym, że ten pierwszy dopasuje najmniej jak się da, a drugi jak najwięcej. Po więcej info odsyłam do dokumentacji <a href="https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html">Pattern</a>
</p>

Zaprezentuje to na przykładzie. Dajmy na to, że mamy taką o to tablicę z danymi:

{% highlight java %}
String[] genotypes = new String[3];
        genotypes[0] = "EBEAADDEDCBCAEBABBDBEADBBDAABBDDACDDECECECBBDDBCBEDAEBDAADCE";
        genotypes[1] = "BCBAAEEDDBEDCBBCCABDAACEBBEBCCCCCABDDDBBAACCEDDCBBCEAAEEADBBDE";
        genotypes[2] = "AADDEEDBBCCEEBBDEEDDAAAACDCDDCDBBEAADDEDDBBDCDDCDCAA";
{% endhighlight %}
i wywołując tą metodę na każdym elemencie tej tablicy, dostaniemy nową tablicę z dopasowaniami, które tu w tym przykładzie od razu drukuję:
{% highlight java %}
for (String genotype : genotypes) {
    System.out.println(Arrays.toString(getMatchesBetween(genotype, "AA", "BB")));
}
{% endhighlight %}
i output dla poszczególnych kwantyfikatorów wygląda następująco:
{% highlight java %}
//dla (.*?)
[AADDEDCBCAEBABB, AABB]
[AAEEDDBEDCBB, AACEBB, AACCEDDCBB, AAEEADBB]
[AADDEEDBB, AAAACDCDDCDBB, AADDEDDBB]

//dla (.+?)
[AADDEDCBCAEBABB, AABBDDACDDECECECBB]
[AAEEDDBEDCBB, AACEBB, AACCEDDCBB, AAEEADBB]
[AADDEEDBB, AAAACDCDDCDBB, AADDEDDBB]

//dla (.*)
[AADDEDCBCAEBABBDBEADBBDAABBDDACDDECECECBB]
[AAEEDDBEDCBBCCABDAACEBBEBCCCCCABDDDBBAACCEDDCBBCEAAEEADBB]
[AADDEEDBBCCEEBBDEEDDAAAACDCDDCDBBEAADDEDDBB]
{% endhighlight %}

## Ilości liter - statystyka
Trafiały się też zadania gdzie trzeba było znaleźć ilości liter w słowie i wykonać na tym różne operacje (np. sprawdzanie czy słowa są anagramami). Napisałem do tego taką funkcję, która zwraca tablicę z liczbą poszczególnych liter:

{% highlight java %}
public static int[] countLetters(String word) {
    int[] letters = new int[26];//26 liter w alfabecie
    for ( int i = 0; i < word.length(); i++ ) {
        letters[word.charAt(i)-'A']++;
    }
    return letters;
}
{% endhighlight %}

Kluczowym czynnikiem jest tu operacja {% code java %}word.charAt(i)-'A'{% endcode %}, dzięki której obliczane jest miejsce w tablicy, które powinno zostać policzone w aktualnej iteracji.

<p class="idea">
Jeśli nie wiesz co tu się dzieje, to znak jest przechowywany jako liczba (np. alfabet wielkich liter przyjmuje wartości od 60 - dla A, do 90 - dla Z), a my metodą charAt wyciągamy aktualny znak, dajmy na to 'B'(61) i odejmujemy od tego 'A'(60), zatem dostajemy pozycję 1 (61-60).
</p>

Nasza tablica dla pewnego słowa po wydrukowaniu wyglądałaby tak:

{% highlight java %}
// A  B  C  D  E  F  G  H  I  J  K  L  M  N  O  P  Q  R  S  T  U  V  W  X  Y  Z
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0]
{% endhighlight %}

<p class="idea">
Warto wiedzieć też, że można inkrementować znaki!
</p>

Przykładowo:
{% highlight java %}
char a = 'A';
a++;
System.out.println(a);
//B
{% endhighlight %}

Mając już taką wiedzę, możemy dostarczyć pełne statystyki jakiegoś tekstu. W jednym z zadań to własnie trzeba było zrobić. Najpierw wpakowałem wszystkie słowa do tablicy i następnie stworzyłem funkcję, która na podstawie podananej tablicy ze słowami, drukuje nam statystyki danego tekstu:

{% highlight java %}
private static void letterStats(String[] text) {
    int[] lettersCount = new int[26];
    
    for (String word : text) {
        
        for(int i = 0; i<word.length(); i++){
            lettersCount[word.charAt(i)-'A']++;
            
        }
    }
    
    double numberOfallLetters = Arrays.stream(lettersCount).sum();
    char a = 'A';
    
    for (int count : lettersCount) {
        double percentage = count*100.0/numberOfallLetters;
        System.out.println(a++ + ": " + count + " (" + String.format(Locale.ROOT, "%.2f", percentage) + "%)");
    }
}
{% endhighlight %}

A wyglądało to tak:

{% highlight text %}
A: 632 (7.55%)
B: 196 (2.34%)
C: 162 (1.94%)
D: 422 (5.04%)
E: 1093 (13.06%)
F: 213 (2.55%)
G: 151 (1.80%)
H: 566 (6.76%)
I: 522 (6.24%)
J: 2 (0.02%)
K: 64 (0.76%)
L: 402 (4.80%)
M: 193 (2.31%)
N: 557 (6.66%)
O: 641 (7.66%)
P: 93 (1.11%)
Q: 6 (0.07%)
R: 524 (6.26%)
S: 485 (5.80%)
T: 792 (9.46%)
U: 185 (2.21%)
V: 84 (1.00%)
W: 196 (2.34%)
X: 3 (0.04%)
Y: 185 (2.21%)
Z: 0 (0.00%)
{% endhighlight %}

I do tej pory to by było na tyle. Jeśli uzbieram większy zbiór przydatnych funkcji lub algorytmów, to przeleję to na kolejny wpis.
