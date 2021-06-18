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
    CartDisable();
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
    document.querySelector('.cart').insertAdjacentHTML('afterbegin', cart.detail.html);
    UpdateTotalPrice();
    EnableDeleteButtons();
    CartDisable();
    document.getElementsByClassName("cart-checkout")[0].addEventListener('click', (e) => {
        window.location.href = '/order/';
    })
};
const CalculateTotalPrice = () => {
    cart.detail.totalprice = 0;
    for (const [key, value] of Object.entries(cart.products)) {
        cart.detail.totalprice += value.price * value.count;
    }
};
const CartDisable = async () => {
    if (CartIsEmpty()) {
        document.getElementsByClassName("cart-checkout")[0].disabled = true;
    }
}
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
const CartIsEmpty = () => {
    return Object.entries(cart.products).length == 0;
}


//order 
const InitOrder = async () => {
    if (CartIsEmpty()) {
        window.location.replace("https://zerokelvin.ru");
    }
    let form = document.querySelector(".order__form");
    form.onsubmit = async () => {
        let userData = await CollectUserData(new FormData(form));
        let link = await GeneratePaymentLink(userData)
        // link = link["link"]
        // link = link + "&Email=" + userData.email;
        console.log(userData)
        console.log(link);
        //window.location.replace(link);
        return false;
    }
    var inputTel = IMask(document.getElementById('phone'), {
        mask: '+{7} (000) 000-00-00'
    });
}
const GeneratePaymentLink = async (userData) => {
    let cart_temp = await GetLocalStorage('cart');
    cart_temp.detail.html = null;
    cart_temp.contact = userData;
    console.log(cart_temp)
    const url = '/.netlify/functions/dataCart';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(cart_temp)
        });
        console.log(response);
        return response.json();
    } catch (err) {
        console.error(err);
        return null
    };
}
const CollectUserData = async (form) => {
    let userData = {};
    for (let [name, value] of form) {
        userData[name] = value;
    }
    console.log(userData)
    return userData;
}