const productsContainer = document.getElementById('products');
let products = [];
window.addEventListener('storage', updateCartCount);
window.addEventListener('load', updateCartCount);

async function loadProducts() {
  const res = await fetch('https://fakestoreapi.com/products');
  products = await res.json();
  renderProducts(products);
}

function renderProducts(products) {
  productsContainer.innerHTML = products
    .map((p) => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const cartItem = cart.find((item) => item.id === p.id);
      const qty = cartItem ? cartItem.quantity || 1 : 0;

      return `
      <div class="product-card" id="product-${p.id}">
        <div class="product-img">
          <img src="${p.image}" alt="${p.title}">
          <div class="product-category">${p.category}</div>
        </div>
        <h3 class="product-title">${p.title}</h3>
        <p class="product-price">$${p.price}</p>
        <div class="product-bottom">
          <span class="product-rating">
            <i class="fa-solid fa-star" style="color: #FFD43B;"></i> ${p.rating.rate} (${
        p.rating.count
      })
          </span>
          <div class="counter-wrapper" data-id="${p.id}">
            ${
              qty > 0
                ? `
              <div class="quantity-counter">
                <button class="quantity-btn dec-btn">-</button>
                <span class="quantity-value">${qty}</span>
                <button class="quantity-btn inc-btn">+</button>
              </div>
            `
                : `<button class="add-btn" onclick="addToCart(${p.id})">Add to cart</button>`
            }
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

window.addToCart = function (id) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const product = products.find((p) => p.id === id);
  const existing = cart.find((p) => p.id === id);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    product.quantity = 1;
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  window.dispatchEvent(new Event('storage'));

  replaceAddButtonWithCounter(id, existing ? existing.quantity : 1);
};

function replaceAddButtonWithCounter(id, quantity) {
  const wrapper = document.querySelector(`.counter-wrapper[data-id="${id}"]`);
  if (!wrapper) return;

  wrapper.innerHTML = `
    <div class="quantity-counter">
      <button class="quantity-btn dec-btn">-</button>
      <span class="quantity-value">${quantity}</span>
      <button class="quantity-btn inc-btn">+</button>
    </div>
  `;

  wrapper.querySelector('.dec-btn').addEventListener('click', () => changeQuantity(id, -1));
  wrapper.querySelector('.inc-btn').addEventListener('click', () => changeQuantity(id, 1));
}

function changeQuantity(id, delta) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const itemIndex = cart.findIndex((i) => i.id === id);

  if (itemIndex === -1) return;

  let currentQty = cart[itemIndex].quantity || 1;
  let newQty = currentQty + delta;

  if (newQty <= 0) {
    cart.splice(itemIndex, 1);

    const wrapper = document.querySelector(`.counter-wrapper[data-id="${id}"]`);
    if (wrapper) {
      wrapper.innerHTML = `<button class="add-btn" onclick="addToCart(${id})">Add to cart</button>`;
    }
  } else {
    cart[itemIndex].quantity = newQty;

    const valueEl = document.querySelector(`.counter-wrapper[data-id="${id}"] .quantity-value`);
    if (valueEl) {
      valueEl.textContent = newQty;
    }
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  window.dispatchEvent(new Event('storage'));
}

window.addToCart = function (id) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const product = products.find((p) => p.id === id);
  const existing = cart.find((p) => p.id === id);

  let newQty;

  if (existing) {
    existing.quantity += 1;
    newQty = existing.quantity;
  } else {
    const newItem = { ...product, quantity: 1 };
    cart.push(newItem);
    newQty = 1;
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  window.dispatchEvent(new Event('storage'));

  replaceAddButtonWithCounter(id, newQty);
};

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalCount = cart.length;

  const countEl = document.getElementById('count');
  if (countEl) {
    countEl.textContent = totalCount;
  }
}

loadProducts();
updateCartCount();

function syncAllCounters() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  document.querySelectorAll('.counter-wrapper').forEach((wrapper) => {
    const id = Number(wrapper.dataset.id);
    const cartItem = cart.find((item) => item.id === id);
    const qty = cartItem ? cartItem.quantity : 0;

    if (qty > 0) {
      const valueEl = wrapper.querySelector('.quantity-value');
      if (valueEl) {
        valueEl.textContent = qty;
      }
    } else {
      wrapper.innerHTML = `<button class="add-btn" onclick="addToCart(${id})">Add to cart</button>`;
    }
  });
}

window.addEventListener('storage', () => {
  updateCartCount();
  syncAllCounters();
});

window.addEventListener('load', () => {
  updateCartCount();
  syncAllCounters();
});
