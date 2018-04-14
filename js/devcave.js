
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

// Tooltip Init
$(() => {
  $("[data-toggle='tooltip']").tooltip();
});

$(() => {
  $('img').addClass('img-responsive');
});

function dynamicNavbar() {
  const navbarCustom = $('.navbar-custom');
  const headerHeight = navbarCustom.height();
  const currentTop = $(window).scrollTop();
  if (currentTop < this.previousTop) {
    if (currentTop > 0 && navbarCustom.hasClass('is-fixed')) {
      navbarCustom.addClass('is-visible');
    } else {
      navbarCustom.removeClass('is-visible is-fixed');
    }
  } else {
    navbarCustom.removeClass('is-visible');
    $('.navbar-collapse').removeClass('in');
    if (currentTop > headerHeight && !navbarCustom.hasClass('is-fixed')) navbarCustom.addClass('is-fixed');
  }
  this.previousTop = currentTop;
}

$(document).ready(($) => {
  $(window).on('scroll', {
    previousTop: 0,
  }, dynamicNavbar);
});

document.querySelectorAll('.helion-ksiazkasm4 a:first-of-type').forEach((link) => {
  link.innerText = 'Kup na helion.pl';
});

document.querySelectorAll('.helion-ksiazkasm4 a').forEach((link) => {
  link.classList.add('main-btn');
});