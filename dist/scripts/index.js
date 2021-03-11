
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

//cart
document.addEventListener('DOMContentLoaded', () =>{
  localStorage.setItem('storage', JSON.stringify({}));
  const productBtn = document.querySelectorAll('.item__cart__test');
  productBtn.forEach(el => {
    el.addEventListener('click', (e) =>{
      let self = e.currentTarget;
      let parent = self.closest('.catalog__item');
      let id = parent.dataset.id;
      addCart(id);
    }); 
  });
});

const addCart = (id) =>{
  localStorage.setItem('storage', JSON.stringify({id:"1"}))
  let str = JSON.parse(localStorage.storage);
  console.log(str);
  }