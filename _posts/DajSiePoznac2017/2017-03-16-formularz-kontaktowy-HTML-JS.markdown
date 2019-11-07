---
layout:     post
titleSEO:   "Jak dodać formularz kontaktowy do strony? HTML JS"
title:      "Dodajemy formularz kontaktowy 1#"
subtitle:   "Założenia + struktura HTML + obsługa otwierania / zamykania"
date:       2017-03-16 0:12:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017
comments:   true
toc:        true
---

W tej serii postów pokazuję jak dodać formularz kontaktowy do naszej strony. Będzie otwierany jako okno dialogowe po naciśnięciu przycisku. Będziemy korzystać z:
* JQuery/Javascript
* AJAX
* PHP
* Swiftmailer
* reCAPTCHA
* Opcjonalnie FontAwesome

Dane będziemy wysyłać AJAX-em do pliku PHP, aby dostawać komunikaty bez przeładowywania strony. Maile będą wysyłane za pomocą Swiftmailera, a walidacja danych będzie się odbywać zarówno po stronie serwera (PHP), jak i lokalnie (Javascript). Dodamy i obsłużymy reCAPTCHE, która pomoże nam uniknąć spamu. Ponadto zadbamy o jego dostępność.

<u>W tym poście pokazuję jak stworzyć strukturę HTML formularza kontaktowego oraz dodaję obsługę jego otwierania i zamykania.</u>

Wpisy w tej serii:
1. [HTML + otwieranie / zamykanie JQuery]({% post_url DajSiePoznac2017/2017-03-16-formularz-kontaktowy-HTML-JS %})
2. [Walidacja HTML5/JS + AJAX]({% post_url DajSiePoznac2017/2017-03-23-formularz-kontaktowy-walidacja-ajax %})
3. [Walidacja PHP + Swiftmailer]({% post_url DajSiePoznac2017/2017-03-26-formularz-kontaktowy-php-swiftmailer %})
4. [Dostępność formularza]({% post_url DajSiePoznac2017/2017-03-30-formularz-kontaktowy-dostepnosc %})
5. [Zrefaktoryzowana wersja + Github]({% post_url DajSiePoznac2017/2017-05-18-formularz-kontaktowy-refaktoryzacja %})

# HTML

W pierwszej kolejności tworzymy strukturę w HTML.

Dodajemy przycisk do wywołania formularza oraz ogólny pojemnik dla formularza, w którym umieszczamy kolejny pojemnik dla jego zawartości:

{% highlight html %}

<button id="open-contact-btn" class="about-link">
  <i class="fa fa-envelope-o" aria-hidden="true"></span>
  Formularz kontaktowy
</button>

<div id="contact" class="contact">
  <div class="contact-content">
    <!--zawartość-->
  </div>
</div>

{% endhighlight %}

Obiekty typu {% code html %} <i class="fa fa-envelope-o" aria-hidden="true"></i> {% endcode %} to ikonki [FontAwesome](http://fontawesome.io/)

Następnie do środka ląduje nasz formularz oraz przycisk jego zamknięcia:

{% highlight html %}

<form class="emailForm" action="emailform.php" method="post">
  <!--pola formularza-->
</form>

<button type="button" id="close-contact-btn" class="close-btn">
  <i class="fa fa-times close-form" aria-hidden="true"></span>
</button>

{% endhighlight %}

Gdzie:
* <code class="highlight"><span class="na">action=</span><span class="s">"emailform.php"</span></code> - tu podajemy gdzie dane z formularza mają być wysłane. W naszym przypadku jest to plik <span class="file"> emailform.php</span>, który znajduje się w tym samym folderze, co strona zawierająca formularz. Gdyby było inaczej, wymagana byłaby ścieżka, gdzie ten plik się znajduje, np. php/emailform.php.
  <span class="note">Gdy to pole nie jest podane to domyślnie dane są wysyłane do strony zawierającej formularz.</span>
 * <code class="highlight"><span class="na">method=</span><span class="s">"post"</span></code> - to metoda, za pomocą której definiujemy jak dane mają być wysłane. Dwie najpopularniejsze to POST i GET.

<p class="note" id="get-post">
Różnica pomiędzy GET i POST:
<br><br>
 Metoda GET wysyła dane doklejając je do adresu URL w postaci ? i kolejno danych: parametr=wartość rozdzielonych znakiem &. (np. w naszym przypadku: <span class="long-link">www.nazwa-strony.pl/emailform.php?from=email%40gmail.com&subject=Mój+temat&message=Moja+wiadomość)</span>, a więc w sposób jawny i umieszcza je w tablicy $_GET. Długość takiego adresu jest ograniczona, więc metoda ta, służy do wysyłania małej ilości danych. Tą metodę można wykorzystać także przy przekazywaniu parametrów przez odnośnik (link).
<br><br>
 Metoda POST z kolei przekazuje dane w ciele żądania HTTP, które trafiają do tablicy $_POST, a więc nie widzimy tego nigdzie na pasku adresu. Jest to preferowany sposób do wysyłania większej ilości danych.
</p>

Następnie w formularzu definiujemy potrzebne nam pola wraz z ich etykietami i nazwami oraz przycisk wyślij:

{% highlight html %}
  <label>
    Twój email
    <input name="from" placeholder="Wpisz tu twój email">
  </label>
  <label>
    Temat
    <input name="subject" placeholder="Wpisz tu temat wiadomości">
  </label>
  <br>
  <label for="inp-message">
    Treść
  </label>
  <textarea name="message" id="inp-message" placeholder="Wpisz tu twoją wiadomość"></textarea>
  <div class="g-recaptcha" data-sitekey="6Lc9_xMUAAAAAFPVNhvDKb9lMXHGI4o7-zhqkTgL"></div><br>
  <button class="emailFormSubmit" name="submit" type="submit">Wyślij</button>

  <div class="emailFormAlert"></div>
{% endhighlight %}

Gdzie:
* {% code html %}<label>{% endcode %} - jest to etykieta opisująca pole, którą można zdefiniować jak w przykładzie na dwa sposoby (Jako rodzic pola lub z id i for). Są one równoważne.</li>
* <code class="highlight"><span class="na">placeholder=</span><span class="s">"wartość"</span></code> - definiuje wartość, która znajduje się w tym polu zanim zaczniemy pisać. Po kliknięciu znika.</li>
* {% code html %} <div class="emailFormAlert"></div> {% endcode %} - pole, w którym będą się pojawiać komunikaty.

## reCAPTCHA

Jest to mechanizm, który pomoże nam w walce z botami. Wystarczy zaznaczenie opcji "Nie jestem robotem" przez użytkownika. Ta wersja jest również bardziej przyjazna dla osób niepełnosprawnych i dla urządzeń mobilnych jak i skuteczniejsza od swoich poprzedniczek. Nikt z nas nie lubił klikać w obrazki czy przepisywać tekstu w celu weryfikacji.

{: .idea}
Ciekawą nowością jest [Invisible reCAPTCHA](http://www.google.com/recaptcha/intro/invisible.html), która ma to robić bez żadnej interakcji z użytkownikiem. Nowe rozwiązanie Google korzysta z uczenia maszynowego i systemów analizy ryzyka. Niewidzialne reCAPTCHA na podstawie m.in. ruchów kursora myszy i adresu IP będzie oceniać, czy nie ma do czynienia z botem. Jeśli test zostanie zakończony pomyślnie, to użytkownik będzie mógł skorzystać z danej usługi. Jeśli nie, to wtedy trzeba będzie przejść standardową weryfikację za pomocą mechanizmów CAPTCHA.

Aby dodać reCAPTCHE do naszej strony będziemy potrzebowali konto Google. Następnie przechodzimy na [oficjalną stronę](https://www.google.com/recaptcha/intro/invisible.html), klikamy przycisk "Get reCAPTCHA" i rejestrujemy naszą witrynę. Do testowania lokalnie można użyć w polu "Label" dowolnej nazwy, a w "Domains" nadać "localhost", aby nasza reCAPTCHA działała poprawnie, gdy testujemy stronę na localhost.

Dostajemy dwa klucze:
* Site key - publiczny, który umieszczamy w kodzie HTML
* Secret key - prywatny, który będzie znajdował się po stronie serwera i nie może być dla nikogo widoczny.

<p class="warning">
Gdy, przerzucamy stronę na serwer konieczne jest zarejestrowanie i ponowne skonfigurowanie reCAPTCHY. Gdy tego nie zrobimy i "Site key" nie będzie się zgadzał z aktualną i zarejestrowaną domeną, dostaniemy komunikat: "Informacja dla właściciela witryny – wykryliśmy BŁĄD:
nieprawidłowa domena dla klucza witryny".
</p>

Dodatkowo musimy podpiąć skrypt reCAPTCHY do naszej strony:

{% highlight html %}
<script src='https://www.google.com/recaptcha/api.js'></script>
{% endhighlight %}

na samym końcu w sekcji {% code html %}<head>{% endcode %}. Następnie umieszczamy przycisk reCAPTCHA, który również dostaniemy z własnym "Site key":

{% highlight html %}

<div class="g-recaptcha" data-sitekey="6LcgRBkUXXXXXPtgjgrIu07g1zRovUGvRcbEVzG5"></div>

{% endhighlight %}

w wybranym miejscu w naszym formularzu. Pozostało już tylko obsłużyć reCAPTCHE po stronie serwera w PHP. Tym zajmiemy się w kolejnym poście.

# Otwieranie / Zamykanie okna formularza

## Javascript/JQuery

Obsługę tych zdarzeń znacznie nam ułatwi [JQuery](https://jquery.com/), przyda się też do wysyłania danych AJAXem. Tworzymy plik JS <span class="file">emailform.js</span> i załączamy go na końcu sekcji {% code html %}<body>{% endcode %}. Dodatkowo, aby zagwarantować, że [DOM](https://en.wikipedia.org/wiki/Document_Object_Model) jest wczytany, zapisujemy:

{% highlight javascript %}

$(function(){
  //tu trafia dalszy nasz dalszy kod
});

{% endhighlight %}

Wczytujemy wszystkie elementy formularza:

{% highlight javascript %}

  const userEmail = document.getElementsByName('from')[0];
  const subject = document.getElementsByName('subject')[0];
  const message = document.getElementsByName('message')[0];
  const recaptcha = document.querySelector(".g-recaptcha");
  const formAlert = document.querySelector(".emailFormAlert");
  const contactForm = $('#contact');

{% endhighlight %}

<p class="note">
Część za pomocą JS, jeden za pomocą JQuery. Ma to znaczenie, ponieważ metody Jquery są dostępne tylko dla obiektów JQuery. I odwrotnie. Metody JS są dostępne tylko dla obieków JS'a.
</p>

I tworzymy funkcję, która w zależności od podanego argumentu true/false, otworzy lub zamknie formularz. Gdy wywołane zostanie zamknięcie dodatkowo czyści pola i resetuje reCAPTCHE (posiada również mały test, który sprawdza czy podany argument jest wartością true/false):

{% highlight javascript %}

  function toggleContactForm(state) {
    if (typeof state !== 'boolean') return TypeError('State must be a boolean');

    if (state === true) {
      contactForm.fadeIn();
    }
    else {
      contactForm.fadeOut();
      userEmail.value='';
      subject.value='';
      message.value='';
      formAlert.innerHTML='';
      grecaptcha.reset();
    }
  }

{% endhighlight %}

oraz dwie funkcje dla przycisków, które po kliknięciu otwierają/zamykają formularz. Pobierzemy również przyciski do stałych, gdyż póżniej będziemy je jeszcze wykorzystywać, więc nie ma sensu za każdym razem robić nowego odwołania:

{% highlight javascript %}

  const closeContactBtn = $('#close-contact-btn');
  const openContactBtn = $('#open-contact-btn');

  openContactBtn.click(function () {
    toggleContactForm(true);
  });

  closeContactBtn.click(function () {
    toggleContactForm(false);
  });

{% endhighlight %}

Oto efekt końcowy wraz z dorzuconymi stylami:

<script async src="//jsfiddle.net/C0deboy/ds1dfkxf/embed/result,html,css,js/dark/"></script>
