---
layout:     post
titleSEO:   "Jak dodać statystyki strony i komentarze na blogu?"
title:      "Statystyki i komentarze na blogu"
subtitle:   "Rozbudowujemy blog na Jekyllu 2#"
date:       2017-03-10 12:00:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017 Jekyll
comments:   true
toc:        true
---

Dzięki statystykom strony będziemy mogli śledzić wiele ciekawych rzeczy. Między innymi ruch na stronie, czyli ile razy została wyświetlona, jakie podstrony odwiedzane były najczęściej, ile czasu użytkownik znajdował się na poszczególnych stronach i jak znalazł naszą stronę. Jest to tylko niewielka część funkcji, jaką oferują tego typu narzędzia. W dostarczanych raportach można wręcz tonąć.

Komentarze są również przydatnym narzędziem do kontaktu z użytkownikami strony, a więc i to warto dodać do naszego bloga.

Zrobimy to w najszybszy i najłatwiejszy sposób. Posłużymy się gotowymi narzędziami:
* Google Analytics
* Disqus

Dodanie ich do naszego bloga na Jekyllu jest bardzo proste.

# Statystyki Google Analytics

Aby nasza strona mogła korzystać z Google Analytics, konieczne będzie posiadanie konta Google. Gdy takie posiadamy wystarczy [zalogować się](https://www.google.com/analytics/) do panelu administracyjnego i utworzyć profil dla naszej strony. Dostaniemy identyfikator śledzenia postaci UA-XXXXXXXX-X oraz kod Javascript, który odpowiada za zbieranie danych. Będziemy musieli dodać go do wszystkich stron w obrębie naszego bloga/strony.

W tym celu tworzymy plik np. <span class="file">google-analytics.html</span>  w folderze <span class="folder">_includes</span>, który znajduje się w katalogu naszego projektu i umieszczamy w nim kod, który otrzymaliśmy. Wygląda tak:

{% highlight html %}

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-XXXXXXXX-X', 'auto');
  ga('send', 'pageview');

</script>

{% endhighlight %}

Ostatnim krokiem pozostało załączyć plik, który utworzyliśmy (<span class="file">google-analytics.html</span>) do wszystkich podstron. W Jekyllu wystarczy dodać instrukcję:

{% highlight html %}

{% raw %}
{% include google-analytics.html %}
{% endraw %}

{% endhighlight %}

na końcu pliku <span class="file">default.html</span> (zaraz przed zamknięciem tagu {% code html %} <body> {% endcode %}), który znajduje się w folderze <span class="file">_layouts</span>. U mnie wygląda to tak:

{% highlight html %}
{% raw %}

<!DOCTYPE html>
<html lang="pl">

{% include head.html %}

<body>

    {% include nav.html %}

    {{ content }}

    {% include footer.html %}

    {% include google-analytics.html %}

</body>

</html>

{% endraw %}
{% endhighlight %}


Trzeba wiedzieć, że do statystyk liczą się też wejścia z localhost lub 127.0.0.1, czyli wtedy, gdy testujemy lokalnie nasze zmiany. Nie powinno to być brane pod uwagę w naszych statystykach, więc warto wykluczyć te adresy. Można to zrobić bezpośrednio w Google Analitcs:

1. Przejdź do konta strony i wybierz administracja.
2. Następnie opcja 'Wszystkie filtry' i 'dodaj filtr'.
3. Jako 'Typ filtra' wybierz 'Predefiniowany'.
4. Kliknij menu 'Wybierz typ filtra' i wybierz 'Wyklucz'.
5. Kliknij menu 'Wybierz źródło lub miejsce docelowe' i wybierz 'ruch z adresów IP'.
6. Kliknij menu 'Wybierz wyrażenie' i wybierz 'rozpoczyna się od'.
7. I Wpisujemy adresy IP, które chcemy wykluczyć.

<p class="note">Filtry działają tylko dla przyszłego ruchu, co oznacza ze wcześniej zebrane dane z localhost nie zostaną wykluczone.</p>

{: .warning}
W moim przypadku to filtrowanie jednak nie działało dla localhost, więc zrobiłem to w nieco inny sposób. Zajrzyj do tego [postu]({% post_url DajSiePoznac2017/2017-04-02-jekyll-filtrowanie-danych-localhost %})

# Komentarze Disqus

Tu postępujemy podobnie, a nawet prościej. Zakładamy konto na [Disqus](https://disqus.com/). Tworzymy konto strony. Discus wspiera Jekylla, więc podczas wyboru platformy na której stoi nasz blog będzie dostępna opcja Jekyll.

Tu również dostaniemy kod, który będziemy załączać pod postami. W tym celu tworzymy plik np. <span class="file">disqus.html</span> w folderze <span class="folder">_includes</span>. Kod, który otrzymasz, musi pojawić się miedzy {% raw %}{% if page.comments %} i {% endif %}{% endraw %}, aby komentarze pojawiały się tylko tam gdzie chcemy. Ostatecznie plik u mnie wygląda tak:

{% highlight html %}
{% raw %}

{% if page.comments %}
<div id="disqus_thread"></div>
<script>

var disqus_config = function () {
this.page.url = "{{ site.url }}{{ page.url }}";
this.page.identifier = "{{ page.id }}";
};

(function() {
var d = document, s = d.createElement('script');
s.src = 'https://jaki-jezyk-programowania.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
</script>
<noscript>Włacz JavaScript w twojej przeglądarce, aby zobaczyć <a href="https://disqus.com/?ref_noscript"> komentarze by Disqus.</a></noscript>
{% endif %}

{% endraw %}
{% endhighlight %}

Zwróć uwagę na:

{% highlight html %}
{% raw %}
this.page.url = "{{ site.url }}{{ page.url }}";

{% endraw %}
{% endhighlight %}

gdzie powinien być adres URL twoich stron jako zmienna. Domyślnie jest to {% raw %}{{ site.url }}{{ page.url }}{% endraw %}, ale gdy dodawałem RSS feed kategori musiał byc / między tagami czyli:

{% highlight html %}
{% raw %}

{{ site.url }}/{{ page.url }}

{% endraw %}
{% endhighlight %}

<p class="warning">
Warto sprawdzić linki w wygenerowanych plikach w folderze <span class="folder">_site</span>
</p>.

Teraz wystarczy dodać do konfiguracji naszego postu opcję 'comments:   true' i system komentarzy pod tym postem zostanie włączony. Dla przykładu dla tego postu konfiguracja wygląda tak:

{% highlight html %}
---
layout:     post
title:      "Statystyki i komentarze na blogu"
subtitle:   "Rozbudowujemy blog na Jekyllu 2#"
date:       2017-03-10 12:00:00
author:     "Codeboy"
category:   DajSiePoznac2017
tag: DajSiePoznac2017
comments:   true
toc:        true
---
{% endhighlight %}

I gotowe. Mamy statystyki i komentarze na blogu.
