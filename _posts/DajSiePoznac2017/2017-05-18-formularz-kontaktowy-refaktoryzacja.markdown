---
layout:     post
titleSEO:   "Formularz kontaktowy - refaktoryzacja"
title:      "Dodajemy formularz kontaktowy 5#"
subtitle:   "Sporo zmian, większa uniwersalność"
date:       2017-05-18 0:12:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017 Formularz-kontaktowy
comments:   true
toc:        true
---

<u>W tym poście opisuję refaktoryzację naszego wcześniejszego formularza.</u>

Jeśli trafiłeś tu bezpośrednio, zajrzyj do [pierwszego postu]({{ site.url }}{% post_url DajSiePoznac2017/2017-03-16-formularz-kontaktowy-HTML-JS %}), gdzie opisuję założenia i tworzę podstawową strukturę formularza.

<hX>Wpisy w tej serii:</hX>
1. [HTML + otwieranie / zamykanie JQuery]({{ site.url }}{% post_url DajSiePoznac2017/2017-03-16-formularz-kontaktowy-HTML-JS %})
2. [Walidacja HTML5/JS + AJAX]({{ site.url }}{% post_url DajSiePoznac2017/2017-03-23-formularz-kontaktowy-walidacja-ajax %})
3. [Walidacja PHP + Swiftmailer]({{ site.url }}{% post_url DajSiePoznac2017/2017-03-26-formularz-kontaktowy-php-swiftmailer %})
4. [Dostępność formularza]({{ site.url }}{% post_url DajSiePoznac2017/2017-03-30-formularz-kontaktowy-dostepnosc %})
5. [Zrefaktoryzowana wersja + Github]({{ site.url }}{% post_url DajSiePoznac2017/2017-05-18-formularz-kontaktowy-refaktoryzacja %})

# Zmiany

Refaktoryzacja objęła zarówno stronę frontendową, jak i backendową. Kod jest teraz bardziej uniwersalny, łatwiejszy do modyfikacji. Stworzyłem dla niego również osobne [repozytorium](https://github.com/C0deboy/Email-form) na GitHubie.

# Javascript

Pobieranie oraz walidacja danych przebiega teraz automatycznie. Aby dodać nowe pole do formularza wystarczy dorzucić label wraz z inputem, który musi mieć klasę form-data. Wymagany jest też atrybut name. Opcjonalnie możemy dodać reguły walidacji HTML, które zostaną sprawdzone, czyli, np. min/maxlenght, required itd. Kompletne pole wygląda tak:

{% highlight html %}
<label aria-live="polite">
    Test
    <input class="form-data" name="test" placeholder="Test" minlength="4" maxlength="78" required>
</label>
{% endhighlight %}

Działa to w następujący sposób:

Elementy są pobierane automatycznie pętlą i tworzą obiekt JSON:

{% highlight javascript %}
const formDataElements = {};

const inputs = document.querySelectorAll('.form-data');
inputs.forEach((el) => {
    formDataElements[el.getAttribute('name')] = el;
});
{% endhighlight %}

Dzięki temu możemy w wygodny sposób operować na naszych elementach z wykorzystaniem pętli.

<p class="note">
Używam tu anonimowych funkcji strzałkowych ( () => {} ), jest to składnia ES6. Są odpowiednikiem funkcji anonimowej w tradycyjnym zapisie: function () {}
</p>

Nasze komunikaty o błędach teraz przechowywane są w jednym obiekcie JSON, aby można było je łatwiej modyfikować, a co najważniejsze, tylko w jednym miejscu. Dodatkowo posługuję się funkcjami strzałkowymi, które w czytelny sposób budują komunikat ze zmiennych podanych w ich parametrach.

{% highlight javascript %}
const customErrors = {
    'tooShort': (fieldName, min) => "Pole " + fieldName + " musi zawierać co najmniej " + min + " znaki!",
    'tooLong': (fieldName, max) => "Pole " + fieldName + " może zawierać co najwyżej " + max + " znaków!",
    'empty': (fieldName) => "Pole " + fieldName + " nie może być puste!",
    'type': (fieldName) => "Pole " + fieldName + " jest niepoprawne!",
    'errorsInForm': "W formularzu występują błędy!",
    'recaptcha': "Potwierdź, że nie jesteś robotem!",
};
{% endhighlight %}

Mniejsza zmiana dotknęła zamykania formularza, gdzie teraz wszystkie pola są czyszczone przez pętlę, a nie ręcznie:

{% highlight javascript %}
for (const input in formDataElements) {
    formDataElements[input].value = '';
}
{% endhighlight %}

oraz również wartości inputów do wysłania pobierane są pętlą (z wyjątkiem recaptcha):

{% highlight javascript %}
const formData = {
    'g-recaptcha-response': grecaptcha.getResponse(),
};

for (const el in formDataElements) {
    formData[el] = formDataElements[el].value;
}
{% endhighlight %}

Większa zmiana dotknęła też walidacji. Teraz sprawdzane jest każde pole osobno i komunikaty o błędach pojawią się pod każdym z nich. Nie tylko jeden pod przyciskiem "Wyślij", tak jak było to wcześniej. Tam teraz pojawia się tylko ogólna informacja o (nie)powodzeniu wysłania wiadomości.


Wszystkie błędy, które przyjdą od strony PHP w postaci JSON, oznaczane są automatycznie z pomocą pętli:

{% highlight javascript %}
sendEmail.fail(function (error) {

    for (var el in error.responseJSON.errors) {
        if (el === 'recaptcha') {
            markWrongInput(recaptcha, error.responseJSON.errors[el]);
        }
        else {
            markWrongInput(formDataElements[el], error.responseJSON.errors[el]);
        }
    }

    formAlert.innerHTML = customErrors['errorsInForm'];
});
{% endhighlight %}

Podobnie wygląda walidacja po stronie JS. Tu każde pole jest sprawdzane za pomocą HTML5 validation API dla określonych reguł oraz generowane są wcześniej utworzone przez nas komunikaty.

{% highlight javascript %}
function validateEmailForm() {
	let valid = true;
	for (const el in formDataElements) {
	    const fieldName = formDataElements[el].parentElement.innerText;

	    if (formDataElements[el].validity.valueMissing === true) {
	        markWrongInput(formDataElements[el], customErrors['empty'](fieldName));
	    }
	    else if (formDataElements[el].validity.tooShort === true) {
	        const min = formDataElements[el].getAttribute('minlength');
	        markWrongInput(formDataElements[el], customErrors['tooShort'](fieldName, min));
	    }
	    else if (formDataElements[el].validity.tooLong === true) {
	        const max = formDataElements[el].getAttribute('maxlength');
	        markWrongInput(formDataElements[el], customErrors['tooLong'](fieldName, max));
	    }
	    else if (formDataElements[el].validity.typeMismatch === true) {
	        markWrongInput(formDataElements[el], customErrors['type'](fieldName));
	    }
	    if (formDataElements[el].validity.valid === false) {
	        valid = false;
	    }
	}
	if (grecaptcha.getResponse().length === 0) {
	    markWrongInput(recaptcha, customErrors['recaptcha']);
	    valid = false;
	}
	return valid;
}
{% endhighlight %}

Zmianie uległa także nasza funkcja oznaczająca niepoprawne pola. Teraz tworzy i dodaje komunikat pod niepoprawnym polem.

{% highlight javascript %}
function markWrongInput(wrongElement, alert) {

    if (wrongElement.classList.contains('wrongInput')) {
        return;
    }

    const errorMessageEl = document.createElement('p');
    errorMessageEl.classList.add("error");
    errorMessageEl.classList.add('wrongInput');
    errorMessageEl.textContent = alert;

    wrongElement.parentElement.append(errorMessageEl);
    wrongElement.classList.add('wrongInput');
    wrongElement.addEventListener("focus", clearErrors);
}
{% endhighlight %}

I jak widać, odseparowałem funkcję do czyszczenia błędów, która jest uruchamiana, gdy pole uzyska focus:

{% highlight javascript %}
function clearErrors() {
    this.classList.remove('wrongInput');
    this.parentElement.removeChild(this.parentElement.getElementsByClassName('error')[0]);
    formAlert.innerHTML = '';
}
{% endhighlight %}

Osobno na callbacku od recaptchy musiałem podpiąć dla niej focus (tabindex wymagany), co aktywuje funkcję czyszczącą komunikat (clearErrors):

{% highlight html %}
<!--...-->
<div class="g-recaptcha" tabindex="-1" data-sitekey="6LevbxMUAAAAAIa8dsrFNJn0S_b_t5K8INV4z2JD"
                 data-callback="RecaptchaClearMsg"></div>
<!--...-->
{% endhighlight %}

{% highlight javascript %}
function RecaptchaClearMsg() {
    document.querySelector('.g-recaptcha').focus();
}
{% endhighlight %}

# PHP

Tu też sporo zmian. Podpiąłem [Composera](https://getcomposer.org/) do zarządzania zależnościami. Do walidacji stworzona jest funkcja korzystająca z zewnętrznego narzędzia do walidacji danych: [Respect Validation](https://github.com/Respect/Validation). Błędy przechowywane są teraz w tablicy, a email zostanie wysłany tylko wtedy, gdy będzie pusta:

``` php?start_inline=1
function validateContactForm(array $form): array
{
    $errors = [];
    $rules = [
        'userEmail' => (new Validator())->addRules([new NotEmpty(), new Email()]),
        'subject' => (new Validator())->addRules([new NotEmpty(), new StringType(), new Length(4, 78)]),
        'message' => (new Validator())->addRules([new NotEmpty(), new StringType(), new Length(8, 6000)]),
    ];
    $validationMessages = (require_once __DIR__ . '/settings.php')['validationMessages'];

    foreach ($rules as $key => $validator) {
        /** @var $validator Validator */
        try {
            $validator->setName($key)->assert($form[$key] ?? null);
        } catch (NestedValidationException $exception) {
            $exception->findMessages($validationMessages);
            $errors[$key] = $exception->getMessages();
        }
    }

    if (validateReCaptcha($form['g-recaptcha-response'] ?? '') === false) {
        $errors['recaptcha'][] = "Potwierdź, że nie jesteś robotem!";
    }
    return $errors;
}
```

Plik konfiguracyjny <span class="file">settings.php</span> został wzbogacony o treści komunikatów, które są podmieniane z tymi z RespectValidation:

``` php?start_inline=1
return [
    'reCaptcha' => [
        'secret' => '',
    ],
    'mailer'    => [
        'host'     => '',
        'port'     => '',
        'username' => '',
        'password' => '',
        'email'    => '',
    ],
    'validationMessages' => [
        'stringType'=> 'Musi być typu string',
        'length'    => 'Musi zawierać od {{minValue}} do {{maxValue}} znaków',
        'email'     => 'Niepoprawny email',
        'notEmpty'  => 'Pole nie może być puste',
        'NotSent'   => 'Coś poszło nie tak :(',
        'Sent'      => 'Wysłano! Dzięki za wiadomość'
    ],
];
```
Cały kod został również podzielony na osobne funkcje, z drobnymi modyfikacjami:

``` php?start_inline=1
function validateReCaptcha(string $code): bool
{
    $url = 'https://www.google.com/recaptcha/api/siteverify?' . http_build_query([
            'secret' => (require __DIR__ . '/settings.php')['reCaptcha']['secret'],
            'response' => $code,
        ]);
    $content = file_get_contents($url);
    $response = json_decode($content, true);
    return $response['success'];
}

function getMailer(): Swift_Mailer
{
    $config = (require __DIR__ . '/settings.php')['mailer'];

    $transport = new Swift_SmtpTransport($config['host'], $config['port']);
    $transport->setUsername($config['username']);
    $transport->setPassword($config['password']);

    return new Swift_Mailer($transport);
}

function prepareMail(array $params): Swift_Message
{
    $config = (require __DIR__ . '/settings.php')['mailer'];

    $mail = new Swift_Message(
        $params['subject'],
        $params['message'],
        'text/plain',
        'UTF-8'
    );

    $mail->setFrom($params['userEmail']);
    $mail->setReplyTo($params['userEmail']);
    $mail->setTo($config['email']);

    return $mail;
}

function sendMail(array $params): bool
{
    $mailer = getMailer();
    return $mailer->send(prepareMail($params));
}
```

A obsługa wysłania formularza znajduję się w osobnym pliku <span class="file">ajaxsend.php</span>:

``` php?start_inline=1
require_once __DIR__ . '/functions.php';

if ($errors = validateContactForm($_POST)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['errors' => $errors]);
} else {
    if (sendMail($_POST)) {
        http_response_code(200);
        echo json_encode(['status' => (require __DIR__ . '/settings.php')['validationMessages']['Sent']]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => (require __DIR__ . '/settings.php')['validationMessages']['NotSent']]);
    }
}
```
Całość prezentuję się w następujący sposób:


<script async src="//jsfiddle.net/C0deboy/Lmjmmyfc/embed/result,js,html,css/dark/"></script>

