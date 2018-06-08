import 'bootstrap.native';

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

    if (siteNav.classList.contains('in')) {
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
