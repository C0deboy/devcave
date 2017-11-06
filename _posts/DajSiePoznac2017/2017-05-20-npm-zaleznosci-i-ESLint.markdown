---
layout:     post
titleSEO:   "NPM i ESLint"
title:      "NPM i ESLint"
subtitle:   "Dodajemy zależności oraz dbamy o styl!"
date:       2017-05-20 0:12:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017 Javascript
comments:   true
toc:        true
---

Przyszła kolej zająć się strukturą plików, zależnościami oraz zadbać o spójność kodu.

# NPM

NPM - to menadżer pakietów, który pomoże nam opisać projekt i zdefiniować zależności, których wymaga. Od tego momentu pozbędę się wszystkich zewnętrznych bibliotek z repozytorium na Gicie, bo nie powinno ich tam być. Teraz będzie znajdował się tam sam projekt, a dzięki NPM, wszystkie zależności, które są zdefiniowane w pliku <span class="file">package.json</span> będą mogły być zainstalowane jedną prostą komendą:

{% highlight bash %}
npm install
{% endhighlight %}

Oczywiście najpierw musimy mieć NPM, ale instalacja jest banalnie prosta. Ja zainstalowałem <a href="">Node.js</a>, gdzie NPM jest dołączony.

# Definiowanie zależności

Aby utworzyć plik <span class="file">package.json</span> dla naszego projektu, możemy posłużyć się poleceniem:

{% highlight bash %}
npm init
{% endhighlight %}

które na podstawie kilku pytań wygeneruje go dla nas automatycznie.

Następnie, aby pobrać nasze zależności i je dołączyć do pliku <span class="file">package.json</span> wykonujemy polecenie:
{% highlight bash %}
npm install nazwa-pakietu --save
{% endhighlight %}
gdy paczki są niezbędne do uruchamiania środowiska/aplikacji (np. JQuery, Bootstrap), lub
{% highlight bash %}
npm install nazwa-pakietu --save-dev
{% endhighlight %}
gdy paczka niezbędna jest do rozwijania i testowania aplikacji (np. ESLint).

Wszystkie nasz paczki  trafiaja do folderu <span class="folder">node_modules</span>. Znajdziemy tam też całą masę innych zależności, które są wymagane przez nasze zależności, więc nie powinniśmy się przestraszyć ilością podfolderów w nim zawartych. Nasze paczki znajdziemy po tej samej nazwie, którą wywołaliśmy do instalacji, a interesujące nas pliki zazwyczaj w podfolderze <span class="folder">dist</span>. Dla przykładu, w HTML załączamy je w ten sposób:

{% highlight html %}
<!-- Head -->
<link rel="stylesheet" href="node_modules/bootstrap/dist/css/libs/bootstrap.min.css">
<!-- Body -->
<script src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
{% endhighlight %}

# ESLint

ESLint - jest to narzędzie, które dba o to, aby nasz styl kodu JS był zgodny z wcześniej zdefiniowanymi standardami. Wszystko za sprawą reguł, które możemy definiować też sami. Np. jeśli zadeklarujemy regułę, że po każdym if ma się znaleźć klamra ({), to ESLint dopilnuje, aby ta reguła była przez nas przestrzegana i wskaże nam miejsce, gdzie popełniliśmy błąd. Dzięki temu nasz kod będzie spójny i czysty.

<span class="idea">Można też użyć gotowych popularnych styli jak np. styl Google czy airbnb. Osobiście używam ten od airbnb.</span>

Instalujemy ESLint i dodajemy do zależności, ale z parametrem -dev, gdyż to potrzebne jest tylko nam - developerom.
{% highlight bash %}
npm install eslint --save-dev
{% endhighlight %}

## Konfiguracja
Potrzebny będzie nam plik konfiguracyjny <span class="file">.eslintrc.json </span>. Możemy automatycznie go wygenerować za pomocą polecenia:
{% highlight text %}
node_modules\.bin\eslint --init
{% endhighlight %}
i odpowiedzi na kilka pytań. Teraz możemy dodać skrypt NPM dla ESlinta, który będziemy mogli uruchamiać w terminalu.

W naszym pliku powinien się znajdować już jeden skrypt (jeśli zostawiliśmy pytanie "test command" puste):
{% highlight text %}
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
},
{% endhighlight %}
Możemy edytować ten lub dodać nowy:
{% highlight text %}
"scripts": {
    "lint": "eslint js/*.js"
},
{% endhighlight %}
Dzięki temu skryptowi będziemy mogli w konsoli uruchomić polecenie:
{% highlight bash %}
npm run lint
{% endhighlight %}
Które sprawdzi dla nas wszystkie pliki JS w folderze <span class="folder">js</span>.

Jednak używanie ESLint w konsoli nie jest zbyt szczęśliwe, gdyż musimy ręcznie odszukiwać błędy. Dlatego dobrym rozwiązaniem jest aktywować go w naszym IDE, jeśli wspiera taką opcję. Ja używam tego od JetBrains i na szczęście jest taka opcja, co znacznie ułatwia pracę.

<p class="note">
Jeśli używasz PHPStorm lub WebStorm to znajdziesz taką opcję w: File | Settings | Languages and Frameworks | JavaScript | Code Quality Tools | ESLint
</p>

<p class="idea">
Jeśli ESLint zgłasza błedy z elementów Jquery(np. $), DOM(np. document) dodaj do pliku <span class="file">.eslintrc.json </span>
informację:</p>

{% highlight text %}
  "env": {
    "browser": true,
    "jquery": true
  },
{% endhighlight %}