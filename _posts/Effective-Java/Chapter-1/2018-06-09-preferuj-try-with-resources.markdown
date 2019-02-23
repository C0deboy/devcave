---
layout:     post
titleSEO:   "Preferuj try-with-resources - najlepszy sposób na zamknięcie zasobów"
title:      "Preferuj try-with-resources"
subtitle:   "Najlepszy sposób na zamknięcie zasobów"
date:       2018-06-09 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:       Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        false
chapter:    2
item:       9
---

{% include /effective-java/series-info.html %}

W Javie wiele klas wymaga zamknięcia używanych przez nie zasobów wywołując metodę `close()`. Są to np. `FileInputStream`, `FileOutputStream`, `ThreadPoolExectuor` czy `java.sql.Connection`. Zamknięcie zasobów jest często niedopilnowane, co może wpływać na wydajność aplikacji. Wiele z tych klas używa finalizerów jako "siatki bezpieczeństwa", jednak jak wiemy z poprzedniego postu - nie działa to zbyt dobrze.

Kiedyś (przed Java 7), najlepszym sposobem na poprawne zamknięcie zasobów było *try-finally*:


```java
// try-finally - No longer the best way to close resources!
static String firstLineOfFile(String path) throws IOException {
    BufferedReader br = new BufferedReader(new FileReader(path));
    try {
        return br.readLine();
    } finally {
        br.close();
    }
}
```

Blok *finally* jest odpalany nawet wtedy, kiedy w bloku *try* wystąpi wyjątek czy operacja *return*, dlatego był dobrym miejscem na zamknięcie zasobów.

Nie wygląda to źle, ale z każdym kolejnym zasobem jest coraz gorzej:

```java
// try-finally is ugly when used with more than one resource!
static void copy(String src, String dst) throws IOException {
    InputStream in = new FileInputStream(src);
    try {
        OutputStream out = new FileOutputStream(dst);
        try {
            byte[] buf = new byte[BUFFER_SIZE];
            int n;
            while ((n = in.read(buf)) >= 0)
                out.write(buf, 0, n);
        } finally {
            out.close();
        }
    } finally {
        in.close();
    }
}
```

Czytelność spada drastycznie.

Z *try-finally* jest też inny problem. Zarówno w bloku *try* jak i *finally* może wystąpić wyjątek. Np. jeśli w metodzie `firstLineOfFile`, przy wywołaniu metody `readLine` wystąpi wyjątek w związku z błędem na fizycznym urządzeniu, to również wywołanie metody `close` rzuci wyjątkiem z tego samego powodu. W takiej sytuacji drugi wyjątek przesłoni pierwszy i nie będziemy o tym wiedzieć. Nie zobaczymy go w *stack trace*, co może utrudnić debugowanie, bo zazwyczaj to pierwszy rzucony wyjątek chcemy ujrzeć. Jest możliwe, aby stłumić drugi wyjątek na rzecz pierwszego, ale w praktyce nikt tego nie robi, bo jest to rozwlekłe rozwiązanie.

Wszystkie te problemy zostały rozwiązane wraz z przyjściem w Javie 7 *try-with-resources*.

Aby nasz zasób mógł być używany z *try-with-resources* musi implementować interfejs `AutoCloseable`, czyli metodę `close()`. Teraz wiele klas i interfejsów z bibliotek Javy implementuje ten interfejs. Jest to poniekąd standard. Więc jeśli piszesz klasę, która reprezentuje zasób, który musi być zamknięty, to powinna implementować `AutoCloseable`.

Drugi przykład (który wraz z kolejnym zasobem robił się coraz brzydszy), z *try-with-resources* wygląda tak:

```java
// try-with-resources on multiple resources - short and sweet
static void copy(String src, String dst) throws IOException {
    try (InputStream   in = new FileInputStream(src);
         OutputStream out = new FileOutputStream(dst)) {
        byte[] buf = new byte[BUFFER_SIZE];
        int n;
        while ((n = in.read(buf)) >= 0)
            out.write(buf, 0, n);
    }
}
```

Jak widać, jest to dużo bardziej zwięzłe i czytelne rozwiązanie. Co więcej, jeśli wystąpią wyjątki tak jak wcześniej opisałem, to te następujące po pierwszym stają się *suppressed*, pozostawiając na wierzchu ten, który chcemy zobaczyć - czyli pierwszy jaki wystąpił.

Wyjątki *suppressed* nie są pomijane - mamy informację o nich w *stack trace* i możemy się do nich dostać z kodu wywołując metodę `getSuppresed()`, dostępną od Javy 7 na każdym `Throwable`.

Oczywiście do *try-with-resources* możemy dodać blok *catch* tak jak w normalnym *try*, co pozwala obsłużyć wszystkie wyjątki bez kolejnych zagnieżdżeń.

*Catch* może też służyć do innych celów. Np. w przypadku wystąpienia wyjątku w *try* - zwrócenie domyślnej wartości. Dla przykładu:

```java
static String firstLineOfFile(String path, String defaultVal) {
    try (BufferedReader br = new BufferedReader(
           new FileReader(path))) {
        return br.readLine();
    } catch (IOException e) {
        return defaultVal;
    }
}
```

Zatem używajmy tylko *try-with-resources*, aby kod był bardziej zwięzły, czytelniejszy, a rzucane wyjątki bardziej użyteczne. Jeśli tylko napotkasz w systemie kilka zagnieżdżeń *try-finally*, zamień je na *try-with-resources*, aby żyło nam się lepiej ;)
