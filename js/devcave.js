// Tooltip Init
$(() => {
  $("[data-toggle='tooltip']").tooltip();
});

// make all images responsive
$(() => {
  $('img').addClass('img-responsive center-block');
});

// responsive tables
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
