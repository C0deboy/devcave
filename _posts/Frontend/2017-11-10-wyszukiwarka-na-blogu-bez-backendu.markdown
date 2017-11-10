---
layout:     post
titleSEO:	"Jak zrobić wyszukiwarkę na blogu bez backendu?"
title:      "Wyszukiwarka na statycznych stronach/blogu bez backendu"
subtitle:   "Tylko Javascript, na przykładzie bloga na Jekyllu"
date:       2017-11-10 12:00:00
author:     "Codeboy"
category:   Frontend
tags:	    Frontend Jak-zrobic
comments:   true
toc:        true
---

Zastanawiałem się niedawno czy możliwe jest zrobienie wyszukiwarki na statycznej stronie/blogu bez użycia technologii backendowych (chciałem mieć taką na blogu). Okazuję się, że tak - zdziwiłbym się, jeśli było by  inaczej, bo czego to nie można zrobić w IT? Pokażę jak to zrobić wykorzystując projekt na Githubie [jekyll-search-js](https://github.com/daviddarnes/jekyll-search-js), który zmodyfikowałem na swoje potrzeby. Niby jest on typowo pod Jekylla, ale można wykorzystać to w innych technologiach - kluczowe jest wygenerowanie wcześniej pliku JSON z mapą naszych linków do wyszukiwania.

# Generowanie pliku z mapą wyszukiwania

Bez tego nasza wyszukiwarka się nie obejdzie. To w nim będzie się odbywało wyszukiwanie elementów. Jeśli mamy możliwość wygenerować taki plik, to będziemy mogli zrobić wyszukiwarkę. Dlatego nie jest to ograniczone do Jekylla jak nazwa wskazuje. Zapewne można to zrobić na co najmniej kilka sposobów ;)

W Jekyllu jest to całkiem proste. Po ściągnięciu paczki z Githuba umieszczamy ją w zasobach projektu i otwieramy plik <span class="file">search.json</span>. W domyślnej wersji do wyszukiwarki trafią nie tylko posty, ale również podstrony. Na blogu chciałem wyszukiwarkę tylko dla postów i zmodyfikowałem nieco kod:

{% highlight liquid %}
{% raw %}
---
layout: null
sitemap: false
---

{% capture json %}
[
  {% assign collections = site.collections | where_exp:'collection','collection.output != false' %}
  {% for collection in collections %}
    {% assign docs = collection.docs | where_exp:'doc','doc.sitemap != false' %}
    {% for doc in docs %}
      {% assign m = doc.date | date: "%-m" %}
      {
        "title": {{ doc.title | jsonify }},
        "subtitle": {{ doc.subtitle | jsonify }},
        "date": "{{ doc.date | date: "%-d" }} {% case m %}{% when '1' %}stycznia{% when '2' %}lutego{% when '3' %}marca{% when '4' %}kwietnia{% when '5' %}maja{% when '6' %}czerwca{% when '7' %}lipca{% when '8' %}sierpnia{% when '9' %}września{% when '10' %}października{% when '11' %}listopada{% when '12' %}grudnia{% endcase %} {{ doc.date | date: "%Y" }}",
        "url": {{ site.baseurl | append: doc.url | jsonify }}
      }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  {% endfor %}
]
{% endcapture %}

{{ json | lstrip }}
{% endraw %}
{% endhighlight %}

Ponadto, dodałem wszystkie brakujące informację o poście - podtytuł i datę, a usunąłem miedzy innymi content, bo nie chcę w wyszukiwarce pokazywać treści postu, tylko sam odnośnik. Te brzydkie "casey" po środku odpowiadają za tłumaczenie miesięcy na polski. Niestety w Jekyllu nie ma lepszego rozwiązania.

Po wygenerowaniu pliku przez Jekyll wygląda to tak:

{% highlight json %}

[
      {
        "title": "Projekt jaki-jezyk-programowania.pl",
        "subtitle": "Wprowadzenie",
        "date": "1 marca 2017",
        "url": "/dajsiepoznac2017/wprowadzenie"
      },
      <!-- ... -->
      {
        "title": "Przełącznik motywu, tryb nocny na blogu/stronie",
        "subtitle": "Tryb ciemny/jasny w łatwy sposób, tylko JS.",
        "date": "2 listopada 2017",
        "url": "/frontend/przelacznik-motywu-ciemny-na-strone"
      },

      {
        "title": "Liceum vs technikum - co wybrać jako programista?",
        "subtitle": "Moje spostrzeżenia i podsumowanie 4 lat w technikum",
        "date": "5 listopada 2017",
        "url": "/wybory-programisty/liceum-vs-technikum-co-wybrac"
      },

      {
        "title": "Wyszukiwarka na statycznych stronach/blogu bez backendu",
        "subtitle": "Tylko Javascript, na przykładzie bloga na Jekyllu",
        "date": "10 listopada 2017",
        "url": "/frontend/wyszukiwarka-na-blogu-bez-backendu"
      }
]

{% endhighlight %}

Czyli mamy plik z danymi o każdym poście na stronie, gotowy do obróbki.

# Przeszukiwanie i pokazywanie wyników

Tu całą robotę zrobi za nas Javascript. W paczce są jeszcze 2 pliki <span class="file">search.js</span> i <span class="file">fetch.js</span>. Ten drugi odpowiada za dobieranie się do wygenerowanego pliku JSON, a całą logikę realizuje <span class="file">search.js</span>. Tak więc, <span class="file">fetch.js</span> zostawiamy w spokoju, a pod własne potrzeby modyfikujemy ten pierwszy. Kluczowe są dwie metody - {% code javascript %}findResults(){% endcode %}, gdzie możemy zmodyfikować sposób dopasowywania wyników i {% code javascript %}displayResults(){% endcode %}, gdzie modyfikujemy sposób prezentacji.

U siebie, wyszukiwanie zmodyfikowałem tak, aby były brane pod uwagę pojedyncze słowa, a nie całe frazy:

{% highlight javascript %}

async findResults() {
    this.resultsList.innerHTML = '<i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>';
    const data = await this.fetchedData();
    return data.filter((item) => {
      const inputValue = this.searchField.value.trim().replace(/\s/g, ' | ');/*<--*/
      const regex = new RegExp(inputValue, 'gi');
      return item.title.match(regex) || item.subtitle.match(regex);
    });
  }

{% endhighlight %}

 Z kolejnych słów wpisanych w wyszukiwarce budowane jest wyrażenie regularne, oddzielając je \'\|\' - co znaczy, że będzie dopasowane dowolne słowo, a nie tak jak domyślnie - całe zdania. U mnie działa to o wiele lepiej.
 
 Warstwę prezentacji zmodyfikowałem o klasy występujące na blogu i wcześniej dodane pola:


{% highlight javascript %}

async displayResults() {
    const results = await this.findResults();
    const html = results.map(item => `
        <li class="result">
            <article class="result__article  article">
                <div class="post-preview">
                  <a href="${item.url}">
                    <h2 class="post-title">${item.title}</h2>
                    <h3 class="post-subtitle">${item.subtitle}</h3>
                  </a>
          
                  <p class="post-meta">${item.date}</p>
                </div>
            </article>
            
            <hr>
        </li>`).join('');
    if ((results.length === 0) || (this.searchField.value === '')) {
      this.resultsList.innerHTML = '<p>Nic nie znaleziono</p>';
    } else {
      this.resultsList.innerHTML = html;
    }
  }

{% endhighlight %}

Pozostało nam dołączyć wyszukiwarkę do naszej strony, czyli:
- zdefiniować wymagane elementy w HTML
- załączyć skrypty
- utworzyć nowy obiekt {% code javascript %} jekyllSearch {% endcode %} podając kolejno:
    * ścieżkę do pliku z mapą wyszukiwania, tu <code class="highlight"><span class="s">'/dist/js/search/search.json'</span></code>
    * klasę inputa/pola wyszukiwarki, tu <code class="highlight"><span class="s">'search-value'</span></code>
    * pojemnika na wyniki, tu <code class="highlight"><span class="s">'search-results'</span></code>
- i zainicjować go:

{% highlight html %}

<div class="search-engine">
  <label>
    Wyszukaj po tytule/podtytule:
    <input class="search-value" placeholder="Wpisz szukaną frazę"/>
  </label>

  <div class="search-results"></div>

  <script src="/dist/js/search/fetch.min.js"></script>
  <script src="/dist/js/search/search.min.js"></script>

  <script>

    const search = new jekyllSearch(
      '/dist/js/search/search.json',
      '.search-value',
      '.search-results',
    );

    search.init();

  </script>
</div>

{% endhighlight %}



A oto efekt - działa zaskakująco dobrze ;)

<div class="search-engine">
  <label>
    Wyszukaj po tytule/podtytule:
    <input class="search-value" placeholder="Wpisz szukaną frazę"/>
  </label>

  <div class="search-results"></div>

  <script src="/dist/js/search/fetch.min.js"></script>
  <script src="/dist/js/search/search.min.js"></script>

  <script>

    const search = new jekyllSearch(
      '/dist/js/search/search.json',
      '.search-value',
      '.search-results',
    );

    search.init();

    search.getUrlSearchQuery();

  </script>
</div>


