import 'bootstrap.native/dist/bootstrap-native-v4';
import '../node_modules/waypoints/lib/noframework.waypoints.min';
import '../font/fontello.eot';
import '../font/fontello.svg';
import '../font/fontello.ttf';
import '../font/fontello.woff';
import '../font/fontello.woff2';

require('../css/devcave.scss');

if (JSON.parse(localStorage.getItem('dark-mode'))) {
  document.body.classList.add('dark-mode');
}

document.querySelector('.dark-mode-btn').addEventListener('click', (e) => {
  const darkMode = document.body.classList.toggle('dark-mode');
  e.target.blur();
  try {
    DISQUS.reset({ reload: true });
  } catch (e) {}
  localStorage.setItem('dark-mode', darkMode);
});

let previousTop = 0;

const navbarCustom = document.querySelector('.navbar-custom');
const toggleBtn = document.getElementById('navbar-toggle-btn');
const siteNav = document.getElementById('site-nav');

function dynamicNavbar() {
  const headerHeight = navbarCustom.offsetHeight;
  const currentTop = window.scrollY;
  if (currentTop < previousTop) {
    if (currentTop > 0 && navbarCustom.classList.contains('is-fixed')) {
      navbarCustom.classList.add('is-visible');
    } else {
      navbarCustom.classList.remove('is-visible', 'is-fixed');
    }
  } else {
    navbarCustom.classList.remove('is-visible');

    if (siteNav.classList.contains('show')) {
      toggleBtn.Collapse.hide();
    }

    if (currentTop > headerHeight && !navbarCustom.classList.contains('is-fixed')) {
      navbarCustom.classList.add('is-fixed');
    }
  }
  previousTop = currentTop;
}
window.addEventListener('scroll', dynamicNavbar);

document.querySelectorAll('.helion-ksiazkasm4 a:first-of-type').forEach((link) => {
  link.innerText = 'Kup na helion.pl';
});

document.querySelectorAll('.helion-ksiazkasm4 a').forEach((link) => {
  link.classList.add('main-btn');
});

const gifs = document.querySelectorAll('.gif');
gifs.forEach((gif) => {
  new Waypoint({
    element: gif,
    handler() {
      gif.src = gif.src.replace('png', 'gif');
      this.destroy();
    },
    offset: '40%',
  });
});
