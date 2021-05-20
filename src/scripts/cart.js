let cart = {
    "products": {},
    "detail": {
        "totalprice": 0,
        "html": "",
    },
};
document.addEventListener('DOMContentLoaded', async () => {
    Cart();
});
const Cart = async () => {
    if (await GetLocalStorage('cart') == null)
        SetLocalStorage('cart', cart)
    else
        cart = await GetLocalStorage('cart');
    if (window.location.pathname == "/order/") {
        InitOrder();
    }
    if (window.location.pathname == "/cart/") {
        InitCart();
    } else {
        EnableAllAddToCart();
    };
};
const GetLocalStorage = async (storage) => {
    if (localStorage.getItem(storage) == "undefined")
        return null
    return JSON.parse(localStorage.getItem(storage));
};
const SetLocalStorage = async (storage, value) => {
    localStorage.setItem(storage, JSON.stringify(value))
};
const EnableAllAddToCart = () => {
    const productBtn = document.querySelectorAll('.cart__add');
    productBtn.forEach(el => {
        el.addEventListener('click', (e) => {
            let self = e.currentTarget;
            let parent = self.closest('.cart__item');
            let name = parent.querySelector('.cart__name').innerHTML;
            let price = parent.querySelector('.cart__price').innerHTML.split(' ')[0];
            let id = parent.dataset.id;
            AddToCart(id, name, price);
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
    delete cart.products[id];
    await CalculateTotalPrice();
    UpdateTotalPrice();
    HtmlRender();
    SetLocalStorage('cart', cart);
};
const UpdateTotalPrice = async () => {
    document.querySelector('.cart-total__price').innerHTML = cart.detail.totalprice;
}
const AddToCart = (id, name, price) => {
    if (cart.products[id] == undefined) {
        cart.products[id] = {
            "id": id,
            "name": name,
            "type": '',
            "price": price,
            "count": 1,
            "description": '',
        };
    } else {
        cart.products[id].count += 1
    }
    CalculateTotalPrice();
    HtmlRender();
    SetLocalStorage('cart', cart);
    console.log(localStorage.cart);
};
const InitCart = async () => {
    cart = await GetLocalStorage('cart');
    document.querySelector('.cart').insertAdjacentHTML('afterbegin', cart.detail.html);
    UpdateTotalPrice();
    EnableDeleteButtons();
};
const CalculateTotalPrice = () => {
    cart.detail.totalprice = 0;
    for (const [key, value] of Object.entries(cart.products)) {
        cart.detail.totalprice += value.price * value.count
    }
};
const HtmlRender = () => {
    cart.detail.html = '';
    for (const [key, value] of Object.entries(cart.products)) {
        cart.detail.html +=
            `<li class="cart-element" data-id="${value.id}">
            <span class="cart-element__count">${value.count}x</span>
            <img class = "cart-element__image" src = "/images/products/${value.id}.jpg" alt = "">
            <span class = "cart-element__name">${value.name}</span>
            <span class = "cart-element__price">${value.price}руб</span>
            <button class="cart-element__delete">Удалить</button>
        </li>`;
    }

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
//order
const InitOrder = async () => {
    if (CartIsEmpty()) {
        window.location.replace("https://zerokelvin.ru");
    }
    var inputTel = IMask(document.getElementById('phone'), {
        mask: '+{7}(000) 000-00-00'
    });
}