
if (JSON.parse(localStorage.getItem('dark-mode'))) {
  document.body.classList.add('dark-mode');
}

document.querySelector('.dark-mode-btn').addEventListener('click', (e) => {
  const darkMode = document.body.classList.toggle('dark-mode');
  e.target.blur();
  localStorage.setItem('dark-mode', darkMode);
});

// Tooltip Init
$(() => {
  $("[data-toggle='tooltip']").tooltip();
});

$(() => {
  $('img').addClass('img-responsive center-block');
});

$(document).ready(() => {
  $('table').wrap("<div class='table-responsive'></div>");
  $('table').addClass('table');
});

// Navigation Scripts to Show Header on Scroll-Up
jQuery(document).ready(($) => {
  const MQL = 1170;

  // primary navigation slide-in effect
  if ($(window).width() > MQL) {
    const headerHeight = $('.navbar-custom').height();
    $(window).on('scroll', {
      previousTop: 0,
    },
    function () {
      const currentTop = $(window).scrollTop();
      // check if user is scrolling up
      if (currentTop < this.previousTop) {
        // if scrolling up...
        if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
          $('.navbar-custom').addClass('is-visible');
        } else {
          $('.navbar-custom').removeClass('is-visible is-fixed');
        }
      } else {
        // if scrolling down...
        $('.navbar-custom').removeClass('is-visible');
        if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) $('.navbar-custom').addClass('is-fixed');
      }
      this.previousTop = currentTop;
    });
  }
});
