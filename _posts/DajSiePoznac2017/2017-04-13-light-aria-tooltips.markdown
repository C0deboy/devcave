---
layout:     post
titleSEO:   "light aria tooltips pure js"
title:      "Light aria tooltips"
subtitle:   "Ta, aria... kocham dostępność ♥"
date:       2017-04-13 00:00:00
author:     "Codeboy"
category:   DajSiePoznac2017
tags:       DajSiePoznac2017
comments:   true
toc:        true
---
Postanowiłem stworzyć lekkie i niezależne (w czystym JS lub jak to woli pure JS) tooltipy. Chciałem również zadbać o ich dostępność. Sam mechanizm dosyć przyjemnie się pisało, ale ta druga część to już koszmar.

## Ah ta dostępność...

Szczerze to już rzygam głosem screen rederów, jak je słyszę to robi mi się nie dobrze. 3/4 czasu poświęciłem na testowanie dostępności tych tooltipów, a i tak nie rozwiązałem problemu. Tzn. w większości przypadków działa prawidłowo, ale gdy opakuję zwykłe słowo(np. w span) tooltipem to screen readery tego nie czytają.

Spróbowałem chyba każdą możliwą kombinację aria-live, describedby, labeledby itd. i nic. Zmieniałem również położenie tooltipa: poza elementem, który go wywołuje, jak i w środku tego elementu (chociaż ta opcja raczej odpada, bo chciałbym, aby nad każdym elementem mógł się pojawić tooltip, a np. w image już nie da rady). Bez żadnego skutku.

## Dziwne zachowania

Screen readery (testowałem NVDA i ChromeVOX) zachowują się co najmniej dziwnie. Jeśli "tabujemy" od góry do elementu z tooltipem to czyta co innego, jak od dołu (shift+tab) - co innego. I właśnie od tyłu zwykłe słowo z tooltipem jest już prawidłowo interpretowane.

Dwa takie same elementy z identycznymi właściwościami? O nie. Dla screen readerów to całkiem coś innego. Przykład?
![Dwa elementy span na stronie](/img/posts/dwa-elementy.png)

Oba (Jak to działa?) wygenerowane za pomocą tej samej funkcji. Ale jak są odczytywane na mojej stronie? Pierwszy to "Jak to działa - nagłówek". A drugi? "Jak to działa - na podstawie twoich odpowiedzi..." czyli poprawnie... FUCK LOGIC.

Już nie wspomnę o tym, że co innego czytają, gdy odpalimy tooltipa kliknięciem, co innego, gdy tabem, a co innego gdy jest hover.

Może ktoś pomoże? :wink:

Obecnie testuje dwie wersje:
* 1 - tooltipy są generowane i wstawiane do DOM od razu po wczytaniu strony, a tylko pokazywane, gdy dany element usyska focus
* 2 - tooltipy są generowane i pokazywane dynamicznie, gdy dany element uzyska focus

Można podejrzeć na fiddle:

## Wersja 1

<script async src="//jsfiddle.net/C0deboy/999rrzo1/embed/result,js,html,css/dark/"></script>

## Wersja 2

<script async src="//jsfiddle.net/C0deboy/nv2npbnm/embed/result,js,html,css/dark/"></script>