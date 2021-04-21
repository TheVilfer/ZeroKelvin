let cart = null;
let cartElements = null;
let listCart = null;
document.addEventListener('DOMContentLoaded', async () => {
    Cart();
});
const Cart = async () => {
    cart = await GetLocalStorage('cart');
    if (cart == null)
        cart = JSON.parse("{}")
    if (window.location.pathname == "/cart/") {
        InitCart();
    } else {
        EnableAllAddToCart();
    };
};
const GetLocalStorage = async (storage) => {
    return JSON.parse(localStorage.getItem(storage));
};
const SetLocalStorage = async (storage, value) => {
    localStorage.setItem(storage, JSON.stringify(value))
};
const EnableAllAddToCart = () => {
    const productBtn = document.querySelectorAll('.popular-item__cart');
    productBtn.forEach(el => {
        el.addEventListener('click', (e) => {
            let self = e.currentTarget;
            let parent = self.closest('.catalog-item');
            let id = parent.dataset.id;
            AddToCart(id);
        });
    });
};
const EnableDeleteButtons = () => {
    const deleteBtn = document.querySelectorAll('.cart-element__delete');
    deleteBtn.forEach(el => {
        el.addEventListener('click', (e) => {
            let self = e.currentTarget;
            let parent = self.closest('.cart-element');
            let id = parent.dataset.id;
            DeleteElement(id, parent);
        });
    });
};
const DeleteElement = async (id, el) => {
    el.remove();
    cartElements["totalprice"] -= (cartElements["items"][id].count * cartElements["items"][id].price);
    UpdateTotalPrice();
    delete cart[id];
    listCart = Object.entries(cart);
    delete cartElements["items"][id];
    SetLocalStorage('cart', cart);
};
const UpdateTotalPrice = async () => {
    document.querySelector('.cart-total__price').innerHTML = cartElements["totalprice"];
}
const AddToCart = (id) => {
    if (isNaN(cart[id] += 1))
        cart[id] = 1;
    SetLocalStorage('cart', cart);
    console.log(localStorage.cart);
};
const InitCart = async () => {
    cart = await GetLocalStorage('cart');
    listCart = await Object.entries(cart);
    cartElements = await GetCartElements();
    document.querySelector('.cart').insertAdjacentHTML('afterbegin', await CartToHtml());
    UpdateTotalPrice(0);
    EnableDeleteButtons();
};
const CartToHtml = () => {
    let result = "";
    for (const el of Object.entries(cartElements["items"])) {
        result += `<li class="cart-element" data-id="${el[1]._id}">
            <span class="cart-element__count">${el[1].count}x</span>
            <img class="cart-element__image" src="/images/products/${el[1]._id}.jpg" alt="">
            <span class="cart-element__name">${el[1].name}</span>
            <span class="cart-element__price">${el[1].price} руб</span>
            <button class="cart-element__delete">Удалить</button>
        </li>`;
    }
    return result;
}
const GetCartElements = async () => {
    let result = {};
    result["items"] = {};
    result["totalprice"] = 0;
    for (const el of listCart) {
        let elcart = (await SendRequestCart(el[0]))[0];
        elcart.count = el[1];
        result["totalprice"] += elcart.price * elcart.count;
        result["items"][elcart._id] = elcart;
    }
    return result;
}
const SendRequestCart = async (id) => {
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