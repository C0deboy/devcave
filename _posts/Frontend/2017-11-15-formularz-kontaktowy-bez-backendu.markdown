---
layout:     post
titleSEO:	"Jak zrobić formularz kontaktowy na stronie bez PHP - bez backendu?"
title:      "Formularz kontaktowy bez backendu/bez PHP"
subtitle:   "Tylko HTML, Javascript i jQuery(opcjonalnie)."
date:       2017-11-15 12:00:00
author:     "Codeboy"
category:   Frontend
tags:	    Frontend Jak-zrobić Formularz-kontaktowy
comments:   true
toc:        true
---

Podczas DSP2017 tworzyłem formularz kontaktowy dla [jaki-jezyk-programowania.pl](https://jaki-jezyk-programowania.pl/) z wykorzystaniem PHP, który działał na wykupionym serwerze. Później  jednak przeniosłem swoją stronę i bloga na Github Pages, gdzie z PHP już nie można było zrobić użytku. Wysyłanie wiadomości email bez backendu wydawało mi się niemożliwe i myślałem, że już muszę zrezygnować z formularza kontaktowego na stronie. Jednak na ratunek przyszła mi strona [formspree.io](https://formspree.io/), za pośrednictwem której możliwe jest wysyłanie wiadomości email na dowolnego maila.



# Co zawiera i jak działa formularz?
Formularz jest ulepszoną wersją tego, który tworzyłem podczas DSP2017. Tyle, że bez PHP. Jednak jeśli nie widziałeś wcześniejszych postów to:
- Jest otwierany w formie okienka za pomocą przycisku.
- Jest wysyłany asynchronicznie, wykorzystując AJAX - czyli bez przeładowania strony.
- Walidacja odbywa się w Javascript z wykorzystaniem Validation API. Gdy coś jest nie tak, użytkownik dostaje wiadomość.
- Zadbałem też o kwestie dostępności, np. komunikaty mogą być odczytane przez czytniki ekranowe, obsługa klawiaturą (m. in. zamykanie ESC czy zapętlone tabowanie) itd.
- Jest w pełni responsywny - poprawnie wyświetla się na każdym ekranie.
- Formularz można też otworzyć z linka, np. [jaki-jezyk-programowania.pl/#formularz-kontaktowy](https://jaki-jezyk-programowania.pl/#formularz-kontaktowy)

Udostępniam go na [Githubie](https://github.com/C0deboy/contact-form-no-backend) w osobnym repozytorium. Podejrzyj online [tutaj](https://c0deboy.github.io/contact-form-no-backend/). Możesz go wykorzystać na swojej stronie. Jedyne czego wymaga to HTML, Javascript i jQuery - ale praktycznie tylko do AJAX. Jeśli nie używasz na swojej stronie jQuery nie ma sensu dołączać tej kobyły tylko do tego. Możesz przepisać to z użyciem czegoś lżejszego lub w czystym Javascriptcie.

# Kroki, które musisz wykonać

## Pliki
Pobierz paczkę z [Githuba](https://github.com/C0deboy/contact-form-no-backend). Umieść plik JS i CSS w swoim projekcie.

## Przygotowanie strony z formularzem

Otwórz plik <span class="file">index.html</span>, skąd będziesz mógł wziąć potrzebne elementy. Zamieszczę je również tutaj, ale z czasem mogą ulec zmianie, więc lepiej je brać bezpośrednio z <span class="file">index.html</span>.

I tak jak w tym pliku, w sekcji `<head>` na swojej stronie załącz arkusz styli CSS, reCAPTCHA i Font Awesome - jeśli chcesz mieć ładne ikonki:

{% highlight html %}

<link rel="stylesheet" href="css/form.css">
<script src="https://www.google.com/recaptcha/api.js"></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">

{% endhighlight %}

Przed końcem sekcji `<body>` załącz formularz:

{% highlight html %}

<div id="formularz-kontaktowy" class="contact" role="dialog" aria-label="Formularz kontaktowy" aria-hidden="true">
    <form class="emailForm" method="POST" action="https://formspree.io/your.email@example.com">
        <label class="half" aria-live="polite">
            Twój email
            <input class="form-data" name="email" type="email" placeholder="Wpisz tu twój email" required>
        </label>
        <label class="half" aria-live="polite">
            Temat
            <input class="form-data" name="_subject" placeholder="Wpisz tu temat wiadomości" minlength="4" maxlength="78"
                   required>
        </label>
        <label aria-live="polite">
            Wiadomość
            <textarea class="form-data" name="message" placeholder="Wpisz tu twoją wiadomość" minlength="4"
                      maxlength="6000" required></textarea>
        </label>
        <label class="recaptcha-label" aria-live="polite">
            <div class="g-recaptcha" tabindex="-1" data-sitekey="6LevbxMUAAAAAIa8dsrFNJn0S_b_t5K8INV4z2JD"
                 data-callback="recaptchaClearErr"></div>
        </label>
        <button class="emailFormSubmit main-btn" name="submit" type="submit">Wyślij</button>

        <div class="emailFormAlert" aria-live="polite"></div>
    </form>

    <button type="button" id="close-contact-btn" class="close-btn" aria-label="Zamknij formularz kontaktowy"
            title="Zamknij formularz kontaktowy">
        <i class="fa fa-times close-form"></i>
    </button>
</div>
{% endhighlight %}

oraz jQuery i plik JS z obsługą formularza:

{% highlight html %}

<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
<script src="js/emailform.js"></script>

{% endhighlight %}

Następnie umieść przycisk do otwierania formularza w wybranym przez siebie miejscu:

{% highlight html %}

<button id="open-contact-btn" class="main-btn">
    <i class="fa fa-envelope-o" aria-hidden="true"></i> Formularz kontaktowy
</button>

{% endhighlight %}

## Twój email i site key

Podaj twój email w atrybucie <code class="highlight"><span class="na">action</span></code> formularza:

{% highlight html %}

<form class="emailForm" method="POST" action="https://formspree.io/your.email@example.com">
    <!-- ... -->
</form>

{% endhighlight %}

Zdobądź [reCAPTCHA V2](https://www.google.com/recaptcha/admin) site key i kopiuj wklej go do atrybutu <code class="highlight"><span class="na">data-sitekey</span></code> w:

{% highlight html %}

<div class="g-recaptcha" tabindex="-1" data-sitekey="6Lc9_xMUAAAAAFPVNhvDKb9lMXHGI4o7-zhqkTgL"
                 data-callback="recaptchaClearErr"></div>

{% endhighlight %}

## Ostatni krok
Użyj formularza i wyślij pierwszą wiadomość - obojętnie co. Dostaniesz maila od formspree.io, gdzie będziesz mógł potwierdzić, że chcesz otrzymywać maile ze swojej strony.

I gotowe. Od tej pory wszystkie maila wysłane za pomocą tego formularza będą trafiać na twoją skrzynkę.







