---
layout:     post
titleSEO:	"Interfejsy funkcyjne w bibliotece Javy"
title:      "Interfejsy funkcyjne w bibliotece Javy"
subtitle:   "Warto je znać chcąc pisać metody wykorzystujące lambdy"
date:       2019-01-12 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    7
item:       44
---

{% include effective-java/series-info.html %}

Java udostępnia 43 interfejsy funkcyjne, ale bez obaw - jest tylko 6 głównych typów, które mają wiele wariacji, głównie ze względu na prymitywy. Wystarczy więc znać tylko te 6, a resztę łatwo można wyprowadzić, jakojako że mają dosyć regularne nazwy.

Mamy więc:

- Operator-y - interfejsy reprezentujące funkcję, której typ wyniku i argumentu są takie same.
- Predicate-y - interfejsy reprezentujące funkcję, która przyjmuje argument i zwraca `boolean`.
- Function-y - interfejsy reprezentujące funkcję, której typ wyniku i argumentu się różni.
- Supplier-y - interfejsy reprezentujące funkcję, która nie przyjmuję argumentu i zwraca wartość (dostarcza, *supplies*)
- Consumer-y - interfejsy reprezentujące funkcję, która przyjmuje argument i nie zwraca nic (konsumuje, *consumes*)

Tabelka z przykładami:

{: .post-table}

| Interface           | Function Signature    | Example               |
|---------------------|-----------------------|-----------------------|
| `UnaryOperator<T>`  | `T apply(T t)`        | `String::toLowerCase` |
| `BinaryOperator<T>` | `T apply(T t1, T t2)` | `BigInteger::add`     |
| `Predicate<T>`      | `boolean test(T t)`   | `Collection::isEmpty` |
| `Function<T,R>`     | `R apply(T t)`        | `Arrays::asList`      |
| `Supplier<T>`       | `T get()`             | `Instant::now`        |
| `Consumer<T>`       | `void accept(T t)`    | `System.out::println` |

`UnaryOperator<T>` różni się od `BinaryOperator<T>` tym, że ten drugi przyjmuje dwa argumenty.

Każdy z tych interfejsów ma wariację do pracy z prymitywami: `int`, `long`, i `double`. Nazwy tych interfejsów biorą się z tego, że na początku dodawany jest typ prymitywny, który obsługują. Dla przykładu - `Predicate`, który przyjmuje `int`, to `IntPredicate`, a `BinaryOperator`, który przyjmuje dwie wartości `long` i zwraca również `long`, to `LongBinaryOperator`. Żaden z tych interfejsów nie jest parametryzowany, z wyjątkiem interfejsów z grupy `Function`, które parametryzują zwracany typ np. `LongFunction<int[]>` przyjmuje `long` i zwraca `int[]`. Wszystkie wariacje:

- `DoubleUnaryOperator`, `IntUnaryOperator`, `LongUnaryOperator`
- `DoubleBinaryOperator`, `IntBinaryOperator`, `LongBinaryOperator`
- `IntPredicate`, `DoublePredicate`, `LongPredicate`
- `IntFunction<T>`, `LongFunction<T>`, `DoubleFunction<T>`
- `DoubleSupplier`, `LongSupplier`, `IntSupplier`
- `DoubleConsumer`, `IntConsumer`, `LongConsumer`

Do tego jest 9 wariacji interfejsu `Function`, w wypadku, gdy zwracany typ to prymityw. Typ argumentu i wyniku powinien zawsze się różnić, bo interfejs funkcyjny, który pobiera i zwraca to samo, to `UnaryOperator`. Jeśli oba typy są prymitywami (typ argumentu i ten zwracany), to prefixujemy `Function` z `<ArgType>To<Result>` np. `LongToIntFunction`. W sumie mamy 6 takich wariacji:

- `DoubleToIntFunction`, `DoubleToLongFunction`, `IntToDoubleFunction`, `IntToLongFunction`, `LongToIntFunction`, `LongToDoubleFunction`

Jeśli typ argumentu jest prymitywem, a typ zwracany to referencja do obiektu, prefixujemy `Function` z `<ArgType>ToObj`, np. `DoubleToObjFunction`. Mamy w sumie 3 wariacje:

- `ToIntFunction`, `ToLongFunction`, `ToDoubleFunction`

Ponadto, są jeszcze 3 dwuargumentowe wersje 3 podstawowych interfejsów (dla których ma to sens): `BiPredicate<T,U>`, `BiFunction<T,U,R>`, i `BiConsumer<T,U>`.

Są również wariacje `BiFunction`, które zwracają 3 najważniejsze prymitywy: `ToIntBiFunction<T,U>`, `ToLongBiFunction<T,U>`, i `ToDoubleBiFunction<T,U>`.

Dodatkowo `Consumer` ma 3 dodatkowe wersje, które pobierają referencję do obiektu i prymityw: `ObjDoubleConsumer<T>`, `ObjIntConsumer<T>`, `ObjLongConsumer<T>`.

W sumie mamy 9 dwuargumentowych interfejsów funkcyjnych.

Ostatni z nich to `BooleanSupplier`, który jest wariacją `Supplier`-a, który zwraca `boolean` i jest to jedyny wariant, który korzysta bezpośrednio z `boolean`, ale `boolean` jako zwracany typ jest wspierany jeszcze w interfejsie `Predicate` i jego 4 wariacjach.

{: .note}
Nie powinniśmy używać podstawowych interfejsów funkcyjnych z opakowanymi prymitywami zamiast wariacji z prymitywami. Ich wydajność, jest dużo gorsza, a najbardziej to widać, gdy są używane masowo. Ogólnie powinniśmy unikać autoboxingu, gdzie się da.

Jeśli którykolwiek interfejs ze standardowej biblioteki pasuje do naszego zastosowania, to w większości przypadków powinniśmy go użyć. To sprawi, że nasze API będzie łatwiejsze do zrozumienia, a ponadto standardowe interfejsy dostarczają przydatne domyślne metody.

Czasem jednak może się zdarzyć, że nie znajdziemy interfejsu do naszego zastosowania, np. będziemy potrzebować `Predicate`, który przyjmuje 3 parametry, lub taki, który rzuca *checked exception*. Może też się zdarzyć, że lepiej będzie napisać swój interfejs funkcyjny, mimomimo że mamy już identyczny strukturalnie w standardowej bibliotece.

Jako przykład weźmy znany `Comparator<T>`, który strukturą jest identyczny z `ToIntBiFunction<T,T>`. Dlaczego zasługuje na osobny interfejs?

- Jego nazwa dostarcza świetną dokumentację
- `Comparator` ma mocne wymagania, co do tego, co stanowi jego prawidłową instancję (co składa się na jego kontrakt). Implementując ten interfejs, zobowiązujemy się, spełnić ten kontrakt.
- Zawiera wiele przydatnych metod domyślnych do przekształcania i łączenia komparatorów.

Więc warto rozważyć napisanie swojego interfejsu funkcyjnego gdy:

- Może zyskać na opisowej nazwie i dokumentacji

- Ma silny kontrakt z nim powiązany

- Może zyskać na customowych domyślnych metodach

Tworząc funkcjonalny interfejs, należy go oznaczyć adnotacją `@FunctionalInterface`, który mówi użytkownikom, że obsługuje lambdy, oraz co ważniejsze - skompiluje się tylko wtedy, gdy będzie miał dokładnie jedną metodę abstrakcyjną, co powstrzymuje kogokolwiek, przed dodaniem do interfejsu kolejnej abstrakcyjnej metody.