---
layout:     post
titleSEO:   "Formularz kontaktowy-walidacja-php-swiftmailer"
title:      "Dodajemy formularz kontaktowy 3#"
subtitle:   "Walidacja PHP + Swiftmailer"
date:       2017-03-26 0:12:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017
comments:   true
toc:        true
---

<u>W tym poście opisuję walidację danych z formularza (przesłanych przez AJAX) po stronie serwera (PHP) oraz tworzenie wiadomości, ustawienie połączenia z serwerem pocztowym oraz wreszcie wysłanie wiadomości.</u>

Jeśli trafiłeś tu bezpośrednio, zajrzyj do [pierwszego postu]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-16-formularz-kontaktowy-HTML-JS %}), gdzie opisuję założenia i tworzę podstawową strukturę formularza.

<hX>Wpisy w tej serii:</hX>
1. [HTML + otwieranie / zamykanie JQuery]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-16-formularz-kontaktowy-HTML-JS %})
2. [Walidacja HTML5/JS + AJAX]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-23-formularz-kontaktowy-walidacja-ajax %})
3. [Walidacja PHP + Swiftmailer]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-26-formularz-kontaktowy-php-swiftmailer %})
4. [Dostępność formularza]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-30-formularz-kontaktowy-dostepnosc %})
5. [Zrefaktoryzowana wersja + Github]({{ site.baseurl }}{% post_url DajSiePoznac2017/2017-05-18-formularz-kontaktowy-refaktoryzacja %})

W kolejnym poście zajmiemy się poprawą dostępności formularza.

# Swiftmailer

## Co to takiego?

[Swiftmailer](http://swiftmailer.org/) to biblioteka do wysyłania maili napisana w PHP5.

## Dlaczego nie wbudowany w PHP mail()?

Funkcja mail() jest już przestarzała i stosowanie jej nie należy do dobrych praktyk. Ponadto maile wysyłane za jego pomocą często trafiają do spamu. Dlatego powinniśmy używać nowszych rozwiązań, jak np. Swiftmailer, które oferują dużo większe możliwości i są bardziej bezpieczne.

## Instalacja Swiftmailer-a

Pobieramy paczkę z [gita](https://github.com/swiftmailer/swiftmailer) i wrzucamy do folderu z naszą stroną. Tworzymy plik PHP, który będzie obsługiwał wysyłanie maili, w moim przypadku emailform.php, i załączamy pobraną paczkę.

{% highlight php %}
<?php
  require_once 'swiftmailer/lib/swift_required.php';
  //dalszy kod
?>
{% endhighlight %}

I gotowe. Możemy korzystać ze Swiftmailera.
Przygotujmy sobie jeszcze oddzielny plik konfiguracyjny z wrażliwymi danymi, których nie powinniśmy udostępniać. Gdy korzystamy na przykład z systemu kontroli wersji GIT, nie chcemy, aby te dane były umieszczone publicznie w naszym repozytorium.

Niech będzie to plik <span class="file">emailconfig.php</span>. Utworzymy w nim tablicę z danymi, która będzie zwracana do zmiennej:

{% highlight php %}
<?php
  return [
      'secretKey' => 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XX',
      'mailServer' => 'mail.domena.pl',
      'port'  => '587',
      'username' => 'nazwa-konta',
      'password' => 'haslo',
      'myEmail' => 'naszemail@domena.pl'
  ];
?>
{% endhighlight %}
<hX>Gdzie:</hX>

- <code class="highlight"><span class="s">'secretKey'</span></code> - nasz sekretny klucz do reCAPTCHA
- <code class="highlight"><span class="s">'mailServer'</span></code> - nasz serwer pocztowy
- <code class="highlight"><span class="s">'port'</span></code> - port dla danej uslugi, w przypdaku SMTP jest to 587.
- <code class="highlight"><span class="s">'username'</span></code>, <code class="highlight"><span class="s">'password'</span></code> - nazwa i hasło naszego konta pocztowego.
- <code class="highlight"><span class="s">'myEmail'</span></code> - adres email na który mają trafiać wiadomości.

Jest to nieco lepszy sposób, gdyż nie zaśmiecamy sobie pliku zwykłymi zmiennymi globalnymi, w przypadku gdybyśmy to zadeklarowali tak:
``` php?start_inline=1
  $secretKey = "XXX";
 //itd.
```
Teraz wystarczy dodać nazwę naszego pliku z danymi do <span class="file">.gitignore</span> i będzie on ignorowany przez GIT-a.

Również powiniśmy zablokować dostęp do tego pliku na naszym serwerze. Aby to zrobić wystarczy dodać kilka linijek do pliku <span class="file">.htaccess</span> na naszym serwerze:

{% highlight text %}

<Files emailconfig.php>
order allow,deny
deny from all
</Files>

{% endhighlight %}

Pobieramy i przypisujemy sobie naszą tablicę do zmiennej $config:

``` php?start_inline=1
  $config = require_once 'emailconfig.php';
```

I teraz będziemy mogli uzyskać dostęp do naszych danych w następujący sposób:
``` php?start_inline=1
  $secretKey = $config['secretKey'];
```

## Odbieramy dane wysłane za pomocą AJAX

Przechowywane są one w tablicy super globalnej $_POST, tak jak to zdefiniowaliśmy w żądaniu AJAX w parametrze "type".

``` php?start_inline=1
  $userEmail = $_POST['userEmail'];
  $subject = filter_var ($_POST['subject'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
  $messageText = filter_var ($_POST['message'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
```

<hX>Gdzie:</hX>
- <code class="highlight"><span class="k">filter_var</span></code> -jest to filtr, przez który przepuszczamy zmienne, aby pozbyć się niechcianych znaków. Z filtrem <code class="highlight"><span class="nx">FILTER_SANITIZE_STRING</span></code> usuwane są tagi i znaki specjalne. Flaga <code class="highlight"><span class="nx">FILTER_FLAG_NO_ENCODE_QUOTES</span></code> pomija znaki cudzysłowu.

Zanim przejdziemy do walidacji, odbierzmy jeszcze odpowiedź reCAPTCHA i przypiszmy do zmiennej $answear.

``` php?start_inline=1
  $checkIfBot = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret='.$secretKey.'&response='.$_POST['g-recaptcha-response']);
  $recaptcha = json_decode($checkIfBot);
```
<hX>Gdzie:</hX>
- <code class="highlight"><span class="k">file_get_contents</span>()</code> - ta funkcja zwraca zawartość plików jako string. W naszym przypadku będzie to odpowiedź wygenerowana na podstawie danych w URL, które są przesyłane tak jak metodą GET, o której wspominałem <a href="{{ site.baseurl }}{% post_url DajSiePoznac2017/2017-03-16-formularz-kontaktowy-HTML-JS %}#get-post">wcześniej</a>.
- <code class="highlight"><span class="k">json_decode</span>()</code> - dekoduje dane JSON. Dzięki temu będziemy mogli później uzyskać dostęp do odpowiedzi w ten sposób:

``` php?start_inline=1
$recaptcha->success
```
# Walidacja PHP

Sprawdzamy poszczególne dane od użytkownika oraz odpowiedź reCAPTCHA i tworzymy zmienną $alert, która będzie przetrzymywać komunikaty:

``` php?start_inline=1
  if(!filter_var($userEmail, FILTER_VALIDATE_EMAIL)){
    $alert = 'Podaj poprawny email!';
  }
  else if (empty($subject)){
    $alert = 'Wpisz jakiś temat!';
  }
  else if (empty($messageText)){
    $alert = 'Pusta wiadomość? Napisz coś!';
  }
  else if($recaptcha->success===false){
    $alert = 'Potwierdź, że nie jesteś robotem!';
  }
```
<hX>Gdzie:</hX>
- <code class="highlight"><span class="nx">FILTER_VALIDATE_EMAIL</span></code> - ten filtr sprawdza czy zmienna jest poprawnym adresem email. Jeśli tak zwraca "true". Zauważ, że przed funkcją jest negacja(!). Jeśli email nie jest podany zwraca "false", więc nie ma potrzeby sprawdzać tego osobno.
- <code class="highlight"><span class="k">empty</span>()</code> - Sprawdza czy wartość jest pusta. Jeśli tak zwraca "true". Jako puste brane są pod uwagę "", 0, "0", null.

I możemy wreszcie skonfigurować połączenie za pomocą Swiftmailera, wysłać wiadomość i wyświetlić komunikat w zależności czy się to powiodło czy nie:

``` php?start_inline=1
  else {
    $transport = Swift_SmtpTransport::newInstance($config['mailServer'], $config['port'])
      ->setUsername($config['username'])
      ->setPassword($config['password'])
      ;

    $mailer = Swift_Mailer::newInstance($transport);

    $message = Swift_Message::newInstance($subject)
    ->setFrom($userEmail)
    ->setReplyTo($userEmail)
    ->setTo($config['myEmail'])
    ->setBody($messageText)
    ;

    $emailSent = $mailer->send($message);

    if ($emailSent){
      $alert = 'Wysłano. Dzięki za wiadomość!';
    }
    else {
      $alert = 'Coś poszło nie tak.';
    }
  }
```
Myślę, że ten kod jest w miarę jasny. Jeśli zastanawiasz się co za co odpowiada odsyłam do [dokumentacji](http://swiftmailer.org/docs/introduction.html).

## Jak odebrać błedy / komunikaty PHP przez AJAX?

Bardzo prosto. Musimy je wcześniej jednak przekonwertować na format JSON, gdyż taki zadeklarowaliśmy w naszym żądaniu AJAX w polu "dataType". ``` php?start_inline=1 $response = json_encode(array( 'text' => $alert )); ``` Pozostało skorzystać z funkcji exit`()`, która kończy skrypt i przekazuje naszą odpowiedź: ``` php?start_inline=1 exit($response); ```

Oto nasz cały kod:

{% highlight php %}
<?php
  require_once 'swiftmailer/lib/swift_required.php';
  $config = require_once 'emailconfig.php';
  $secretKey = $config['secretKey'];

  $userEmail= $_POST['userEmail'];
  $subject= filter_var($_POST['subject'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
  $messageText= filter_var($_POST['message'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);

  $checkIfBot = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret='.$secretKey.'&response='.$_POST['g-recaptcha-response']);
  $recaptcha = json_decode($checkIfBot);

  if(!filter_var($userEmail, FILTER_VALIDATE_EMAIL)){
    $alert = 'Podaj poprawny email!';
  }
  else if (empty($subject)){
    $alert = 'Wpisz jakiś temat!';
  }
  else if (empty($messageText)){
    $alert = 'Pusta wiadomość? Napisz coś!';
  }
  else if($recaptcha->success===false){
    $alert = 'Potwierdź, że nie jesteś robotem!';
  }
  else {
    $transport = Swift_SmtpTransport::newInstance($config['mailServer'], $config['port'])
      ->setUsername($config['username'])
      ->setPassword($config['password'])
      ;

    $mailer = Swift_Mailer::newInstance($transport);

    $message = Swift_Message::newInstance($subject)
    ->setFrom($userEmail)
    ->setReplyTo($userEmail)
    ->setTo($config['myEmail'])
    ->setBody($messageText)
    ;

    $emailSent = $mailer->send($message);

    if ($emailSent){
      $alert = 'Wysłano. Dzięki za wiadomość!';
    }
    else {
      $alert = 'Coś poszło nie tak.';
    }
  }

  $response = json_encode(array(
        'text' => $alert
  ));

  exit($response);
?>
{% endhighlight %}
