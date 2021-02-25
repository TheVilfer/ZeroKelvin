
var mySwiper = new Swiper('.swiper-banner', {
    speed: 400,
    spaceBetween: 100,
    loop: true,
    keyboard: {
      enabled: true,
    },
});

var collectionsSwiper = new Swiper('.swiper-collections', {
  slidesPerView: 'auto',
  spaceBetween: 30,
  centeredSlides: true,
  loop:true,
  keyboard: {
    enabled: true,
  },
});

var catalogSwiper = new Swiper('.swiper-catalog', {
  slidesPerView: 'auto',
  spaceBetween: 30,
  centeredSlides: true,
  loop:true,
  keyboard: {
    enabled: true,
  },
});
