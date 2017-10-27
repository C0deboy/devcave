---
layout:     post
titleSEO:   "Webpack - moduły - łączenie kilku plików JS CSS"
title:      "Webpack - zarządzanie modułami"
subtitle:   "Dzielimy pliki Javascript i CSS na moduły"
date:       2017-05-22 0:12:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017
comments:   true
toc:        true
---

Dzielenie kodu na moduły pozwala odseparować niezwiązane ze sobą części, co wpływa na porządek w projekcie. Gdy pracujemy z danym elementem strony nie chcemy przecież przekopywać się przez masę innych niezwiązanych ze sobą funkcji w celu znalezienia tego, czego szukamy. No dobrze, podzielimy nasz kod, np. na 15 plików JS i 10 plików CSS, ale czy to oznacza, że teraz powinniśmy załączyć 15 tagów &#60;script&#62; i 10 tagów &#60;link&#62; w pliku HTML? Oczywiście, że nie! Duża ilość osobno podpiętych plików znacząco wpływa na wydajność ładowania naszej aplikacji, gdyż każdy plik to osobne żądanie HTTP. Tu z pomocą przychodzi nam Webpack.

# Webpack

Webpack - jest to narzędzie, które pozwoli nam spiąć wszystkie nasze moduły w jeden plik, tzw. bundle. Dzięki temu później będziemy mogli załączyć na stronę pojedynczy plik, co jest dużo bardziej wydajnym rozwiązaniem. Ponadto, Webpack może dla nas zoptymalizować wielkość plików czy nawet przetranspilować kod ES6 używając Babel i wiele więcej. Wszystko dzięki dodatkowym loaderom i pluginom.

## Instalacja

Webpack dodajemy do naszych dev-zależności poleceniem:

{% highlight bash %}
npm install webpack --save-dev
{% endhighlight %}

## Konfiguracja

Konfiguracja Webpacka przechowywana jest domyślnie w pliku <span class="file">webpack.config.js</span>, a jej podstawowa wersja wygląda tak:

{% highlight js %}
const path = require('path');

module.exports = {
  entry: {
    home: './js/main.js',
    start: './js/start.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
};

{% endhighlight %}

<hx>Gdzie:</hx>
* entry - para nazwa - ścieżka, gdzie podajemy nazwę oraz wskazujemy plik, który łączy moduły.
* path - folder, do którego będą trafiać nasze paczki.
* filename - nazwa paczki, która powstanie z nazwy w entry i ".bundle.js"

## Lączenie plików

Aby Webpack wiedział jakie pliki ma połączyć, musimy to podać w plikach zadeklarowanych w entry. Służy do tego metoda: {% highlight js %} require('scieżka'); {% endhighlight %} Dla przykładu: {% highlight js %} require('jquery'); require('./nav.js'); require('./laptop.js'); require('./typing.js'); require('./startBtn'); {% endhighlight %}

<p class="note">
Zamiast scieżki można też podać nazwę pakietu zainstalowanego przez npm, tak jak w przykładzie: {% code js %}require('jquery');{% endcode %}
</p>

## Webpack + Babel

Teraz pozostało dla ułatwienia stworzyć sobie skrypt, który będzie uruchamiał webpacka. W tym celu do pliku <span class="file">package.json</span> dodajemy  linię:

{% highlight js %}
//...
"scripts": {
	//...
    "build": "webpack",
  },
//...
{% endhighlight %}
 i teraz możemy stworzyć nasze pliki polecenim:

{% highlight bash %}
npm run build
{% endhighlight %}

 Aby stworzyć zoptymalizowaną wersję, musimy do skryptu przekazać parametr -p. Parametry do skryptów poprzedzamy --, a więc w ten sposób:

{% highlight bash %}
npm run build -- -p
{% endhighlight %}

<p class="warning">
Jeżeli używasz ES6, to operacja ta nie powiedzie się, gdyż optymalizacja nie działa z ES6. Problem ten rozwiąże Babel.
</p>

Babel transpiluje kod ES6 na zrozumiały dla starszych przeglądarek. Standardowo instalujemy go za pomocą npm:
{% highlight bash %}
npm install babel-loader babel-core babel-preset-es2015 --save-dev
{% endhighlight %}
Ponadto musimy dodać go do konfiguracji w <span class="file">webpack.config.js</span>

{% highlight js %}
//...
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', { modules: false }],
        },
      },
    ],
  },
{% endhighlight %}

## CSS

Pliki JS mamy z głowy, ale co z CSS? Do nich musimy pobrać kolejny loader, gdyż Webpack domyślnie wspiera tylko JS. A więc:

{% highlight bash %}
npm install css-loader style-loader --save-dev
{% endhighlight %}

Następnie dodajemy loadery oraz plik CSS do <span class="file">webpack.config.js</span>:

{% highlight js %}
  entry: {
    home: './js/home/main.js',
    global: './css/main.css',
  },
  //...
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', { modules: false }],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
{% endhighlight %}

Pliki możemy łączyć standardowo za pomocą funkcji @import, np. plik <span class="file">main.css</span> może wyglądać tak:

{% highlight css %}
@import url('./home/plik1.css');
@import url('./home/plik2.css');
@import url('./home/plik3.css');
/*itd.*/
{% endhighlight %}

Jednak Webpack nie łączy tą metoda wszystkich importów w jeden plik. Dodaje go inline do DOM, co ma kilka wad. Wydajność jest lepsza tylko dla małych ilości CSS. Uniemożliwia to ładowanie naszych plików CSS do cache przeglądarki, bo poprostu ich nie ma! Wtedy, za każdym odświeżeniem strony wszystko musi być załadowane od nowa, co w przypadku dużych ilości styli nie jest zbyt optymalne. Rozwiązaniem jest plugin ExtractTextPlugin, dzięki któremu połączymy pliki CSS w jeden i będziemy go mogli tradycyjnie załączyć w HTML. Instalacja:

{% highlight bash %}
npm install extract-text-webpack-plugin --save-dev
{% endhighlight %}

Następnie w pliku <span class="file">webpack.config.js</span> dodajemy stałą:

{% highlight js %}
const ExtractTextPlugin = require('extract-text-webpack-plugin');
{% endhighlight %}

Oraz podmieniamy loadery CSS i definiujemy nowy plugin:

{% highlight js %}
//...
	loaders: [
      //...
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
    ],
    plugins: [
      new ExtractTextPlugin('./[name].bundle.css'),
    ],
{% endhighlight %}

Teraz, dzięki Webpackowi, możemy dzielić do woli pliki JS i CSS, a ostatecznie załączymy ich tzw. bundle.

<p class="warning">
Jeśli w twoich plikach, które łączysz, wystepują importy czcionek (np. w Bootstrap) Webpack wyrzuci błędy. Można to rozwiązać z pomocą <a href="https://github.com/webpack-contrib/url-loader">url-loader</a>, <u>jednak warto je pominąć</u>, gdyż często załączane jest kilka formatów (woff, woff2, eot, ttf). Url-loader przetworzyłby je wszystkie, co skutkowałoby ogromnym plikiem CSS. Normalnie, przeglądarka wybiera tylko jeden odpowiedni, a resztę pomija. Dlatego lepiej skorzystać z opcji dla css-loader, która wyłącza przetwarzanie @import url(), ale normalnie działa z @import:
</p>

{% highlight js %}
		//...
		{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
        }),
      },
{% endhighlight %}

Będziemy musieli wtedy inaczej łączyć pliki CSS (bez url()), np:
{% highlight css %}
@import './home/plik1.css';
@import './home/plik2.css';
@import './home/plik3.css';
/*itd.*/
{% endhighlight %}

## EDIT:

<p class="warning">Okazuje się, że jeśli z podaną konfiguracją używamy kilka "entries" na raz (zarówno pliki JS jak i CSS) powstają duplikaty dla plików CSS w wersji JS. Aby to obejść musimy nieco zmienić konfigurację <span class="file">webpack.config.js</span> :
</p>

{% highlight js %}
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    'home.bundle.js': './js/home/main.js',
    'home.bundle.css': './css/home/merge.css',
    'faq.bundle.js': './js/faq.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader', { modules: false },
        query: {
          presets: ['es2015'],
        },
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('./[name]'),
  ],
};
{% endhighlight %}