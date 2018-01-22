---
layout:     post
titleSEO:	"Konkurs Gynveala - gra do 20KB (strategia turowa)"
title:      "Konkurs Gynveala - gra do 20KB (strategia turowa)"
subtitle:   "Brałem udział, więc pokazuję co mi wyszło ;)"
date:       2018-01-22 12:00:00
author:     "Codeboy"
category:   Inne
tags:	    Inne 
comments:   true
toc:        true
---

[Konkurs](http://gynvael.coldwind.pl/?id=668) rozpoczął się jeszcze przed nowym rokiem. Polegał na stworzeniu turowej gry taktycznej do 20KB, przy użyciu tylko i wyłącznie czystego Javascriptu. Wszystko musiało być też w jednym pliku <span class="file">index.html</span>. Nie można było więc dociągać z innych źródeł obrazków, dźwięku, css-ów czy javascriptu. Wszystko musiało być wrzucone do jednego pliku. Ten limit stanowił główne wyzwanie. Oznaczało to też, że nie ma możliwości użycia żadnej biblioteki do tworzenia gier czy jakiegoś silnika. Nagrody prezentowały się następująco:

>Best Game Award:<br>
>Top 1: 150 USD (or equivalent in different currency)<br>
Top 2: 100 USD (or equivalent...)<br>
Top 3: 50 USD (or equivalent...)

Gdzie głosują tylko wybrane osoby oraz:

>Community Choice Award:<br>
Top 1: 100 USD (or equivalent...)<br>
Top 2: 50 USD (or equivalent...)<br>
Top 3: 25 USD (or equivalent...)

gdzie może głosować każdy.

# Co udało mi się zmieścić w te 20KB?

You Shall Not Pass - to tytuł gry. Wygląda mniej więcej tak:

![Gra na konkurs](/img/GWGC2017/game.PNG)

Gra dosyć prosta - player (Wizard), HP, Mana, 3 czary i 3 przeciwników z różnymi atakami. Na turę można wykonać 3 ruchy, 3 ataki no i czary według many. Celem jest przebicie się do portalu, który znajduję się na krańcach mapy i wejście na wyższy level, gdzie mamy więcej przeciwników. Nie ma ostatniego levelu, jednak po pewnym czasie jest tak dużo przeciwników, że nie da się wygrać. Więcej zmieścić się nie dało.

W grę możesz zagrać [tutaj](https://c0deboy.github.io/You-Shall-Not-Pass/), jednak najpierw polecam przeczytać [README](https://github.com/C0deboy/You-Shall-Not-Pass#readme), żeby zobaczyć sterowanie i kluczowe informacje.

# Jak gra powstawała i jak ją zmieściłem w 20KB?

Nad grą dużo nie myślałem. Jeden wieczór i już miałem w miarę całą wizję na grę. Oczywiście nie wszystko udało się zrobić, część rzeczy została również okrojona ze względu na limit 20KB. Moje założenia były nieco optymistyczne i gra wyszła taka sobie. Mimo wszystko jestem zadowolony, że udało mi się to jakoś wcisnąć do 20KB. Bo jak to wyglądało? Kod Javascriptu starałem się pisać "obiektowo", czyli nie pisałem wszystkiego w jednym pliku. Uproszczona struktura plików wyglądała mniej więcej tak:

![Strukura plików](/img/GWGC2017/file-structure.PNG){: .center-block }

Z użyciem webpacka połączyłem wszystko w całość, a dzięki uglify-js mogłem zminifikować kod do takiej postaci:

{% highlight javascript %}

!function(t){function e(i){if(a[i])return a[i].exports;var s=a[i]={i,l:!1,exports:{}};return t[i].call(s.exports,s,s.exports,e),s.l=!0,s.exports}var a={};e.m=t,e.c=a,e.d=function(t,a,i){e.o(t,a)||Object.defineProperty(t,a,{configurable:!1,enumerable:!0,get:i})},e.n=function(t){var a=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(a,"a",a),a},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=0)}([function(t,e,a){"use strict";function i(t){k=t,(p=new l.a).setLevel(t),m.a.drawTextCenter("Level "+t),x=p.getMap(),C=new u.a,(v=new c.a).health=30/(E/1.2*2)+10,console.log(v.health),y.a.updateUI(v,C),B=[],M&&m.a.drawEndTile(32*p.endTileCords.x+16,32*p.endTileCords.y+16),setTimeout(r,700)}function s(t){p.removeFromWorld(t.x,t.y),setTimeout(()=>{for(let e=0;e<B.length;e++)B[e].id===t.id&&B.splice(e,1)},300)}function r(){y.a.updateUI(v,C),p.updateUnit(v),function(){function t(t){let e=P[(new t).name+"s"];const a=e*=Math.round(Math.pow(E,p.currentLevel));for(let e=0;e<a;e++){let e=p.getUniqueMapCords();const a=new t(32*e.x,32*e.y);B.push(a),p.updateUnit(a)}}t(h.a),t(A.a),t(w.a)}(),T.updateEnemies(B),b.addListeners(),C.addNextTurnAction(o),m.a.drawUnit(v)}function n(){m.a.clear(),m.a.drawTerrain(p,x),m.a.drawCircle(32*p.endTileCords.x+16,32*p.endTileCords.y+16,16,"blue"),m.a.drawEnemies(B),m.a.drawUnit(v),b.updateContext(x,v),m.a.drawLightAroundPlayer(v),y.a.updateUI(v,C)}function o(){v.x===32*p.endTileCords.x&&v.y===32*p.endTileCords.y&&i(p.currentLevel+1),v.avaiableMoves=3,v.avaiableAttacks=3,v.mana<10&&v.mana++,T.updateEnemies(B),T.moveEnemiesToPlayer(v),setTimeout(()=>T.moveEnemiesToPlayer(v),600),setTimeout(()=>{T.moveEnemiesToPlayer(v),B.forEach(t=>{t.avaiableAttacks=1,t.freezed=!1})},1200),v.health<=0&&(setTimeout(()=>v.frame=3,300),setTimeout(()=>v.frame=4,600),setTimeout(()=>{confirm("You have died. Try again."),window.location.reload()},1e3))}Object.defineProperty(e,"__esModule",{value:!0}),a.d(e,"destroyEnemy",function(){return s}),a.d(e,"world",function(){return p}),a.d(e,"player",function(){return v});var l=a(6),c=a(5),h=a(8),A=a(9),d=a(10),m=a(2),u=a(11),f=a(12),y=a(15),g=a(3),w=a(16);let p,x,C,v,B,k,E=1.2,M=!0;const T=new d.a,b=new f.a,P={Goblins:3,Imps:3,"Orc Archers":3};window.setDifficulty=(t=>{E=1.2*t/2,document.querySelector(".difficulty").style.display="none",i(1),g.a.start(n)}),window.setSpell=((t,e)=>{v.spell=t,document.querySelectorAll(".spell").forEach(t=>{t.style.border="2px solid #562403"}),e.style.border="2px solid #5b86e5"}),window.restartLevel=function(){i(k)},document.addEventListener("keydown",t=>{const e=t.keyCode;v.avaiableMoves>0&&function(t){37===t||65===t?v.moveLeft():39===t||68===t?v.moveRight():38===t||87===t?v.moveUp():40!==t&&83!==t||v.moveDown()}(e)}),document.addEventListener("keydown",t=>{const e=t.keyCode;13!==e&&70!==e||C.nextTurn()})},function(t,e,a){"use strict";var i=a(2),s=a(0),r=a(3);let n=0;e.a=class{constructor(){this.id=n++,this.avaiableMoves=1,this.avaiableAttacks=1,this.frame=1,this.isMoving=!1,this.tick=10}moveUp(){s.world.isCollidingUp(this)||(this.updateLastPosition(),this.y-=32,this.afterMove())}moveDown(){s.world.isCollidingDown(this)||(this.updateLastPosition(),this.y+=32,this.afterMove())}moveLeft(){s.world.isCollidingLeft(this)||(this.updateLastPosition(),this.x-=32,this.frame=-1,this.afterMove())}moveRight(){s.world.isCollidingRight(this)||(this.updateLastPosition(),this.x+=32,this.frame=1,this.afterMove())}afterMove(){this.isMoving=!0,s.world.updateUnit(this),i.a.drawUnit(this),setTimeout(()=>this.isMoving=!1,400),this.avaiableMoves--}updateLastPosition(){this.lastY=this.y,this.lastX=this.x}revertMove(){this.x=this.lastX,this.y=this.lastY}takeDamage(t){this.health-=t,r.a.addAnimation(()=>i.a.drawBlood(this.lastX+16,this.lastY+16)
// i wiele wiele więcej...
{% endhighlight %}

HTML i CSS-y wyglądały podobnie. Dowiedziałem się, że obrazki również można zakodować tekstem, dzięki base64. Wtedy jako src (source) obrazka można było użyć przykładowo takiej oto postaci:

<pre>
<code class="highlight"><span class="s">"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTOujLOXn7z8oFmVVU21cWZSJkKRrGMTEz39PEFs7G7GFQ3VtgNPQ2NbT2nZzjXFhU5aZp4Ftno8AAAAPdFJOUwD8/fyAVSX+/v645MBXnxS2UhAAAAC4SURBVCjPdZJBkgQhCARFVEC6Ff//2WE9LrRHM6pMCEsZ7xolP/3htd53pOgw11pXROPZf6TyG1Hb55xaz8rQNiJvDbHR9zEA4/jaRQRkzCvx+Kx0/8s4syxXRb4Z4qmcbK3vjSLuWVuDHnKEHuSjoOO/qHkOCYBmqDQRBSGYyXwotImkB5Nnu8dRackABiQkOBPkBjLRNDIlmr10MwuVQ+9VQ7X28ZGmGekXE4CZB7vP1noea65TfvQbCKXzIW49AAAAAElFTkSuQmCC"</span></code></pre>

I z tego powstaje nam:

<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTOujLOXn7z8oFmVVU21cWZSJkKRrGMTEz39PEFs7G7GFQ3VtgNPQ2NbT2nZzjXFhU5aZp4Ftno8AAAAPdFJOUwD8/fyAVSX+/v645MBXnxS2UhAAAAC4SURBVCjPdZJBkgQhCARFVEC6Ff//2WE9LrRHM6pMCEsZ7xolP/3htd53pOgw11pXROPZf6TyG1Hb55xaz8rQNiJvDbHR9zEA4/jaRQRkzCvx+Kx0/8s4syxXRb4Z4qmcbK3vjSLuWVuDHnKEHuSjoOO/qHkOCYBmqDQRBSGYyXwotImkB5Nnu8dRackABiQkOBPkBjLRNDIlmr10MwuVQ+9VQ7X28ZGmGekXE4CZB7vP1noea65TfvQbCKXzIW49AAAAAElFTkSuQmCC"/>

Sprawdź source tego obrazka (prawy przycisk myszy i zbadaj). Wstawiłem go właśnie w ten sposób.

Niestety, tekst opisujący ten obrazek waży więcej niż sam obrazek. No ale jest to wymóg konkursu - wszystko musi być w jednym pliku html. Nie można podawać zewnętrznych źródeł.

Mimo minifikacji, nie udało się zmieścić zmieścić obecną grę w 20KB, więc zacząłem szukać innego rozwiązania. I tu z pomocą przyszedł [packer](http://dean.edwards.name/packer/). Dzięki niemu spadło kilka KB, a kod wyglądał mniej więcej tak:

{% highlight javascript %}

<script>eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('!q(t){q e(i){1c(a[i])D a[i].1n;Y s=a[i]={i,l:!1,1n:{}};D t[i].35(s.1n,s,s.1n,e),s.l=!0,s.1n}Y a={};e.m=t,e.c=a,e.d=q(t,a,i){e.o(t,a)||1S.3n(t,a,{8X:!1,8W:!0,8V:i})},e.n=q(t){Y a=t&&t.48?q(){D t.33}:q(){D t};D e.d(a,"a",a),a},e.o=q(t,e){D 1S.8R.8Q.35(t,e)},e.p="",e(e.s=0)}([q(t,e,a){"R W";q i(t){k=t,(p=1e l.a).3U(t),m.a.3Y("8O "+t),x=p.49(),C=1e u.a,(v=1e c.a).17=30/(E/1.2*2)+10,8M.8L(v.17),y.a.2c(v,C),B=[],M&&m.a.46(32*p.1u.x+16,32*p.1u.y+16),V(r,34)}q s(t){p.2X(t.x,t.y),V(()=>{1q(F e=0;e<B.1k;e++)B[e].2I===t.2I&&B.2W(e,1)},1t)}q r(){y.a.2c(v,C),p.1s(v),q(){q t(t){F e=P[(1e t).1v+"s"];L a=e*=G.8G(G.1V(E,p.2e));1q(F e=0;e<a;e++){F e=p.2A();L a=1e t(32*e.x,32*e.y);B.1y(a),p.1s(a)}}t(h.a),t(A.a),t(w.a)}(),T.2G(B),b.36(),C.3a(o),m.a.1J(v)}q n(){m.a.3c(),m.a.3d(p,x),m.a.1h(32*p.1u.x+16,32*p.1u.y+16,16,"8F"),m.a.3u(B),m.a.1J(v),b.3v(x,v),m.a.3A(v),y.a.2c(v,C)}q o(){v.x===32*p.1u.x&&v.y===32*p.1u.y&&i(p.2e+1),v.1g=3,v.1b=3,v.1j<10&&v.1j++,T.2G(B),T.27(v),V(()=>T.27(v),3P),V(()=>{T.27(v),B.1d(t=>{t.1b=1,t.23=!1})},8C),v.17<=0&&(V(()=>v.I=3,1t),V(()=>v.I=4,3P),V(()=>{8B("42 8A 8z. 8y 8x."),1A.8w.8v()},1N))}1S.3n(e,"48",{8u:!0}),a.d(e,"2K",q(){D s}),a.d(e,"J",q(){D p}),a.d(e,"z",q(){D v});Y l=a(6),c=a(5),h=a(8),A=a(9),d=a(10),m=a(2),u=a(11),f=a(12),y=a(15),g=a(3),w=a(16);F p,x,C,v,B,k,E=1.2,M=!0;L T=1e d.a,b=1e f.a,P={8t:3,8s:3,"3k 8r":3};1A.8p=(t=>{E=1.2*t/2,U.8o(".8n").1f.2Q="3w",i(1),g.a.3y(n)}),1A.8m=((t,e)=>{v.1K=t,U.8j(".1K").1d(t=>{t.1f.3D="3E 3F #8i"}),e.1f.3D="3E 3F #1L"}),1A.8h=q(){i(k)},U.1F("3M",t=>{L e=t.3O;v.1g>0&&q(t){37===t||65===t?v.1p():39===t||68===t?v.1o():38===t||87===t?v.1G():40!==t&&83!==t||v.1B()}(e)}),U.1F("3M",t=>{L e=t.3O;13!==e&&70!==e||C.45()})},q(t,e,a){"R W";Y i=a(2),s=a(0),r=a(3);F n=0;e.a=X{1r(){j.2I=n++,j.1g=1,j.1b=1,j.I=1,j.2n=!1,j.2o=10}1G(){s.J.2r(j)||(j.1P(),j.y-=32,j.1Q())}1B(){s.J.2x(j)||(j.1P(),j.y+=32,j.1Q())}1p(){s.J.1E(j)||(j.1P(),j.x-=32,j.I=-1,j.1Q())}1o(){s.J.1C(j)||(j.1P(),j.x+=32,j.I=1,j.1Q())}1Q(){j.2n=!0,s.J.1s(j),i.a.1J(j),V(()=>j.2n=!1,4R),j.1g--}1P(){j.Q=j.y,j.O=j.x}4P(){j.x=j.O,j.y=j.Q}1x(t){j.17-=t,r.a.1l(()=>i.a.2F(j.O+16,j.Q+16),1t),V(i.a.3e,1t)}}},q(t,e,a){"R W";q i(t){L e=1e 4N;D e.4M=t,e}Y s=a(4),r=a(3),n=a(7),o=a.n(n);L l=U.1H("3h"),c=l.4L("2d"),h=32,A={4J:11,4I:5,4H:7,"4G 4D":15,3o:3,3p:4,3q:1,3r:2};F d=[];X m{H 3c(){c.4C(0,0,l.1D,l.2i)}H 2j(t,e,a){c.2j(i(o.a),A[t]*h-h,0,h,h,e,a,h,h)}H 1J(t){t.O!==t.x?t.O>t.x?t.O-=1:t.O+=1:t.Q!==t.y&&(t.Q>t.y?t.Q-=1:t.Q+=1),t.2o>10&&!0===t.2n?(-1===t.I||-2===t.I?-1===t.I?t.I=-2:t.I=-1:1!==t.I&&2!==t.I||(1===t.I?t.I=2:t.I=1),t.2o=0):t.2o++,c.3x();F e=t.O,a=t.Q;-3===t.I?(c.2B(1,-1),a=-a-h):t.I<0?(c.2B(-1,1),e=-e-h):c.2B(1,1),c.2j(i(o.a),A[t.1v.4B()]*h-h+G.2D(t.I)*h-h,0,h,h,e,a,h,h),c.3B()}H 3u(t){t.1d(t=>{m.1J(t),t.23&&m.1W(t.x,t.y+h,t.x+h,t.y+h,"#1L",5)})}H 3d(t,e){t.2l.1d(a=>{m.2j(t.2m[e[a.y][a.x]-1],a.x*h,a.y*h)})}H 3A(t){c.3x(),c.1X(),c.1Y=1N,c.2p="2q(0,0,0,.96)",c.4A="4y(3J)",c.3K(t.O+16,t.Q+16,34,0,2*G.3L),c.2J(),c.3B()}H 1W(t,e,a,i,s,r=2){c.1X(),c.3N(t,e),c.4x(a,i),c.1Y=r,c.2p=s,c.2J(),c.2s()}H 1h(t,e,a,i,s=2){c.1X(),c.3K(t,e,a,0,2*G.3L),c.1Y=s,c.2p=i,c.2J(),c.2s()}H 2M(t,e){F a=0;r.a.1l(()=>{c.1X(),c.22="2q(4r, 4q, 4p, 0.86)",c.3N(26+t,11+e),c.3W(6+t,12+e,28+t,37+e,21+t,29+e),c.3W(20+t,28+e,-7+t,8+e,25+t-a++,9+e),c.2S(),c.2s()},50)}H 43(t,e,a,i){F s=0;r.a.1l(()=>{c.1Y=2;F r=t.I<0?6:24;m.1W(t.x+r,t.y+3,e+16,a+16,i),c.2p=i,m.1h(e+16,a+16,6+s,i),m.1h(e+16,a+16,4+s/2,i),m.2F(e+16,a+16),s+=.5},6L)}H 
//i jeszcze hoho...

{% endhighlight %}

Mimo TAKIEJ kompresji nadal nie udało się tego zmieścić poniżej 20KB. Znalazłem trochę pełnych nazw metod, pól czy selektorów w kodzie, dlatego ręcznie pozmieniałem ich nazwy na 1-3 literowe. Dopiero wtedy udało mi się zejść idealnie na 20480 bajtów, czyli na styk. Choćby jeden bajt więcej i bym sie nie załapał. Jednak nie obyło się bez błedów. Pradopodobnie przez to, że ręcznie pozmieniałem kilka wartości pojawiło się kilka bugów, które ludzie wyłapali i są obecnie w wersji, która podlega ocenie. Projekt oddałem prawie o 3 w nocy, w dzień, który był deadlinem, więc już nie miałem czasu tego naprawiać.

Mimo wszystko jestem zadowolony z rezultatów. 

# Głosowanie

Do 28.01.2018r trwa głosowanie, więc byłbym wdzięczny jeśli zostawiłbyś/zostawiłabyś swój głos ;)

Głosowanie społeczności odbywa się poprzez like-i pod video na YouTube - [link](https://youtu.be/3Nbu50KgFbw)

PS: Nie sugerujcie się tylko i wyłącznie tym video, bo jest takie sobie. Nie ja robiłem. Myślę, że gdybym sam je robił, udałoby mi się ją przedstawić w nieco lepszym świetle.