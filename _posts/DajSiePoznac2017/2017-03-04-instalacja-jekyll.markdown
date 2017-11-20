---
layout:     post
titleSEO:	"Jak założyc bloga z pomocą narzędzia Jekyll?"
title:      "Tworzymy blog z pomocą narzędzia Jekyll"
subtitle:   "Instalacja + Ubuntu w Windowsie"
date:       2017-03-04 12:00:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:	    DajSiePoznac2017 Jekyll
comments:   true
toc:        true
---

## Co to Jekyll?

Jekyll jest to narzędzie napisane w języku Ruby (nie musimy znać Rubiego), które pozwala generować statyczne strony na podstawie plików-szablonów na które składają się:

- Plik konfiguracyjny - jedno miejsce, gdzie zarządzimy całym procesem buildowania projektu
- Szablony - pliki HTML z tagami Liquid, które definiują układ i kod strony. Zawierają one zmienne, pod które będą podstawiane odpowiednie wartości np. tytuł strony, treść itd.
- Pliki z treścią - wpisy (np. w formacie markdown) oraz normalne podstrony (w html), które później łaczą się z szablonami
- Pliki nieparsowane - takie jak CSS czy obrazki

Można o nim myśleć jak o opartym na plikach CMS (System zarządzania treścią). Nie potrzebujemy żadnej bazy danych. A blog możemy opublikować za darmo z pomocą GitHub Pages

Jekyll sparsuje otrzymane pliki i wyrzuci nam całą strukturę statycznych plików, które są gotowe na wrzucenie na serwer. Jest to nieco odmienne podejście do tworzenia stron. Tu całość generujemy u siebie na komputerze, a na serwerze trzymamy gotowe, statyczne pliki.

## Jekyll na Windows

Jekyll nie jest oficjalnie wspierany na systemie Windows, jednak jest możliwe, żeby na nim działał -- [link](https://jekyllrb.com/docs/windows/#installation). Na Linuxie cały proces jest mniej skomplikowany, dodatkowo jestem zwolennikiem konsoli Linuxowej, więc i na tym systemie chciałem Jekylla. Sam używam obu systemów, z tym, że częściej Windowsa (w tym do zarządzania projektem), dlatego też wybrałem drogę pośrodku. Co to znaczy? Zainstalowałem Jekylla na Ubuntu wbudowanego w Windowsa ;). Tak, Windows 10 (64 bit) ma wbudowany podsystem Ubuntu i lubię utrudniać sobie życie.

## Wymagania

* GNU/Linux, Unix, or macOS
* Ruby wersja 2.0 lub nowsza
* RubyGems
* GCC i Make

Jeśli jednak pracujesz na Linuxie, większość z tych rzeczy pewnie już masz. Przynajmniej w przypadku Minta, którego używam, tak było.

Możemy to sprawdzić za pomocą komend:
{% highlight bash %}
ruby -v
gcc -v

make –v

{% endhighlight %}

Jeśli nie masz któregoś komponentu to przejdź [dalej](#instalacja-jekyll-na-podsystemie-ubuntu-w-windows-10), tam pokazuję jak to zainstalować. Jedyne, co musiałem dorzucić na Mincie to Ruby DevKit, bo gdy próbowałem instalować Jekylla to wyrzucało błąd.

{% highlight bash %}

apt-get install ruby-dev

{% endhighlight %}

Pozostało już tylko zainstalować Jekyll i Bundler:

{% highlight bash %}

gem install jekyll bundler

{% endhighlight %}

I gotowe. Aby utworzyć projekt naszego bloga wpisujemy:

{% highlight bash %}

jekyll new nazwa-bloga

{% endhighlight %}
Jeśli nie podamy żadnej ścieżki, to utworzy się w miejscu, z którego uruchamiamy komendę. Każde polecenie musimy uruchamiać będąc w folderze projektu.

Nasza strona jest gotowa do uruchomienia i testowania lokalnie. Robimy to za pomocą:

{% highlight bash %}

bundle exec jekyll serve

{% endhighlight %}

Dostępna jest pod adresem [localhost:4000](http://localhost:4000). Domyślny szablon wygląda tak:
![Domyślny szablon Jekyll](/img/default-theme-jekyll.jpg){:class="img-responsive center-block"}

Oczywiście możemy sobie pobrać inne gotowe szablony np. [stąd](http://jekyllthemes.org/) lub [stąd](http://jekyllthemes.io/). Jest tego cała masa, a instalacja prosta - ściągamy dany motyw z GitHuba i podmieniamy wszystkie pliki w naszym folderze projektu.

Podczas tego procesu (jekyll serve) powstaje nam folder _site, gdzie są już gotowe ( wygenerowane przez Jekyll) pliki. Jednak uwaga:

<p class="warning">
Komenda serve służy tylko do testowania lokalnie. Wszystkie linki w wygenerowanych plikach będą dla localhost. Przed wrzuceniem na normalny serwer posługujemy się komendą:
</p>

{% highlight bash %}

bundle exec jekyll build

{% endhighlight %}

Nie masz swojego serwera? Możesz skorzystać darmowo z [GitHub Pages](https://pages.github.com/).

## Konfiguracja Jekyll

Zarządzanie treścią w Jekyll jest dosyć łatwe.

Konfiguracja strony (tytuł, opis, adres url itd.) znajduje się w pliku <span class="file">_config.yml</span>

Szablony stron, podstron czy postów znajdziemy w folderze <span class="folder">_layouts</span>

W folderze <span class="folder">_includes</span> znajdują się, powtarzające się na każdej stronie, bloki HTML takie jak np. sekcja head, nawigacja, stopka itd.

Nasze posty przechowywane są w folderze <span class="folder">_posts</span> Nazwy plików mają określone formatowanie i musimy się tego trzymać: rok-miesiąc-dzień-nazwa-postu. W środku tylko mała konfiguracja, domyślnie:

{% highlight text %}
---
layout: post
title:  "Welcome to Jekyll!"
date:   2017-03-04 20:21:20 +0100
categories: jekyll update
---
{% endhighlight %}

gdzie definiujemy dane postu. Dalej pozostaje już tylko dodać treść, którą tworzymy, jak w zwykłym pliku HTML z małym dodatkiem - (językiem szablonowym?) [Liquid](https://jekyllrb.com/docs/templates/). Dzięki niemu m.in. wprowadzamy zmienne i instrukcje, które pobierają treść do szablonów.

Gdy zrobiliśmy jakieś zmiany i chcemy je przetestować konieczne jest zatrzymanie serwera (ctrl+v) i uruchomienie go od nowa.

## Uruchamiamy Ubuntu w Windows 10

Musimy najpierw włączyć tryb developera: Wybieramy kolejno:
Start-> Ustawienia-> Aktualizacje i Zabezpieczenia-> Dla deweloperów-> Tryb dewelopera

Następnie włączamy funkcję. Przechodzimy do:
Panel sterowania-> Programy-> Programy i funkcje-> Włącz lub wyłącz funkcje systemu Windows

I zaznaczamy opcję Podsystem Windows dla systemu Linux(beta). Restartujemy komputer i gotowe. Wchodzimy w start, wpisujemy bash i mamy konsolę Ubuntu w Windowsie.

# Instalacja Jekyll na podsystemie Ubuntu w Windows 10

Tu niestety musimy zainstalować wszystko ręcznie, lecz nie zabiera to wiele czasu:

## Ruby

W moim przypadku domyślnie komenda:

{% highlight bash %}

apt-get install ruby

{% endhighlight %}

instalowała mi starszą wersję Ruby -- 1.9.1, a wymagana jest 2.0 lub nowsza. Tak więc robię to za pomocą RVM - Menadżera wersji Ruby:

{% highlight bash %}
apt-get install curl

gpg2 --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
curl -sSL https://get.rvm.io | bash -s stable

source ~/.rvm/scripts/rvm

rvm requirements

rvm install 2.4.0
rvm use 2.4.0 –default
{% endhighlight %}

Jeśli wszystko poszło poprawnie to po tej komendzie:

{% highlight bash %}
ruby -v
{% endhighlight %}

powinna ukazać nam się zainstalowana wersja Ruby.

W moim przypadku za każdym razem, gdy otwierałem nową sesję terminala musiałem wpisywac:

{% highlight bash %}

source ~/.rvm/scripts/rvm

{% endhighlight %}

Więc, żeby nie trzeba było robić tego ręcznie, warto dodać to do pliku .bashrc, aby wykonywało się automatycznie :

{% highlight bash %}
echo "source ~/.rvm/scripts/rvm" >> ~/.bashrc
{% endhighlight %}

## GCC i Make:

{% highlight bash %}

sudo apt-get install make
sudo apt-get install gcc

{% endhighlight %}

I dalej istalacja przebiega tak jak [wcześniej](#wymagania), tylko dwie ważne uwagi:

<p class="warning">
W moim przypadku, aby poprawnie uruchamiać komende serve musiałem dodać parametr --no-watch:
</p>

{% highlight bash %}

bundle exec jekyll serve --no-watch

{% endhighlight %}

<p class="warning">
Jeśli chcemy swobodnie edytować pliki na systemie Windows musimy stworzyć projekt w Windowsie, a nie w Ubuntu, ponieważ jeśli będziemy chcieli modyfikować pliki Ubuntu z poziomu Windowsa, uszkodzimy je.
</p>

Tak więc przykładowo jeśli projekt chcemy mieć na pulpicie Windowsa przechodzimy w to miejsce:

{% highlight bash %}

cd /mnt/c/Users/Nazwa-użytkownika/Desktop/

{% endhighlight %}

i z tego miejsca wklepujemy wszystkie polecenia.

