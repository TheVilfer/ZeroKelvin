const cart_version = "0.1";
let delivery = 0;
let delivery_text = "";
let delivery_warning =
  "к сожалению мы не можем раcсчитать стоимость доставки для вас.";
let cart = {
  products: {},
  detail: {
    totalprice: 0,
    html: "",
    promocode: "",
  },
};
document.addEventListener("DOMContentLoaded", async () => {
  Cart();
});
const Cart = async () => {
  if ((await GetLocalStorage("cart")) == null) SetLocalStorage("cart", cart);
  else cart = await GetLocalStorage("cart");
  if (window.location.pathname == "/order/") {
    InitOrder();
  }
  if (window.location.pathname == "/cart/") {
    InitCart();
  }
  if (window.location.pathname == "/success/") {
    cart = null;
    SetLocalStorage("cart", cart);
  } else {
    EnableAllAddToCart();
  }
};
const GetLocalStorage = async (storage) => {
  if (localStorage.getItem(storage) == "undefined") return null;
  return JSON.parse(localStorage.getItem(storage));
};
const SetLocalStorage = async (storage, value) => {
  localStorage.setItem(storage, JSON.stringify(value));
};
const EnableAllAddToCart = () => {
  const productBtn = document.querySelectorAll(".cart__add");
  productBtn.forEach((el) => {
    el.addEventListener("click", (e) => {
      let self = e.currentTarget;
      let parent = self.closest(".cart__item");
      let name = parent.querySelector(".cart__name").innerHTML;
      let price = parent.querySelector(".cart__price").innerHTML.split(" ")[0];
      let type = parent.querySelector(".cart__type").innerHTML;
      let img = parent.querySelector(".cart__image").getAttribute("src");
      let id = parent.dataset.id;
      AddToCart(id, name, price, type, img);
      el.classList.add("cart__add-success");
      el.innerHTML = "Добавлено в корзину!";
      setTimeout(() => {
        el.classList.remove("cart__add-success");
        el.innerHTML = "Добавить в корзину";
      }, 2000);
    });
  });
};
const DeliveryRender = async () => {
  let NodeText = document.querySelector(".cart-delivey__price");
  if (Number.isInteger(delivery)) {
    delivery_text = delivery + " руб";
    NodeText.classList.remove("text--warning");
  } else {
    delivery_text = delivery_warning;
    NodeText.classList.add("text--warning");
  }
  NodeText.innerHTML = delivery_text;
};
const EnableInputs = () => {
  const inputs = document.querySelectorAll(".cart-element__count__value");
  inputs.forEach((el) => {
    el.addEventListener("change", async (e) => {
      let self = e.currentTarget;
      let parent = self.closest(".cart-element");
      let id = parent.dataset.id;
      if (el.value < 1) {
        DeleteElement(id, parent);
        return null;
      }
      await SetCountItem(id, el.value);
      isCartAvailable();
    });
  });
};
const SetCountItem = async (id, count) => {
  cart.products[id].count = count;
  delivery = GetAmoutDelivery();
  await DeliveryRender();
  CalculateTotalPrice();
  await UpdateTotalPrice();
  HtmlRender();
  isCartAvailable();
  await SetLocalStorage("cart", cart);
};
const DeleteElement = async (id, el) => {
  el.remove();
  delete cart.products[id];
  delivery = GetAmoutDelivery();
  await DeliveryRender();
  CalculateTotalPrice();
  await UpdateTotalPrice();
  HtmlRender();
  isCartAvailable();
  SetLocalStorage("cart", cart);
};
const UpdateTotalPrice = async () => {
  let totalPrice = cart.detail.totalprice;
  if (Number.isInteger(delivery)) totalPrice += delivery;
  document.querySelector(".cart-total__price").innerHTML = totalPrice;
};
const AddToCart = (id, name, price, type, img) => {
  if (cart.products[id] == undefined) {
    cart.products[id] = {
      id: id,
      name: name,
      type: type,
      price: parseInt(price),
      count: 1,
      img: img,
      description: "",
    };
  } else {
    cart.products[id].count = parseInt(cart.products[id].count) + 1;
  }
  CalculateTotalPrice();
  SetLocalStorage("cart", cart);
  console.log(localStorage.cart);
};
const InitCart = async () => {
  cart = await GetLocalStorage("cart");
  HtmlRender();
  document
    .querySelector(".cart")
    .insertAdjacentHTML("afterbegin", cart.detail.html);
  EnableInputs();
  delivery = GetAmoutDelivery();
  await DeliveryRender();
  if (cart.detail.promocode == "" || cart.detail.promocode == undefined) {
    CalculateTotalPrice();
    await UpdateTotalPrice();
  } else {
    await CheckPromocode(false);
  }
  isCartAvailable();
};
const CheckPromocode = async (click) => {
  let info = document.querySelector(".promocode__info");
  let inputPromo = "";
  if (click) {
    inputPromo = document.querySelector(".promocode__input").value;
    if (inputPromo == "") {
      cart.detail.promocode = "";
      CalculateTotalPrice();
      await UpdateTotalPrice();
      await SetLocalStorage("cart", cart);
      info.innerHTML = "Промокод успешно удалён";
      return 0;
    }
  } else {
    inputPromo = cart.detail.promocode;
    console.log(inputPromo);
  }
  info.innerHTML = "Ищем промокод по нашим базам...";
  let resp = await (
    await fetch("/.netlify/functions/promocode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        cart: cart.products,
        promo: inputPromo,
      }),
    })
  ).json();
  console.log(resp);
  if (resp.status == "error") {
    info.innerHTML = "Промокод не найден";
    return 0;
  }
  info.innerHTML = "Промокод применён";
  cart.detail.promocode = inputPromo;
  cart.detail.totalprice = resp.totalprice;
  await UpdateTotalPrice();
  await SetLocalStorage("cart", cart);
};
const GetAmoutDelivery = () => {
  let local_shopper = 0;
  let local_stickers = 0;
  let local_cards = 0;
  let local_kits = 0;
  let local_pin = 0;
  let local_boxs = 0;
  for (const [key, value] of Object.entries(cart.products)) {
    if (value.type == "СТИКЕРЫ") {
      local_stickers += 1 * value.count;
      continue;
    }
    if (value.type == "ШОППЕРЫ") {
      local_shopper += 1 * value.count;
      continue;
    }
    if (value.type == "ЗНАЧКИ") {
      local_pin += 1 * value.count;
      continue;
    }
    if (value.type == "АКЦИИ") {
      local_kits += 1 * value.count;
      continue;
    }
    if (value.type == "ОТКРЫТКИ") {
      local_cards += 1 * value.count;
      continue;
    }
    if (value.type == "БОКСЫ") {
      local_boxs += 1 * value.count;
      continue;
    }
  }
  if (local_shopper > 2) {
    return delivery_warning;
  }
  if (local_shopper > 0 || local_boxs > 0) {
    return 350;
  }
  if (local_pin > 0 || local_stickers > 19) {
    return 250;
  }
  if (local_stickers > 0 || local_cards > 0 || local_kits > 0) {
    return 120;
  }
  return delivery_warning;
};
const EnableSubmit = async () => {
  let form = document.querySelector(".cart__form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await SetLocalStorage("cart", cart);
    window.location.replace("/order/");
  });
};
const isCartAvailable = () => {
  if (cart.detail.totalprice - delivery < 250) {
    document.querySelector(".cart-checkout").innerHTML =
      "Минимальная сумма товаров для заказа - 350 руб.";
    document.querySelector(".cart-checkout").disabled = true;
  } else {
    EnableSubmit();
    document.querySelector(".cart-checkout").disabled = false;
    document.querySelector(".cart-checkout").innerHTML = "Оформить заказ";
  }
};

const CalculateTotalPrice = () => {
  cart.detail.totalprice = 0;
  for (const [key, value] of Object.entries(cart.products)) {
    cart.detail.totalprice += value.price * value.count;
  }
};
const CartDisable = async () => {
  if (CartIsEmpty()) {
    document.querySelector(".cart-checkout").disabled = true;
  }
};
const HtmlRender = () => {
  cart.detail.html = "";
  for (const [key, value] of Object.entries(cart.products)) {
    cart.detail.html += `<li class="cart-element" data-id="${value.id}">
            <img class="cart-element__image" src="${value.img}" alt="${value.name}">
            <span class = "cart-element__type">${value.type}</span>
            <span class = "cart-element__name">${value.name}</span>
            <span class = "cart-element__price">${value.price} руб.</span>
            <div class = "cart-element__count"> <button class="cart-element__count__plus">+</button> <input class="cart-element__count__value" type="number" value="${value.count}"/> <button class="cart-element__count__minus">-</button> шт.</div>
        </li>`;
  }
  SetLocalStorage("cart", cart);
};
const CartIsEmpty = () => {
  return Object.entries(cart.products).length == 0;
};

//order
const InitOrder = async () => {
  if (CartIsEmpty()) {
    window.location.replace("https://zerokelvin.ru");
  }
  let form = document.querySelector(".order__form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    document.querySelector(".order__submit").disabled = true;
    document.querySelector(".order__submit").innerHTML =
      "Всего несколько секунд...";
    let userData = await CollectUserData(new FormData(form));
    let link = "";
    try {
      link = await GeneratePaymentLink(userData);
    } catch (error) {
      link = await GeneratePaymentLink(userData);
    }
    link = link["link"];
    link = link + "&Email=" + userData.email;
    console.log(userData);
    console.log(link);
    window.location.replace(link);
  });
  var inputTel = IMask(document.getElementById("phone"), {
    mask: "+{7} (000) 000-00-00",
  });
};
const GeneratePaymentLink = async (userData) => {
  let cart_temp = await GetLocalStorage("cart");
  cart_temp.detail.html = null;
  cart_temp.contact = userData;
  const response = await fetch("/.netlify/functions/dataCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(cart_temp),
  });
  console.error(response);
  return response.json();
};
const CollectUserData = async (form) => {
  let userData = {};
  for (let [name, value] of form) {
    userData[name] = value;
  }
  console.log(userData);
  return userData;
};
const ClearLocalStorage = async (storage) => {
  localStorage.removeItem(storage);
};
