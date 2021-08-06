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

// //cart
// document.addEventListener('DOMContentLoaded', async () => {
//   if (localStorage.getItem('cart') == null) localStorage.setItem('cart', JSON.stringify({}));
//   const productBtn = document.querySelectorAll('.popular-item__cart');
//   if (window.location.pathname == "/cart/") {
//     await updateCart();
//     deleteElement();
//   };
//   productBtn.forEach(el => {
//     el.addEventListener('click', (e) => {
//       let self = e.currentTarget;
//       let parent = self.closest('.catalog-item');
//       let id = parent.dataset.id;
//       addStorage('cart', id);
//     });
//   });
// });

// const addStorage = (storage, id) => {
//   let items = JSON.parse(localStorage.getItem(storage));
//   if (isNaN(items[id])) items[id] = 0;
//   items[id] += 1;
//   localStorage.setItem(storage, JSON.stringify(items));
//   console.log(localStorage.cart);
//   // console.log(localStorage.favorite);
// };
// const updateCart = async () => {

//   const cart = Object.entries(JSON.parse(localStorage.getItem("cart")));
//   const amoutPrice = await getAmoutPrice(cart);
//   console.log(amoutPrice);
// }
// const sendRequestCart = async (id) => {
//   const url = '/.netlify/functions/dataCart';
//   const item = {
//     id: id
//   };
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json;charset=utf-8'
//       },
//       body: JSON.stringify(item)
//     });
//     return response.json();
//   } catch (err) {
//     console.error(err);
//     return null
//   };
// };
// const getAmoutPrice = async (cart) => {
//   let cartElement = document.querySelector('.cart');
//   let total = 0;
//   let renderElements = "";
//   for (const el of cart) {
//     let item = await sendRequestCart(el[0]);
//     renderElements += GenerateCartElement(item[0], el[1]);
//     total += item[0].price * el[1];
//   }
//   cartElement.insertAdjacentHTML('afterbegin', renderElements);
//   return total;
// };
// const GenerateCartElement = (item, count) => {
//   return `<li class="cart-element" data-id="${item._id}">
//             <span class="cart-element__count">${count}x</span>
//             <img class="cart-element__image" src="/images/products/${item._id}.jpg" alt="">
//             <span class="cart-element__name">${item.name}</span>
//             <span class="cart-element__price">${item.price} руб</span>
//             <button class="cart-element__delete">Удалить</button>
//         </li>`;
// };
// const deleteElement = async () => {
//   const deleteBtn = document.querySelectorAll('.cart-element__delete')
//   console.log(deleteBtn)
//   deleteBtn.forEach(el => {
//     el.addEventListener('click', (e) => {
//       const cart = JSON.parse(localStorage.getItem("cart"));
//       let self = e.currentTarget;
//       let parent = self.closest('.cart-element');
//       let id = parent.dataset.id;
//       delete cart[id];
//       parent.remove();
//       localStorage.setItem('cart', JSON.stringify(cart));
//     });
//   });
// };
