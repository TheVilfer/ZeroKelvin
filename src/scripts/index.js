const mySwiper = new Swiper('.swiper-banner', {
  speed: 400,
  spaceBetween: 100,
  loop: true,
  keyboard: {
    enabled: true,
  },
});

const collectionsSwiper = new Swiper('.swiper-collections', {
  slidesPerView: 'auto',
  spaceBetween: 30,
  centeredSlides: true,
  loop: true,
});

const catalogSwiper = new Swiper('.swiper-popular', {
  slidesPerView: 'auto',
  spaceBetween: 30,
  centeredSlides: true,
  loop: true,
  loopedSlides: 3,
  loopAdditionalSlides: 3,
  keyboard: {
    enabled: true,
    onlyInViewport: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

//cart
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('cart') == null) localStorage.setItem('cart', JSON.stringify({}));
  const productBtn = document.querySelectorAll('.popular-item__cart');
  if (window.location.pathname == "/cart/") {
    updateCart();

  };
  productBtn.forEach(el => {
    el.addEventListener('click', (e) => {
      let self = e.currentTarget;
      let parent = self.closest('.catalog-item');
      let id = parent.dataset.id;
      addStorage('cart', id);

    });
  });
});

const addStorage = (storage, id) => {
  let items = JSON.parse(localStorage.getItem(storage));
  if (isNaN(items[id])) items[id] = 0;
  items[id] += 1;
  localStorage.setItem(storage, JSON.stringify(items));
  console.log(localStorage.cart);
  console.log(localStorage.favorite);
};
const updateCart = async () => {

  const cart = Object.entries(JSON.parse(localStorage.getItem("cart")));
  const amoutPrice = await getAmoutPrice(cart);
  console.log(amoutPrice);
}
const sendRequestCart = async (id) => {
  const url = '/.netlify/functions/dataCart';
  const item = {
    id: id
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(item)
    });
    return response.json();
  } catch (err) {
    console.error(err);
    return null
  };
};
const getAmoutPrice = async (cart) => {
  total = 0
  for (const el of cart) {
    let item = await sendRequestCart(el[0]);
    // RenderCart(item[0], el[1]);
    total += item[0].price * el[1];
  }
  return total;
};
const RenderCart = (item, count) => {
  let cart = document.querySelector('.cart');
  const el = `<li class="cart-element" data-id="${item._id}">
            <span class="cart-element__count">${count}x</span>
            <img class="cart-element__image" src="/images/products/${item._id}.jpg" alt="">
            <span class="cart-element__name">${item.name}</span>
            <span class="cart-element__price">${item.price}</span>
            <button class="cart-element__delete">Удалить</button>
        </li>`;
  cart.insertAdjacentHTML('afterbegin', el);
};