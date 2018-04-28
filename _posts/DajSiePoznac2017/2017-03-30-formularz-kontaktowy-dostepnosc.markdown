---
layout:     post
titleSEO:   "Formularz kontaktowy - dostępność"
title:      "Dodajemy formularz kontaktowy 4#"
subtitle:   "Poprawiamy dostępność formularza"
date:       2017-03-30 0:12:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017
comments:   true
toc:        true
---

<u>W tym poście zajmuję się dostępnością formularza.</u>

Jeśli trafiłeś tu bezpośrednio, zajrzyj do [pierwszego postu]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-16-formularz-kontaktowy-HTML-JS %}), gdzie opisuję założenia i tworzę podstawową strukturę formularza.

<hX>Wpisy w tej serii:</hX>
1. [HTML + otwieranie / zamykanie JQuery]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-16-formularz-kontaktowy-HTML-JS %})
2. [Walidacja HTML5/JS + AJAX]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-23-formularz-kontaktowy-walidacja-ajax %})
3. [Walidacja PHP + Swiftmailer]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-26-formularz-kontaktowy-php-swiftmailer %})
4. [Dostępność formularza]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-30-formularz-kontaktowy-dostepnosc %})
5. [Zrefaktoryzowana wersja + Github]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-05-18-formularz-kontaktowy-refaktoryzacja %})

# Dostępność

Co to jest i dlaczego jest to ważne pisałem już [wcześniej]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-14-dostepnosc-strony-wprowadzenie %}).

W kodzie, który stworzyliśmy, mamy już dwa elementy, które wpływają na dostępność. Mowa o:

- <code class="highlight"><<span class="nt">label</span>></code> - (#musthave) etykieta sprawia, że w większości przypadków, gdy klikniemy na tekst opisujący pole, automatycznie nas do niego przeniesie. Ponadto czytnik ekranowy opisze to pole po uzyskaniu focusu.
- <code class="highlight"><span class="na">placeholder=</span><span class="s">"wartość"</span></code> - ten atrybut przeważnie też zostanie odczytane przez czytnik ekranowy.

Jest to jednak niewiele. Mamy jeszcze sporo do dodania. Zacznijmy od całego formularza.

{% highlight html %}
<div id="contact" class="contact" role="dialog" aria-label="Formularz kontaktowy" aria-hidden="true">
  <!--Wnętrze formularza-->
</div>
{% endhighlight %}


- <code class="highlight"><span class="na">role=</span><span class="s">"dialog"</span></code> - w naszym przypadku formularz to odseparowane od reszty strony okienko i właśnie rola "dialog" odpowiada takim elementom strony. Dzięki temu czytnik ekranowy poinformuje użytkownika, że otwiera okno dialogowe, które jest odseparowane od reszty strony.
- <code class="highlight"><span class="na">aria-label=</span><span class="s">"opis"</span></code> - opis, który zostanie odczytany przez technologie wspomagające.
- <code class="highlight"><span class="na">aria-hidden=</span><span class="s">"true"</span></code> - nasz formularz początkowo jest ukryty. Ten atrybut sprawia, że pozostanie także niewidoczny dla czytników ekranowych. Będziemy zmieniać to pole dynamicznie podczas otwierania/zamykania.


Nasze wnętrze formularza również potrzebuje dodatkowych atrybutów:

{% highlight html %}
<form class="emailForm" method="POST" action="emailform.php">
    <label>
      Twój email
      <input name="from" type="email" placeholder="Wpisz tu twój email" required>
    </label>
    <label>
      Temat
      <input name="subject" placeholder="Wpisz tu temat wiadomości" required>
    </label><br>
    <label for="inp-message">
      Treść
    </label>
    <textarea name="message" id="inp-message" placeholder="Wpisz tu twoją wiadomość" required></textarea>
    <div class="g-recaptcha" data-sitekey="6Lc9_xMUAAAAAFPVNhvDKb9lMXHGI4o7-zhqkTgL"></div>
    <button class="emailFormSubmit" name="submit" type="submit">Wyślij</button>

    <div class="emailFormAlert" aria-live="polite"></div>
  </form>

  <button type="button" id="close-contact-btn" class="close-btn" aria-label="Zamknij formularz kontaktowy" title="Zamknij formularz kontaktowy">
    <i class="fa fa-times close-form" aria-hidden="true"></i>
  </button>
{% endhighlight %}

- <code class="highlight"><span class="na">aria-live=</span><span class="s">"polite"</span></code> - użytkownik, który używa czytnik ekranowy, nie ma pojęcia o kumunikatach, które generujemy. Dzięki temu problem jest rozwiązany. Jest to niezwykle ważny atrybut, gdy tworzymy elementy, które pojawiają sie dynamicznie bez przeładowania strony.
- <code class="highlight"><span class="na">title=</span><span class="s">"Opis"</span></code> - dzięki temu gdy najedziemy na przycisk zamknięcia, wyświetlony zostanie opis, który informuje za co element jest odpowiedzialny. Również zostanie to przeczytane przez czytnik ekranowy. Bez tego użytkownik z niego korzystający nie miałby pojęcia, od czego jest ten przycisk.

Role="dialog" oraz to, że stworzyliśmy okno dialogowe, zobowiązuje nas do dodania jeszcze kilku kluczowych funkcjonalności:
* "Zapętlenie focusu" - czyli np. podczas "tabowania" (użytkownicy konsol, tv, czy zdani na klawiatury, którzy nawigują za pomocą "focusu") nie jest możliwe wyjście poza aktualne okno, czyli:
    * Gdy osiągniemy ostatni element (w tym wypadku przycisk zamknięcia) następny jest pierwszy element w oknie
    * Gdy z pierwszego elementu będziemy chcieli cofnąć się kombinacją Shift+tab przeskoczy do ostatniego elementu
* Klawisz ESC - umożliwia zamknięcie formularza
* Gdy okno jest otwierane "focus" dostaje pierwszy element
* Gdy okno jest zamykane "focus" uzyskuje przycisk, który je otworzył

Zrealizujmy to:

{% highlight javascript %}
  const firstInput = $('input[name="from"]');

  closeContactBtn.on('keydown', function (e) {
   if ((e.which === 9 && !e.shiftKey)) {//tab
       e.preventDefault();
       firstInput.focus();
   }
  });

  firstInput.on('keydown', function (e) {
      if ((e.which === 9 && e.shiftKey)) {//shift+tab
          e.preventDefault();
          closeContactBtn.focus();
      }
  });

  contactForm.on('keydown', function (e) {
      if ((e.which === 27)) {//esc
          toggleContactForm(false);
      }
  });
{% endhighlight %}

Zauważ, że aby to zrobić konieczne jest zatrzymanie domyślnego zachowania - {% code javascript %}preventDefault();{% endcode %}

## Użytkownik bez Javascript-u

<u>Traktowałbym to raczej jako ciekawostkę, gdyż obecnie strony głównie opierają się na Javascripcie, w tym [moja](https://jaki-jezyk-programowania.pl/) jest od niego uzależniona. Nie potrafię sobie wyobrazić, że ktoś w dzisiejszych czasach nie ma w przeglądarce Javascriptu. Ponadto nasz formularz wykorzystuje reCAPTCHE, która bez JS-a się nie obejdzie. Nie widzę sensu w dbaniu o użytkowników bez JS-a w takim wypadku. Mimo wszystko z punktu widzenia dostępności powinno się to robić.</u>

Gdybyśmy w jakiś sposób zastąpili reCAPTCHE, możliwe jest, aby osoby, które nie używają Javascriptu nadal były w stanie korzystać z formularza.

<p class="note">
Możesz to przetestować wyłączając Javascript w przeglądarce. W Chrome to: Opcje -> Ustawienia -> Pokaż ustawienia zaawansowane -> W sekcji Prywatność -> Ustawienia Treści -> Sekcja Javascript lub szybciej, można kliknąć kłodkę obok adresu URL, gdzie znajdziemy tą opcję. Zauważ, że użytkownik bez JS utraci też na dynamicznie generowanych komunikatach i zostanie odniesiony bezpośrednio do pliku <span class="file">emailform.php</span>. Również wykona się domyślna walidacja HTML5. Wcześniej te działania zatrzymaliśmy za pomocą {% code javascript %}preventDefault();{% endcode %}
</p>

Polega to na tym, aby formularz wstępnie nie był schowany (display: none), tylko, żeby robił to JS. W efekcie użytkownik bez JS-a zobaczy od razu formularz na widoku i będzie w stanie go użyć. Stworzymy więc sobie klasę pomocniczą, którą później usuniemy JS-em:

{% highlight css %}
.contact-nojs{
  display: block;
  position: relative;
  transform: none;
  top: 0;
  left: 0;
  margin: auto;
}
{% endhighlight %}

no i usunięcie zaraz po odwołaniu do elementu:

{% highlight javascript %}
  //...
  const contactForm = $('#contact');
  contactForm.removeClass("contact-nojs");
  //...
{% endhighlight %}

Cały kod i efekt końcowy (Spróbuj przejechać się klawiszami i czytnikiem ekranowym po formularzu, aby sprawdzić efekty):

<script async src="//jsfiddle.net/C0deboy/0pju8nt1/embed/result,html,js,css/dark/"></script>
