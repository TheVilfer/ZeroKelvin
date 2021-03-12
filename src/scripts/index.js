
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
  if (localStorage.getItem('cart') == null) localStorage.setItem('cart', JSON.stringify({}));
  const productBtn = document.querySelectorAll('.item__cart__test');
  productBtn.forEach(el => {
    el.addEventListener('click', (e) =>{
      let self = e.currentTarget;
      let parent = self.closest('.catalog__item');
      let id = parent.dataset.id;
      addStorage('cart',id);
    }); 
  });
});

const addStorage = (storage,id) =>{
  let items = JSON.parse(localStorage.getItem(storage));
  if (isNaN(items[id])) items[id] = 0;
  items[id] += 1;
  localStorage.setItem(storage, JSON.stringify(items));
  console.log(localStorage.cart);
  console.log(localStorage.favorite);
  }