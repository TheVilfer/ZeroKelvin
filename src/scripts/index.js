const mySwiper = new Swiper(".swiper-banner", {
  speed: 400,
  spaceBetween: 30,
  loop: true,
  grabCursor: true,
  keyboard: {
    enabled: true,
    onlyInViewport: true,
  },
  mousewheel: {
    forceToAxis: true,
    invert: false,
  },
});

// const collectionsSwiper = new Swiper('.swiper-collections', {
//   slidesPerView: 'auto',
//   spaceBetween: 30,
//   centeredSlides: true,
//   loop: true,
// });

const catalogSwiper = new Swiper(".swiper-popular", {
  slidesPerView: "auto",
  spaceBetween: 30,
  centeredSlides: true,
  grabCursor: true,
  loop: true,
  keyboard: {
    enabled: true,
    onlyInViewport: true,
  },
  mousewheel: {
    forceToAxis: true,
    invert: false,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

var swiper = new Swiper(".product__slider", {
  slidesPerView: 1,
  spaceBetween: 10,
  loop: true,
  autoHeight: true,
  grabCursor: true,
  keyboard: {
    enabled: true,
    onlyInViewport: true,
  },
  zoom: {
    maxRatio: 2,
    toggle: true,
  },
  mousewheel: {
    invert: false,
    forceToAxis: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});
