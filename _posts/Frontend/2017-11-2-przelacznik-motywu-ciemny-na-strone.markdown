---
layout:     post
titleSEO:	"Jak zrobić tryb nocny/ciemny, przełącznik motywu na blogu/stronie"
title:      "Przełącznik motywu, tryb nocny na blogu/stronie"
subtitle:   "Tryb ciemny/jasny w łatwy sposób, tylko JS."
date:       2017-11-2 12:00:00
author:     "Codeboy"
category:   Frontend
tags:	    Frontend Jak-zrobić
comments:   true
toc:        true
---

Zawszę doceniam, gdy na stronach/blogach mamy możliwość zmiany motywu na ciemny. Jest to świetna opcja do czytania lub do przeglądania strony bez światła. Dlatego też zaimplementowałem taką funkcję na swoim blogu (w prawym górnym rogu w navbarze).

Pokażę jak to wykonałem - relatywnie szybko i bezboleśnie, na przykładzie tego bloga ;)

# Przygotowywujemy przycisk

To kwestia gustu. Tutaj jest w navbarze - na liście opcji, z tooltipem i ikonami fontawsome:

{% highlight html %}

<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
 <ul class="nav navbar-nav navbar-right">
  <!--  ...  -->
  <li>
    <button class="dark-mode-btn nav-el" data-toggle="tooltip" data-placement="bottom" title="Zmień motyw">
     <i class="fa fa-sun-o" aria-hidden="true"></i>/<i class="fa fa-moon-o" aria-hidden="true"></i>
    </button>
  </li>
 </ul>
</div>

{% endhighlight %}

# Obsługujemy zmianę i zapamiętujemy wybór w LocalStorage

Zaimplementowałem to w ten sposób, że po kliknięciu przycisku przełączany jest motyw (u mnie dodawana jest klasa "dark-mode" do body) oraz zapamiętywany jest nasz wybór w [localStorage](https://developer.mozilla.org/pl/docs/Web/API/Window/localStorage) - czyli w pamięci cache przeglądarki dopóki jej nie wyczyścimy.

Dałoby się to zrobić za pomocą ciasteczek, ale wykorzystanie localStorage jest bardziej odpowiednie, gdyż nie wysyłamy nic w nagłówku HTTP (nie marnujemy łącza :D) i nie wygaśnie nam to po jakimś czasie. Wszystkie dzieje się w przeglądarce użytkownika. Poza tym, ciasteczka są przeznaczone do odczytywania po stronie serwera.

Tak więc dodajemy obsługę kliknięcia:

{% highlight javascript %}

document.querySelector('.dark-mode-btn').addEventListener('click', (e) => {
  const darkMode = document.body.classList.toggle('dark-mode');
  e.target.blur();
  localStorage.setItem('dark-mode', darkMode);
});

{% endhighlight %}

{% code javascript %}e.target.blur();{% endcode %} odznacza przycisk po kliknięciu, bez tego byłby aktywny.

Poza tym, przy otwieraniu strony powinien zostać wczytany zapamiętany wybór i zmieniony motyw jeśli jest taka potrzeba:

{% highlight javascript %}

if (JSON.parse(localStorage.getItem('dark-mode'))) {
  document.body.classList.add('dark-mode');
}

{% endhighlight %}

U mnie klasa CSS zmieniającą motyw jest aż tak prosta:

{% highlight css %}

.dark-mode {
  background: #2a2a2a;
  color: #e2e2e2;
}

{% endhighlight %}

Wiadomo, jęśli masz więcej elementów, którym będziesz chciał zmienić wygląd po przełączeniu motywu, tym więcej będziesz musiał stworzyć dodatkowych klas i dodać je później dynamicznie w JS do tych konkretnych elementów.

# Dostosowywanie strony do zmian

Pozostało nam dostosować bloga/stronę do takiej zmiany i w niektórych elementach CSS pozmieniać wartości <code class="highlight">background</code> i <code class="highlight">color</code> na <code class="highlight"><span class="m">inherit</span></code>, aby kolory były dziedziczone z klasy <code class="highlight"><span class="na">.dark-mode</span></code>. Poza tym, prawdopodobnie czeka nas kilka zmian kolorystycznych, aby dopasować się do dwóch trybów.

<p class="note">
    Zdaję sobię, że nie u każdego będzie to takie banalne i czasem wasza strona może wymagać głębszej modyfikacji css, aby nasza strona wyglądała dobrze po zmianie motywu. Dlatego dobrze jest dobierać kolory, które wyglądają ładnie w obu motywach. Wtedy pójdzie to tak szybko jak u mnie ;)
</p>

<p class="idea">
Jeśli używasz Disqus na swojej stronie, to przy zmianie motywu sekcja komentarzy może nie wyglądać poprawnie. Jeśli masz zaznaczoną opcję, aby disqus dostosowywał wygląd automatycznie, możesz wymusić jego przeładowanie po zmianie motywu, aby ponownie się dopasowałAC. Wystarczy dodać taką linijkę tam gdzie obsługujemy kliknięcie:</p>

{% highlight javascript %}

try {
    DISQUS.reset({ reload: true });
} catch (e) {}

{% endhighlight %}

Jest to w try catch, ponieważ zakładam, że nie na każdej stronie masz sekcję komentarzy ;)















