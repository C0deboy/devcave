---
layout:     post
titleSEO:   "Jak wykluczyć ruch z localhost w Google Analitics?"
title:      "Wykluczamy ruch z localhost w Google Analitics"
subtitle:   "Rozbudowujemy blog na Jekyllu 4#"
date:       2017-04-02 12:00:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017 Jekyll
comments:   true
toc:        true
---
Statystyki Google Analitics są zbierane z każdego miejsca gdzie załączymy skrypt, więc i nawet wtedy, gdy testujemy naszą stronę na localhost. Zbieranie własnych wejść na stronę (i to jeszcze podczas testowania, gdzie co chwilę odświeżamy stronę) nie za bardzo ma sens, więc w tym poście pozbędziemy się tego.

## Filtry GA nie sprawdziły się

Standardowa metoda filtrowania ruchu wewnętrznego w Google Analitcs:

1. Przejdź do konta strony i wybierz administracja.
2. Następnie opcja 'Wszystkie filtry' i 'dodaj filtr'.
3. Jako 'Typ filtra' wybierz 'Predefiniowany'.
4. Kliknij menu 'Wybierz typ filtra' i wybierz 'Wyklucz'.
5. Kliknij menu 'Wybierz źródło lub miejsce docelowe' i wybierz 'ruch z adresów IP'.
6. Kliknij menu 'Wybierz wyrażenie' i wybierz 'rozpoczyna się od'.
7. I Wpisujemy adresy IP, które chcemy wykluczyć.

<u>nie sprawdzała się</u> w moim przypadku dla localhost, więc pokaże jak wykluczyć zbieranie danych z localhost w nieco inny sposób.

<span class="note">Nasze zmiany mają wpływ tylko na przyszłość, co oznacza ze wcześniej zebrane dane z localhost nie zostaną wykluczone i żadną metodą nie jesteśmy w stanie tego zrobić.</span>

## Uniwersalna metoda

Sprawimy, aby nasz skrypt GA wykonywał się tylko na oficjalnej domenie (w moim przypadku: blog.jaki-jezyk-programowania.pl). Aby to zrobić wystarczy go opakować w następującego ifa:

{% highlight html %}
<script>
  if (document.location.hostname == "blog.jaki-jezyk-programowania.pl"){
    //kod Google Analitics
  }
</script>
{% endhighlight %}

I gotowe. Skrypt GA wykona się tylko na naszej domenie (a więc nie wykona się ani na localhost, ani na 127.0.0.1 ani na żadnej innej domenie różnej od podanej).

## Jekyll

W Jekyllu również zadziała powyższa metoda, ale można to też zrobić w inny sposób. Przyda nam się to też do innych rzeczy (np. można pozbyć się komentarzy Disqus podczas testów).

Jekyll posiada zmienną środowiskową {% code text %} jekyll.environment {% endcode %}, za pomocą której możemy decydować, co zostanie wygenerowane podczas testowania strony (wtedy ma wartość {% code text %}development{% endcode %} i jest to wartość domyślna), a co dla wersji gotowej do wrzucenia na serwer (wartość {% code text %}production{% endcode %}).

Tak więc jeśli nie chcemy, aby coś pojawiało się podczas testowania strony, opakowujemy to w tagi liquid z następującym ifem:

{% highlight liquid %}
{% raw %}
{% if jekyll.environment == "production" %}
   //tu zawartość, której nie chcemy podczas testowania
{% endif %}
{% endraw %}
{% endhighlight %}

Dzięki temu zawartość między tym ifem nie zostanie wygenerowana przez komendy:

{% highlight bash %}
bundle exec jekyll serve

bundle exec jekyll build
{% endhighlight %}

Aby wygenerować tą treść i pliki gotowe do wrzucenia na serwer, będziemy musieli podać zmienną "JEKYLL_ENV" ustawioną na "production" przed komendą, która generuje nam stronę:

{% highlight bash %}
JEKYLL_ENV=production bundle exec jekyll build
{% endhighlight %}

W przypadku z Google Analitics nasz plik <span class="file">google-analytics.html</span>, który "includujemy" będzie wyglądał tak:

{% highlight html %}
{% raw %}

{% if jekyll.environment == "production" %}
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-90973428-2', 'auto');
  ga('send', 'pageview');

</script>
{% endif %}

{% endraw %}
{% endhighlight %}
