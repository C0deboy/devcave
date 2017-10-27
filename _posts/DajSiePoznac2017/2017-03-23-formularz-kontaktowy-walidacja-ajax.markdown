---
layout:     post
titleSEO:   "Formularz kontaktowy- walidacja + AJAX"
title:      "Dodajemy formularz kontaktowy 2#"
subtitle:   "Walidacja Javascript + AJAX"
date:       2017-03-23 0:12:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017 Formularz-kontaktowy
comments:   true
toc:        true
---

<u>W tym poście opisuję walidację formularza po stronie użytkownika (Javascript). Ponadto pokazuję jak za pomocą AJAX, przekazać dane do pliku PHP i odebrać odpowiedź bez przeładowania strony.</u>

Jeśli trafiłeś tu bezpośrednio, zajrzyj do [pierwszego postu]({{ site.url }}{% post_url DajSiePoznac2017/2017-03-16-formularz-kontaktowy-HTML-JS %}), gdzie opisuję założenia i tworzę podstawową strukturę formularza.

Wpisy w tej serii:
1. [HTML + otwieranie / zamykanie JQuery]({{ site.url }}{% post_url DajSiePoznac2017/2017-03-16-formularz-kontaktowy-HTML-JS %})
2. [Walidacja HTML5/JS + AJAX]({{ site.url }}{% post_url DajSiePoznac2017/2017-03-23-formularz-kontaktowy-walidacja-ajax %})
3. [Walidacja PHP + Swiftmailer]({{ site.url }}{% post_url DajSiePoznac2017/2017-03-26-formularz-kontaktowy-php-swiftmailer %})
4. [Dostępność formularza]({{ site.url }}{% post_url DajSiePoznac2017/2017-03-30-formularz-kontaktowy-dostepnosc %})
5. [Zrefaktoryzowana wersja + Github]({{ site.url }}{% post_url DajSiePoznac2017/2017-05-18-formularz-kontaktowy-refaktoryzacja %})

W kolejnym poście zajmiemy się walidacją po stronie serwera (PHP) oraz wreszcie wysyłaniem wiadomości za pomocą Swiftmailer-a

# Walidacja

## Dlaczego zarówno po stronie serwera jak i użytkownika?

Samo zweryfikowanie danych po stronie użytkownika nie jest wystarczającym zabezpieczeniem. Możemy łatwo wyłączyć Javascript w przeglądarce i nasza walidacja znika. Dlaczego więc w ogóle ją robić po stronie użytkownika? Ponieważ jest dla niego bardziej przyjazna oraz przeprowadzana jest natychmiast. Nie ma potrzeby czekać na odpowiedź serwera za każdym razem, kiedy pole jest źle wypełnione. Walidacji po stronie serwera nie da się wyłączyć, więc jest to nasza ostatnia linia obrony przed nieprawidłowymi danymi przekazanymi przez użytkownika.

## Walidacja w HTML5 i Javascript

HTML5 oferuję nam wbudowaną [funkcję walidacji](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation) formularza, którą możemy także obsłużyć i dowolnie modyfikować za pomocą Javascript-u, i z tego skorzystamy.

Tak więc do naszych pól dodajemy takie właściwości:
- <code class="highlight"><span class="na">type=</span><span class="s">"email"</span></code> - pole zostanie sprawdzone czy znajduję się w nim poprawny adres email. Dodatkowo, gdy ten atrybut jest ustawiony, na klawiaturach w urządzeniach mobilnych pojawi się symbol @, co jest dodatkowym ułatwieniem.
- <code class="highlight"><span class="na">required</span></code> - określa, że pole nie może pozostać puste.

<span class="note">Gdy dla &#60;<span class="tag">input</span>&#62; nie zdefiniujemy atrybutu <span class="attr">type</span>, domyślnie jest to <span class="value">"text"</span>.</span>

{% highlight html %}

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

{% endhighlight %}

Od strony HTML to by było na tyle. Przejdźmy do JS/JQuery.

Przypominam, że we wcześniejszym poście pobraliśmy sobie wszystkie elementy formularza, na których teraz będziemy pracować:

{% highlight javascript %}

  const userEmail = document.getElementsByName('from')[0];
  const subject = document.getElementsByName('subject')[0];
  const message = document.getElementsByName('message')[0];
  const recaptcha = document.querySelector(".g-recaptcha");
  const formAlert = document.querySelector(".emailFormAlert");
  const contactForm = $('#contact');

{% endhighlight %}

Dodajemy obsługę zdarzenia - kliknięcie przycisku "Submit":

{% highlight javascript %}

  $('.emailFormSubmit').click(function (event) {
    event.preventDefault();
    formAlert.innerHTML='<i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>';
    //reszta
  });

{% endhighlight %}

W funkcji anonimowej odbieramy to zdarzenie <code class="highlight"><span class="nx">event</span></code> i wywołujemy na nim metodę {% code javascript %}event.preventDefault();{% endcode %}, która zapobiega domyślnemu zachowaniu przycisku "submit". Gdybyśmy tego nie zrobili to wykonałaby się wbudowana walidacja w HTML5, a po jej pomyślnym przejściu przeniosłoby nas do pliku <span class="file">emailform.php</span>, tak jak to określiliśmy w atrybucie <code class="highlight"><span class="na">action</span></code> w formularzu. Jest to coś dokładnie odwrotnego od tego, co byśmy chcieli, więc powstrzymujemy to i wykorzystamy AJAX, aby dostać odpowiedź z pliku <span class="file">emailform.php</span> bez przeładowania strony, zaraz pod naszym formularzem.

<span class="note">
AJAX umożliwia wysyłanie i odbieranie danych z serwera w sposób asynchroniczny(w tle), bez potrzeby przeładowywania całej strony od nowa. Jest to podstawowa metoda tworzenia dynamicznych stron/aplikacji.
</span>

Dodatkowo w następnej linii dodaję ikonkę, która będzie się pojawiać podczas przetwarzania formularza:<i class="fa fa-spinner fa-pulse fa-fw"></i>. Jednak nie zobaczysz jej teraz, bo walidacja po stronie JS jest wręcz natychmiastowa. Ujrzysz ją dopiero podczas wysyłania wiadomości, bo to trwa odrobinę dłużej.

Zanim zaczniemy pisać walidację pobierzemy jeszcze element z odpowiedzią reCAPTCHA:

{% highlight javascript %}
    const recaptchaResponse = document.getElementById("g-recaptcha-response");
{% endhighlight %}

Do walidacji przygotujemy sobie dwie funkcje:

{% highlight javascript %}
  function validateEmailForm()
  {
    if(userEmail.validity.valid===false){
      markWrongInput(userEmail,"Podaj poprawny email!");
    }
    else if (subject.validity.valueMissing){
      markWrongInput(subject,"Wpisz jakiś temat!");
    }
    else if (message.validity.valueMissing){
      markWrongInput(message,"Pusta wiadomość? Napisz coś!");
    }
    else if (grecaptcha.getResponse().length === 0){
      recaptcha.classList.remove('shake');
      recaptcha.classList.add('shake');
      recaptcha.addEventListener("click", function (){this.classList.remove('shake')});
      formAlert.innerHTML="Potwierdź, że nie jesteś robotem!";
    }
    else return true;
  }

{% endhighlight %}

- {% code javascript %}element.validity.valid{% endcode %} - Sprawdza, na podstawie walidacji HTML5, czy element jest prawidłowy. W naszym przypadku sprawdza poprawność maila, bo zadeklarowaliśmy <code class="highlight"><span class="na">type=</span><span class="s">"email"</span></code>.
- {% code javascript %}element.validity.valueMissing{% endcode %} - Tu podobnie, sprawdza czy element zawierający atrybut <code class="highlight"><span class="na">required</span></code> nie jest pusty.
- {% code javascript %}grecaptcha.getResponse().length === 0{% endcode %} - Ten warunek sprawdza czy zaznaczone jest pole reCAPTCHA. Jeśli długość odpowiedzi = 0 to nie jest zaznaczony.

W każdym przypadku, jak pewnie zauwżyłeś, gdy któryś test zwraca "false" za pomocą drugiej funkcji pomocniczej {% code javascript %} markWrongInput(element,"Treść komunikatu"){% endcode %} generujemy komunikat oraz zaznaczamy niepoprawne pole. Wygląda ona tak:

{% highlight javascript %}

  function markWrongInput(wrongElement,alert){
    formAlert.innerHTML=alert;
    wrongElement.classList.add('wrongInput');
    wrongElement.addEventListener("focus", function (){this.classList.remove('wrongInput')});
  }

{% endhighlight %}

Jest relatywnie prosta - zmienia treść komunikatu w elemencie "formAlert" i nadaje (i usuwa ją gdy element uzyska focus) klasę ze stylem "wrongInput", który zawiera animację i wygląda tak:

{% highlight css %}

.wrongInput {
  background: #fd4854;
  border: 1px solid red;
  animation: 1s shake;
  color: white;
}

.shake {
  animation: 1s shake;
}

@keyframes shake {
   0%, 100% {transform: translateX(0);} 
   10%, 30%, 50%, 70%, 90% {transform: translateX(-5px);} 
   20%, 40%, 60%, 80% {transform: translateX(5px);} 
}

{% endhighlight %}

Gdy wszystkie testy przejdą pomyślnie, to zwracana jest wartość "true". Przypiszmy sobie odpowiedź tej funkcji do zmiennej (a w sumie stałej :O <a href="http://es6-features.org/#Constants">ES6</a>) tam gdzię obsługujemy przycisk "submit":

{% highlight javascript %}
    const isValid = validateEmailForm();
{% endhighlight %}

Na jej podstawie zdecydujemy czy wysłać dane:

{% highlight javascript %}
    if(isValid===true){
    	//tu pojawi się AJAX
    }
{% endhighlight %}

Ostatnim krokiem jest wykonanie żądania AJAX. JQuery strasznie ułatwia sprawę:

{% highlight javascript %}
    const sendEmail = $.ajax({
      type: "POST",
      url: "emailform.php",
      dataType : 'json',
      data: {
        'userEmail' : userEmail.value,
        'subject' : subject.value,
        'message' : message.value,
        'g-recaptcha-response' : recaptchaResponse.value
      }
    });
{% endhighlight %}

* Pierwsze dwa pola są oczywiste, już je omawiałem w pierwszym poście.
* {% code javascript %}dataType{% endcode %} określa format przekazywanych danych. W naszym przypadku będzie to json.
* {% code javascript %}data{% endcode %} - i tu właśnie w formacie json (w naszym przypadku obiekt {'nazwa' : wartość}) przekazujemy dane z formularza.

<p class="note">
Po tych samych zdefiniowanych nazwach (<code class="highlight"><span class="s">'userEmail'</span></code>, <code class="highlight"><span class="s">'subject'</span></code> itd.) odbierzemy odpowiadające im wartości w PHP.
</p>

Pozostało nam tylko odebrać odpowiedź, która jest przechowywana w zmiennej "sendEmail". I tak:
gdy coś się nie powiedzie w naszym pliku PHP (czyli wystąpi jakiś error) wyświetlimy komunikat + treść błędu:

{% highlight javascript %}
      sendEmail.fail(function(error) {
        formAlert.innerHTML='Coś poszło nie tak :( '+error.responseText;
      });
{% endhighlight %}

gdy wszystko wykona się poprawnie (walidacja nie musi się powieść, chodzi o to, że kod nie zawiera żadnego błędu) wyświetlimy wygenerowaną na podstawie naszego kodu PHP odpowiedź.

{% highlight javascript %}
      sendEmail.done(function(response){
        formAlert.innerHTML=response.text;
      })
{% endhighlight %}

Oto efekt końcowy:
<script async src="//jsfiddle.net/C0deboy/w0csm9y5/embed/result,js,html,css/dark/"></script>