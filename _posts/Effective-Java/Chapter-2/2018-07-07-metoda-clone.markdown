---
layout:     post
titleSEO:	"Klonowanie w Javie - interfejs Cloneable nie jest zawsze dobrym rozwiązaniem."
title:      "Klonowanie w Javie"
subtitle:   "Interfejs Cloneable nie jest zawsze najlepszym rozwiązaniem"
date:       2018-07-07 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	    Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    3
item:       13
---

{% include effective-java/series-info.html %}

# Interfejs Cloneable

W Javie do klonowania został stworzony interfejs `Cloneable`, którym oznacza się klasę, dla której ma być dozwolone klonowanie. Jednak nie jest to idealne rozwiązanie. Interfejs ten nie zawiera żadnych metod, a metoda `clone` w klasie `Object` jest `protected`, więc nie możemy wywołać metody `clone`, tylko dlatego, że klasa implementuje `Cloneable`.

Interfejs ten zmienia tylko zachowanie metody `clone` w `Object` - jeśli klasa implementuje `Cloneable` to zwracana jest kopia pole po polu obiektu, a w przeciwnym wypadku rzucany jest wyjątek `CloneNotSupportedException`. Jest to trochę nietypowe wykorzystanie interfejsu — zamiast mówić klientowi co klasa może zrobić, zmienia zachowanie metody nadklasy i do niczego więcej się nie przyda.

Z interfejsu to nie wynika, ale klasa implementująca interfejs `Cloneable` powinna dostarczyć poprawnie funkcjonująca metodę `clone`.

Kontrakt dla metody `clone` w specyfikacji jest następujący:

> Creates and returns a copy of this object. The precise meaning of
> “copy” may depend on the class of the object. The general intent is
> that, for any object `x`, the expression
>
> {% code java %}x.clone() != x{% endcode %}
>
> will be `true`, and the expression
>
> {% code java %}x.clone().getClass() == x.getClass(){% endcode %}
>
> will be `true`, but these are not absolute requirements. While it is
> typically the case that
>
> {% code java %}x.clone().equals(x){% endcode %}
>
> will be `true`, this is not an absolute requirement.
>
>
> By convention, the object returned by this method should be obtained
> by calling `super.clone`. If a class and all of its superclasses
> (except `Object`) obey this convention, it will be the case that
>
> {% code java %}x.clone().getClass() == x.getClass(){% endcode %}
>
> By convention, the returned object should be independent of the object
> being cloned. To achieve this independence, it may be necessary to
> modify one or more fields of the object returned by `super.clone`
> before returning it.
>
> This mechanism is vaguely similar to constructor chaining, except that
> it isn’t enforced: if a class’s `clone` method returns an instance
> that is _not_ obtained by calling `super.clone` but by calling a
> constructor, the compiler won’t complain, but if a subclass of that
> class calls `super.clone`, the resulting object will have the wrong
> class, preventing the subclass from `clone` method from working
> properly. If a class that overrides `clone` is final, this
> convention may be safely ignored, as there are no subclasses to worry
> about. But if a final class has a `clone` method that does not
> invoke `super.clone`, there is no reason for the class to implement
> `Cloneable`, as it doesn’t rely on the behavior of `Object`’s clone
> implementation.

Czyli z grubsza — nie mamy zdefiniowanej definicji kopii ani co możemy z nią robić — wszystko zależy od nas.

W rezultacie mamy dosyć niestabilny i niebezpieczny mechanizm, który pod spodem tworzy obiekty bez wywoływania konstruktora.

# Implementacja

Najpierw musimy wywołać `super.clone`. Dostaniemy w pełni funkcjonalną kopię obiektu. Wszystkie wartości będą identyczne jak w oryginale i co ważne — będą to referencje do tych samych obiektów. Jeśli obiekt zawiera tylko prymitywy i referencje do niezmiennych obiektów, to w zasadzie dostaniemy to, co chcemy i nie musimy robić nic więcej niż:


```java
// Clone method for class with no references to mutable state
@Override
public ClassWithNoMutableReferences clone() {
    try {
        return (ClassWithNoMutableReferences) super.clone();
    } catch (CloneNotSupportedException e) {
        throw new AssertionError(); // Can't happen
    }
}
```
Z kolei, jeśli obiekt sam w sobie jest niezmienny, to po co nam by było klonowanie? Klasy niezmienne z pewnością nie powinny udostępniać metody `clone`, bo jedynie co by to robiło, to zachęcało do zbędnego klonowania.

{: .note}
Wywołanie metody `super.clone` jest opakowane w blok `try-catch`, ponieważ `Object` deklaruje, że jego metoda `clone` rzuca wyjątek `CloneNotSupportedException`, który jest wyjątkiem typu *checked*. Jeśli nasz obiekt implementuje interfejs `Cloneable` to wiemy, że wyjątek ten nigdy nie zostanie rzucony. Ten zbędny *boilerpalte* wskazuje na to, że `CloneNotSupportedException` powinno być wyjątkiem typu *unchecked*, no ale tak się nie stało.

Jeśli jednak nasz obiekt ma referencje do zmiennych obiektów, to taka prosta implementacja metody `clone` jest zgubna. Weźmy na przykład implementację klasy `Stack` ze wcześniejszych wpisów:


```java
public class Stack {
    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Stack() {
        this.elements = new Object[DEFAULT_INITIAL_CAPACITY];
    }

    public void push(Object e) {
        ensureCapacity();
        elements[size++] = e;
    }

    public Object pop() {
        if (size == 0)
            throw new EmptyStackException();
        Object result = elements[--size];
        elements[size] = null; // Eliminate obsolete reference
        return result;
    }

    // Ensure space for at least one more element.
    private void ensureCapacity() {
        if (elements.length == size)
            elements = Arrays.copyOf(elements, 2 * size + 1);
    }
}
```

Jeśli będziemy chcieli dać możliwość klonowania takiej klasie i w metodzie `clone` wywołamy tylko `super.clone()`, to sklonowana instancja `Stack` będzie miała odpowiednie pole `size` (bo jest to prymityw), ale tablica `elements` będzie referencją do tej samej tablicy co w oryginale. **W rezultacie modyfikując kopię, będziemy modyfikować też oryginał.**

W takiej sytuacji, aby dostać odizolowaną kopię od oryginału, musimy ręcznie wywołać metodę `clone` na tablicy:

```java
// Clone method for class with references to mutable state
@Override
public Stack clone() {
    try {
        Stack result = (Stack) super.clone();
        result.elements = elements.clone();
        return result;
    } catch (CloneNotSupportedException e) {
        throw new AssertionError();
    }
}
```
I tak z każdym polem tego typu.

Problemem w tym rozwiązaniu jest to, że wtedy pole (w tym przypadku `elements`) nie może być zadeklarowane jako `final`.

Kolejny problem pojawia się wtedy, kiedy elementy w tablicy są zmienne. Jeśli zmienimy stan jednego z obiektu będącego w tablicy, to zawartość obu tablic zostanie zmodyfikowana. To dlatego, że obie zawierają referencje do tych samych obiektów, a metoda `clone` wykonuje płytkie kopiowanie (shallow copy).

Żeby uzyskać w pełni odizolowane od siebie obiekty wraz ze wszystkimi obiektami wewnątrz, musimy wykonać głębokie kopiowanie (deep copy) - utworzyć nową tablicę i skopiować do niej wszystkie elementy listy.

{: .warning}
Metoda `clone` w `Object` nie jest zsynchronizowana, więc w środowisku wielowątkowym będzie trzeba napisać jej zsynchronizowany odpowiednik.

Jednak czy ten mało zgrabny mechanizm klonowania jest niezbędny? Jeśli rozszerzasz klasę, która już implementuje `Cloneable` to tak, nie ma innego wyboru. W innym przypadku warto skorzystać z alternatywnych rozwiązań.

# Copy constructor
Jest to konstruktor, który przyjmuje jako argument klasę zawierającą ten konstruktor, np.:

```java
// Copy constructor
public Stack(Stack stack) { ... };
```

# Copy factory 

Jest to analogiczny odpowiednik konstruktora w postaci [static method factory]({% post_url Effective-Java/Chapter-1/2018-04-14-static-factory-method-zamiast-konstruktora %}):

```java
// Copy factory
public static Stack copy(Stack stack) { ... };
```

Następnie ręcznie tworzymy nowy obiekt, kopiując wszystkie pola:

``` java
public static Stack copy(Stack stack) {
    Stack copy = new Stack();
    copy.size = stack.size;
    copy.elements = stack.elements.clone();
    return copy;
}
```

Oba te rozwiązania mają wiele korzyści w stosunku do `Cloneable`/`clone`

- nie polegamy na nieznanym mechanizmie tworzenia obiektów, który nie używa konstruktora i mamy pełną kontrolę nad tym procesem.
- nie jesteśmy uzależnieni od żadnych słabo zdefiniowanych konwencji
- nie ma konfliktu z polami `final`
- nie rzucają zbędnych wyjątków
- nie wymagają castowania
- nie skażamy klasy i wszystkich podklas interfejsem, który jest tylko *markerem*

Ponadto w tych rozwiązaniach argument może być interfejsem implementowanym przez tę klasę. Na przykład implementacje kolekcji w Javie udostępniają konstruktor, który ma argument typu `Collection` lub `Map`. Są to tak zwane *conversion constructors* i *conversion factories*, które pozwalają klientowi wybrać typ kopii, zamiast wymuszać oryginalny typ. Na przykład mamy `HashSet s` i możemy łatwo skopiować go jako `TreeSet` używając `new TreeSet<>(s)`.

Podsumowując, te dwa rozwiązania są zdecydowanie lepsze od skażania klasy interfejsem `Cloneable`, więc powinny być preferowanym sposobem implementowania klonowania w Javie. Jedynym wyjątkiem od tej zasady są tablicę, gdzie powinniśmy używać metody `clone`, bo jest to najszybszy sposób klonowania tablic.