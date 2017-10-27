---
layout:     post
titleSEO:   "GitHub - jak usunąć pliku z repozytorium - Git"
title:      "Git - usuwanie pliku z repozytorium"
subtitle:   "Każdemu się zdarza..."
date:       2017-05-24 0:12:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017 Git
comments:   true
toc:        true
---

Komu nie zdarzyło się chociaż raz przez pomyłkę / nieuwagę / niewiedzę wrzucić wrażliwy plik do repozytorium? Jeśli tobie, to zazdroszczę. Jednak nie wszystko stracone! Można się go pozbyć.

<h1>BFG Repo-Cleaner</h1>
Z pomocą przychodzi <a href="https://rtyley.github.io/bfg-repo-cleaner/">BFG</a>! Pobieramy go z oficjalnej strony i kilkoma poleceniami pozbędziemy się niechcianego pliku z repozytorium Git-a:

<u>Zakładam, że pobrany plik jest na pulpicie.</u>
Otwieramy konsolę i przechodzimy na pulpit:

{% highlight bash %}
cd Desktop
{% endhighlight %}

Następnie musimy sklonować nasze repozytorium:

{% highlight bash %}
git clone --mirror https://github.com/Nazwa-użytkownika/nazwa-repozytorium
{% endhighlight %}

<p class="note">
Jeśli używasz GitHub Desktop - dodaj ścieżkę do cmd git-a do zmiennej systemowej Path, aby móc korzystać z gita także w terminalu. Powinna wyglądać mniej więcej tak: <span class="path">C:\Users\Nazwa-użytkownika\AppData\Local\GitHub\PortableGit_(id)\cmd</span>. Zmienne systemowe znajdziesz w <span class="path">Panel sterowania -> System i zabezpieczenia -> System -> Zaawansowane ustawienia systemu -> Zmienne środowiskowe -> Zmienne Systemowe</span>. <u>Pamiętaj o średniku przed wklejeniem ścieżki</u>.
</p>

Jak pewnie zauważyłeś, jest to plik jar, więc do jego uruchomienia będzie potrzebna nam Java.

<p class="note">
Jeśli nie masz <a href="https://www.java.com/pl/download/">Javy</a>, zaopatrz się w nią! Jeśli nie chcesz za każdym razem podawać pełnej ścieżki (domyślnie: <span class="path">C:\WINDOWS\system32;C:\WINDOWS;C:\Program Files\Java\jdk1.7.0\bin</span>) do plików wykonywalnych Javy, dodaj ją również do [Path](https://www.java.com/pl/download/help/path.xml).
</p>

Uruchamiamy go z flagą --delete-files oraz nazwą pliku(<u>nie ścieżka</u>)

{% highlight bash %}
java -jar bfg-wersja.jar --delete-files nazwa-pliku.x
{% endhighlight %}

Następnie przechodzimy do sklonowanego repozytorium

{% highlight bash %}
cd nazwa-repozytorium.git
{% endhighlight %}
I uruchamiamy komendę:

{% highlight bash %}
git reflog expire --expire=now --all && git gc --prune=now --aggressive
{% endhighlight %}
Gdy nie było po drodze żadnych błędów i jesteśmy zadowoleni z wyniku, możemy pushować ;)

{% highlight bash %}
git push
{% endhighlight %}
