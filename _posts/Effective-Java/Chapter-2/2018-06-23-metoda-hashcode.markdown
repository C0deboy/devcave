---
layout:     post
titleSEO:	"Metoda hashCode - dlaczego zawsze nadpisywać razem z equals?"
title:      "Metoda hashCode"
subtitle:   "Do czego służy i dlaczego zawsze nadpisywać razem z equals?"
date:       2018-06-23 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    3
item:       11
---

{% include /effective-java/series-info.html %}

# Co to jest hashCode

`hashCode` to metoda, która powinna zawierać algorytm hashujący, który na podstawie danych obiektu wylicza liczbę całkowitą (hash), reprezentujący ten obiekt.

*Hash* jest wykorzystywany pod spodem przez niektóre kolekcje (np. `HashMap` i `HashSet`) do przechowywania referencji do obiektów, co w rezultacie daję bardzo wydajną kolekcję o stałym czasie dostępu do danych. Ten czas w dużej mierze zależy od wydajności naszego algorytmu hashującego. więc warto na to zwracać uwagę.

W poprzednim [poście]() podkreśliłem, że **niezbędne jest nadpisywanie metody `hashCode` za każdym razem, gdy nadpisujesz `equals`.** 

Jest to spowodowane tym, że miedzy nimi zawarty jest nienaruszalny kontrakt. Jeśli zostanie naruszony, to obiekty nie będą działać prawidłowo  w kolekcjach takich jak `HashMap` i `HashSet` czy  w każdej innej klasie, które polega na *hash* kodach obiektów. 

Kontrakt dla samej metody `hashCode` jest następujący:

- Jeśli informacje używane w `equals` nie są modyfikowane to metoda `hashCode` musi zawsze konsekwentnie zwracać tą samą wartość.
- Jeśli metoda `equals(Object)` stwierdzi, że dwa obiekty są równe to wywoływainie`hashCode`na obu tych obiektach musi zwrócić tą samą wartość.
- Jeśli dwa obiekty nie są równe według metody`equals(Object)`to **nie** jest wymagane, aby `hashCode`na każdym z obiektów zwracał różne wyniki. Jednak jest to pożądane, bo ma to znaczenie wydajnościowe dla hash tablic (jeśli będą dwa takie same hashe to będzie musiała wywołać metody `equals`, aby rozróżnić obiekty.

**Szczególnie ważny jest 2 punkt.** - jeśli nie nadpiszemy również metody `hashCode` wraz z `equals` to według metody `equals` dwa obiekty są sobie równe, a dla metody `hashCode` te same obiekty nie mają nic ze sobą wspólnego. Zwracane są dwa różne numery, zamiast dwóch identycznych.

Teraz dla przykładu załóżmy, że będziemy chcieli użyć instancje `PhoneNumber`  z poprzedniego postu  jako klucze w `HashMap` bez definiowania `hashCode`:

```java
Map<PhoneNumber, String> map = new HashMap<>();
map.put(new PhoneNumber(707, 867, 5309), "Jenny");
```

Wydawałoby się, że wywołując:

```java
map.get(new PhoneNumber(707, 867, 5309))
```
Dostaniemy `"Jenny"`, ale tak się nie stanie, bo dostaniemy `null`. Zauważ, że są używane dwie instancje `PhoneNumber`. Są one identyczne, ale z punktu widzenia `hashCode`, na której bazuje `HashMap` nie są.

Napisanie poprawnej implementacji `hashCode`dla`PhoneNumber` rozwiązuje problem.

# Jak poprawnie napisać metodę hashCode?

Dobra metoda hashCode powinna dawać różne hash kody, dla różnych obiektów. Osiągniecie tego może być trudne, ale jest prosty przepis na przybliżony efekt:

1. Zadeklaruj zmienną `int result` i zainicjuj ją hash kodem `c` dla pierwszego znaczącego pola.
2. Dla **każdego** pozostałego znaczącego pola `f`, **które jest używane w metodzie *equals*** :
	1. Przelicz hash code`c`:
		- Jeśli jest to prymityw używaj {% code java %}Type.hashCode(f){% endcode %}, gdzie`Type` to odpowiednia klasa opakowująca. Np. dla int - {% code java %}Integer.hashCode(f){% endcode %}.
		- Jeśli pole jest obiektem i w metodzie `equals` jest wywoływane `equals` tego obiektu, to analogicznie powinniśmy wywołaś `hashCode` tego obiektu.
		- Jeśli pole jest `null` to użyj`0` .
		- Jeśli pole jest tablicą, to przelicz hash code dla każdego znaczącego elementu. Jeśli tablica nie ma znaczących pól, użyj stałej (ale nie`0`). Jeśli wszystkie elementy są znaczące użyj {% code java %}Arrays.hashCode{% endcode %}.
	2. Połącz hash code`c`policzony w kroku 2.1 z `result` w następujący sposób {% code java %}result = 31 * result + c;{% endcode %}.
3. Zwróć `result`.
4. Upewnij się, że obiekty równe sobie mają takie sam *hash code*.

Mnożenie z kroku 2.2 zapewnia, że kolejność pól ma znaczenie. Jeśli pominęlibyśmy to, to np. w klasie `String` wszystkie anagramy miałyby identyczny *hash code*.

{: .note }
Dlaczego 31? Bo jest to nieparzysta liczba pierwsza. Gdyby była to liczba parzysta i mnożenie skutkowałoby przepełnieniem, to informacje zostałby utracone, bo mnożenie przez 2 jest tym samym co przesuniecie bitowe w lewo. (np. {% code java %}4 * 2 == 4 << 1{% endcode %}). Używanie liczby pierwszej jest mniej uzasadnione, ale to już tradycja. Fajną właściwością liczby 31 jest to, że mnożenie może być zastąpione przez przesunięcie bitowe w lewo i odejmowanie {% code java %}31 * i == (i << 5) - i{% endcode %}, co ma wpływ na wydajność. Tego typu optymalizacje są robione automatycznie przez nowoczesne wirtualne maszyny.

Aplikując powyższe wskazówki metoda `hashCode` klasy `PhoneNumber` będzie wyglądać tak:
```java
// Typical hashCode method
@Override public int hashCode() {
	int result = Short.hashCode(areaCode);
	result = 31 * result + Short.hashCode(prefix);
	result = 31 * result + Short.hashCode(lineNum);
	return result;
}
```
W tej prostej implementacji jasno widać, że identyczne klasy `PhoneNumber` będą miały identyczny `hashCode`.

Ten przepis na `hashCode` daje nam całkiem dobre funkcje hashujące, odpowiednie dla większości użyć, jednak nie są one perfekcyjne. Jeśli będziesz mieć naprawdę dobry powód, żeby twoje hash code-y miały jeszcze mniejsze prawdopodobieństwo na kolizję, zobacz rozwiązanie od [Guava](https://memberservices.informit.com/my_account/webedition/9780134998060/html/epub/oebps/html/ref.xhtml#rGuava) -`com.google.common.hash.Hashing`.

Od Javy 7, mamy klasę `Objects`, która posiada statyczną metodę `hash`. Przyjmuje ona dowolną liczbę argumentów i zwraca dla nich *hash code*. Pozwala to napisać implementację metody hashującej w jednej linijce:

```java
// One-line hashCode method - mediocre performance
@Override public int hashCode() {
	return Objects.hash(lineNum, prefix, areaCode);
}
```

 Jej jakość jest podobna do tych napisane według naszego przepisu, jednak jest nieco mniej wydajna, gdyż używa pod spodem tablicy jak również *boxing* i *unboxing*, jeśli argumentami są prymitywy. Takiego rozwiązania możemy śmiało używać, gdy wydajność nie ma dla nas aż takiego znaczenia.

{: .note}
Jeśli klasa jest *immutable*, można rozważyć cachowanie hash kodu w zmiennej, zamiast przeliczać go za każdym razem od nowa.

Podobnie jak pisałem we wcześniejszym poście, jeśli nie potrzebujesz specyficznej implementacji możesz zdać się na automatyczne wygenerowanie tej metody przez IDE czy odpowiednią bibliotekę jak np. Lombok.