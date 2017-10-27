---
layout:     post
titleSEO:   "Jak dodać RSS feed kategorii na blogu - Jekyll"
title:      "Dodajemy RSS feed kategorii"
subtitle:   "Rozbudowujemy blog na Jekyllu 1#"
date:       2017-03-05 12:00:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017 Jekyll
comments:   true
toc:        true
---

# Co to jest RSS?

RSS umożliwia agregację (łączenie) treści z wielu źródeł w jednym miejscu. Może to być przydatne, jeśli śledzimy wiele blogów czy serwisów. Z jednego miejsca mamy możliwość sprawdzania co nowego zostało opublikowane na każdym z nich. To jedno miejsce, to czytnik RSS, jednak od momentu, kiedy Google zlikwidował swój egzemplarz, RSS stracił dużo na popularności. Istnieją alternatywy takie jak np. [Feedly](https://feedly.com/i/welcome), więc ciągle jest to możliwe, lecz już nie tak popularne jak kiedyś.

# Dodajemy RSS feed kategorii

Jest to wymagane w konkursie DajSięPoznać2017, więc bez tego się nie obejdzie.

Standardowy feed jest generowany automatycznie przez [jekyll-feed](http://jekyll.tips/jekyll-casts/rss-feed/). Jeśli chcemy jednak napisać swój ręcznie, wystarczy, że w głównym katalogu bloga dodamy plik <span class="file">feed.xml</span>, gdzie będziemy mogli to zrobić.

My jednak zajmiemy się feedem ograniczonym do jednej kategorii. Tworzymy więc plik <span class="file">feed.nazwakategorii.xml</span>, w naszym przypadku <span class="file">feed.dajsiepoznac2017.xml</span>. Może wyglądać jak nasz główny feed, który przykładowo zapisany jest tak:

{% highlight xml %}

{% raw %}
---
layout: null
---
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <atom:link href="{{ site.url }}/{{ page.path }}" rel="self" type="application/rss+xml" />
    <title>{{ site.title | xml_escape }}</title>
  <description>{% if site.description %}{{ site.description | xml_escape }}{% endif %}</description>  
    <link>{{ site.url }}</link>
    {% for post in site.posts limit:10 %}
        <item>
          <title>{{ post.title | xml_escape }}</title>
          <description>{{ post.content | xml_escape }}</description>
          <pubDate>{{ post.date | date_to_rfc822 }}</pubDate>
          <link>{{ post.url | prepend: site.url }}</link>
          <guid isPermaLink="true">{{ post.url | prepend: site.url }}</guid>
        </item>
    {% endfor %}
  </channel>
</rss>

{% endraw %}

{% endhighlight %}

z tym, że musimy dodać małego ifa, który ograniczy feed do danej kategorii:

{% highlight xml %}

{% raw %}
---
layout: null
---
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <atom:link href="{{ site.url }}/{{ page.path }}" rel="self" type="application/rss+xml" />
    <title>{{ site.title | xml_escape }}</title>
  <description>{% if site.description %}{{ site.description | xml_escape }}{% endif %}</description>  
    <link>{{ site.url }}</link>
    {% for post in site.posts limit:10 %}
      {% if post.tag == 'DajSiePoznac2017' %}
        <item>
          <title>{{ post.title | xml_escape }}</title>
          <description>{{ post.content | xml_escape }}</description>
          <pubDate>{{ post.date | date_to_rfc822 }}</pubDate>
          <link>{{ post.url | prepend: site.url }}</link>
          <guid isPermaLink="true">{{ post.url | prepend: site.url }}</guid>
        </item>
        {% endif %}
    {% endfor %}
  </channel>
</rss>

{% endraw %}

{% endhighlight %}

I feed kategorii jest gotowy. Jeśli dokonujesz jakichś zmian sprawdź, czy twój feed przechodzi [walidację](https://validator.w3.org/feed/) oraz czy się prawidłowo wykonuje. Możesz to zobaczyć pod adresem [localhost:4000/feed.dajsiepoznac2017.xml](http://localhost:4000/feed.dajsiepoznac2017.xml), gdy testujesz, a oficjalny link w moim wypadku wygląda tak:  
[blog.jaki-jezyk-programowania.pl/feed.dajsiepoznac2017.xml](https://blog.jaki-jezyk-programowania.pl/feed.dajsiepoznac2017.xml).

Gdy wszystko jest poprawnie to wyświetli nam się cała struktura postów. W naszym przypadku będzie to również cała zawartość posta.

Zwróć uwagę na:
* site.title - często zamiennie z site.name
* post.tag - często zamiennie z post.tags
* 'DajSiePoznac2017' - nazwa kategorii musi się zgadzać z kategorią zdefiniowaną w naszym poście. Wielkość liter ma znaczenie.

Możesz sprawdzić jakie masz zdefiniowane wartości w pliku <span class="file">_config.yml</span>, u mnie to:

{% highlight xml %}

# Site settings
title: Codeboy - blog
header-img: img/home-header.jpg
email: kontakt@jaki-jezyk-programowania.pl
copyright_name: jaki-jezyk-programowania
description: "Blog konkursowy DajSięPoznać2017. Opisuję tu rozwój projektu jaki-jezyk-programowania.pl, mojego bloga, a może czasem trafi się też coś innego."
baseurl: ""
url: "https://www.blog.jaki-jezyk-programowania.pl"
github_username:  Codeboy
email_username:  kontakt@jaki-jezyk-programowania.pl

{% endhighlight %}

oraz bezpośrednio w poście, u mnie:

{% highlight xml %}
---
layout:     post
title:      "Dodajemy RSS feed kategorii"
subtitle:   "Rozbudowujemy blog na Jekyllu 1#"
date:       2017-03-05 12:00:00
author:     "Codeboy"
category:   DajSiePoznac2017
tag: DajSiePoznac2017
comments:   true
toc:        true
---
{% endhighlight %}


