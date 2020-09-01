---
layout:     post
titleSEO:   "Wyjątki - dobre praktyki"
title:      "Wyjątki - dobre praktyki"
subtitle:   "6 dobrych praktyk zebranych w jeden wpis"
date:       2020-09-01 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    10
item:       72, 73, 74, 75, 76, 77
---

{% include effective-java/series-info.html %}

Kolejne tematy dotyczą dobrych praktyk dla wyjątków i są dosyć rozwlekle opisane w książce, więc postanowiłem zebrać je i krótko opisać w jednym poście.

# Reużywaj istniejące wyjątki w Javie

Reużywanie kodu jest pożądaną rzeczą i wyjątki nie są tu wyjątkiem.

Ma to kilka swoich zalet:

- API jest łatwiejsze do nauczenia, ponieważ korzysta z wszystkim dobrze znanych konwencji

Z czym jak najbardziej się zgadzam, jednak dwie kolejne zalety wymienione przez autora są już trochę na siłę:

- API jest łatwiejsze w czytaniu, ponieważ nie jest zaśmiecone nieznanymi wyjątkami
- Mniej klas wyjątków równa się mniejszemu odcisku na pamięci i mniejszym czasem spędzonym na ładowaniu klas

Według mnie druga to to samo co pierwsza, a trzecia może miała większe znaczenie jakiś czas temu. Teraz ważniejsza jest czytelność kodu niż to, że zaoszczędzimy jedną klasę reużywając inną, która może nie do końca spełnia nasze wymagania.

Wyjątki, które można reużywać w Javie to:

`IllegalArgumentException` — rzucany, gdy został podany niepoprawny argument np. podanie ujemnej liczby, która miała reprezentować liczbę powtórzeń danej akcji.

`IllegalStateException` — rzucany, gdy stan obiektu nie jest odpowiedni, a została wywołana zależna metoda np. próba użycia obiektu, który nie został jeszcze zainicjalizowany.

`NullPointerException` — to samo co `IllegalArgumentException` tylko gdy podana jest wartość `null` i jest nieakceptowalna.

`IndexOutOfBoundsException` — to samo co `IllegalArgumentException` tylko dla konkretnego przypadku: index jest poza dozwolonym zakresem

`ConcurrentModificationException` — rzucany, gdy obiekt był zaprojektowany do użycia przez tylko jeden wątek (lub z zewnętrzną synchronizacją), a wykrył zmianę, która odbyła się współbieżnie. To w najlepszym wypadku jest tylko wskazówką, bo tak naprawdę nie jest możliwe wykrycie takich zmian w 100% wiarygodny sposób.

`UnsupportedOperationException` - rzucany, gdy obiekt umyślnie nie wspiera danej operacji np. zdefiniowanej w interfejsie. Przykładem może być tu implementacja `List`, do której możemy tylko dorzucać kolejne elementy. Wtedy metoda `delete()` rzuciła by ten wyjątek.

{: .note}
Nie reużywaj bezpośrednio `**Exception**`,  `**RuntimeException**`,  `**Throwable**` i `**Error**`. Traktuje te klasy jakby były abstrakcyjne.

Podsumowanie:

{: .post-table}

| **Wyjątek**                     | **Okazja do użycia**                                                            |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `IllegalArgumentException`        | Parametr nie będący `null` jest niepoprawny                                   |
| `IllegalStateException`           | Stan obiektu jest niepoprawny w chwili wywoływania metody                     |
| `NullPointerException`            | Parametr przekazany jest jako `null`, a jest to nie akceptowalne              |
| `IndexOutOfBoundsException`       | Index jest poza dozwolonym zakresem                                           |
| `ConcurrentModificationException` | Wykrycie niedozwolonej modyfikacji współbieżnej                               |
| `UnsupportedOperationException`   | Obiekt nie wspiera danej metody                                               |

Są jeszcze inne rzadziej używane wyjątki, które można by reużyć np. `ArithmeticException` i `NumberFormatException`, gdy projektujemy klasę zajmującą się arytmetyką.

Na ogół zasada jest taka, że jeśli jakikolwiek wyjątek spełnia nasze potrzeby, to możemy go śmiało reużyć, jednak ważne jest to, żeby dokumentacja wyjątku była zgodna z naszym użyciem, nie tylko nazwa.

# Rzucajmy wyjątki odpowiednie dla poziomu abstrakcji metody

Gdy metoda rzuca wyjątek, który nie ma oczywistego połączenia z zadaniem, które miała wykonać, w najlepszym wypadku spowoduje to lekkie zdezorientowanie programisty. Poza tym w takich wypadkach wysokopoziomowy kod jest zanieczyszczany detalami implementacyjnymi i jeśli zostaną one zmienione, mogą spowodować, że programy klienckie przestaną działać.

Aby pozbyć się takiego problemu, **warstwy wysokopoziomowe powinny łapać wyjątki z niższego poziomu i zamiast nich rzucać wyjątki, które są odpowiednie dla abstrakcji wysokopoziomowej**. Nazywa się to **_exception translation_**:

```java
// Exception Translation
try {  
    ... // Use lower-level abstraction to do our bidding  
} catch (LowerLevelException e) {  
    throw new HigherLevelException(...);  
}
```

Przykład z Javy, gdzie akurat **_exception translation_** jest wymuszone przez specyfikację metody `get` w interfejsie `List<E>`:

```java
/**  
* Returns the element at the specified position in this list.  
* @throws IndexOutOfBoundsException if the index is out of range  
* ({@code index < 0 || index >= size()}).  
*/  
public E get(int index) {  
    ListIterator<E> i = listIterator(index);  
    try {  
        return i.next();  
    } catch (NoSuchElementException e) {  
        throw new IndexOutOfBoundsException("Index: " + index);  
    }  
}
```
Czasem warto też przekazać niskopoziomowy wyjątek do tego wysokopoziomowego. Może ułatwić to debugowanie problemów, ponieważ dzięki metodzie `getCause` mamy dostęp do pierwotnego powodu wystąpienia problemu (wyjątku) oraz cały jego stack trace jest dołączany do naszego wysokopoziomowego wyjątku. Nazywa się to **_exception chaining_**:

```java
// Exception Chaining
try {  
    ... // Use lower-level abstraction to do our bidding  
} catch (LowerLevelException cause) {  
    throw new HigherLevelException(cause);  
}
```

Wyjątki powinny mieć _chaining-aware constructor_, aby to umożliwić:

```java
// Exception with chaining-aware constructor
class HigherLevelException extends Exception {  
    HigherLevelException(Throwable cause) {  
        super(cause);  
    }  
}
```

A jeśli nie mają, to można skorzystać z metody `initCause` z `Throwable`.

**Oczywiście jak większość rzeczy w programowaniu nie powinniśmy tego nadużywać i w pierwszej kolejności dobrą praktyką jest unikanie propagowania wyjątków niskopoziomowych.** Najpierw zastanówmy się, czy mamy możliwość je obsłużyć, obejść lub upewnić się wcześniej, że metoda wykona się pomyślnie.

Kolejne tematy są nieco rozwlekle opisane w książce, a przedstawiają kilka prostych dobrych praktyk, więc skrócę je znacznie:

# Dokumentuj wszystkie wyjątki rzucane przez metodę

Dokumentowanie wyjątków jest niezwykle pomocne, dlatego powinniśmy dokumentować każdy rzucany wyjątek osobno i jasno opisywać, pod jakimi warunkami wystąpi. Dotyczy się to zarówno wyjątków _checked_ oraz _unchecked_. Szczególnie pomocne jest dokumentowanie wyjątków _unchecked_, bo bez tego nawet nie mamy pojęcia, że w ogóle występują — możemy dowiedzieć się jedynie w _runtime_.

Aby łatwo rozróżnić w dokumentacji _checked exception_ oraz _unchecked exception_, powinno używać się `@throws` tylko do tych _checked_.


# Uwzględniaj parametry, które wywołały błąd generując message

Dokładne opisanie błędu znacznie ułatwia zrozumienie powodu jego wystąpienia, dlatego powinniśmy załączyć jak najwięcej informacji generując `message` dla danego wyjątku.

Dobrym pomysłem jest wymuszenie podania kluczowych parametrów już w samym konstruktorze wyjątku:

```java
/**  
* Constructs an IndexOutOfBoundsException.  
*  
* @param lowerBound the lowest legal index value  
* @param upperBound the highest legal index value plus one  
* @param index the actual index value  
*/  
public IndexOutOfBoundsException(int lowerBound, int upperBound,  int index) {  
    // Generate a detail message that captures the failure
    super(String.format("Lower bound: %d, Upper bound: %d, Index: %d",  
        lowerBound, upperBound, index));  
      
    // Save failure information for programmatic access  
    this.lowerBound = lowerBound;  
    this.upperBound = upperBound;  
    this.index = index;  
}
```

# Po błędzie obiekt powinien mieć pierwotny stan

Stan obiektu po błędnym wywołaniu metody powinien być taki jak przed wywołaniem, aby była możliwość jego dalszego bezbłędnego używania.

Jeśli metoda ma taką właściwość, to można powiedzieć, że jest _failure-atomic_.

Jest kilka sposobów, żeby to osiągnąć:

- Projektowanie niemutowalnych obiektów — wtedy _failure atomicity_ mamy za darmo
- Sprawdzanie parametrów przed wykonywaniem modyfikacji stanu
- Ułożenie operacji w takich sposób, że te, co mogą się nie powieść, są na początku, a te modyfikujące są na końcu
- Pracowanie na kopii obiektu i podmiana, jeśli wszystko jest ok
- Napisanie kodu przywracającego poprzedni stan — czyli jeśli mamy błąd to robimy _rollback_ (wycofanie zmian)

# Nie ignoruj wyjątków

W kołko wszędzie powtarzana zasada — nie ignorujmy wyjątków:

```java
// Empty catch block ignores exception - Highly suspect! 
try {  
...  
} catch (SomeException e) {  
}
```

Powoduje to, że błąd idzie w eter i nigdy się o nim nie dowiemy, co jest źródłem wielu problemów.

Absolutnym minimum jest przynajmniej wylogowanie tego błędu, to nie wymaga dużej pracy, a przynajmniej będziemy mieć jakiekolwiek pojęcie o tym, że coś się wydarzyło.

Są jednak sytuacje, że ignorowanie wyjątku jest odpowiednie. W takich sytuacjach powinniśmy to jasno pokazać:

- wyjątek powinniśmy nazwać `ignored`
- dodać komentarz/log, który nam powie, dlaczego zignorowaliśmy wyjątek i że to jest ok

Przykład:

```java
Future<Integer> f = exec.submit(planarMap::chromaticNumber);  
int numColors = 4; // Default; guaranteed sufficient for any map  
try {  
    numColors = f.get(1L, TimeUnit.SECONDS);  
} catch (TimeoutException | ExecutionException  ignored) {  
    // Use default: minimal coloring is desirable, not required  
}
```