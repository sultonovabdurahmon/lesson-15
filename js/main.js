// =============================================
//  ДАННЫЕ ТОВАРОВ
// =============================================
const products = [
  {
    id: 1,
    name: "Sakarias Armchair",
    category: "Chair",
    price: 392,
    image: "images/Group 3742.png",
  },
  {
    id: 2,
    name: "Baltsar Chair",
    category: "Chair",
    price: 299,
    image: "images/d5a3f321bac85cc737d261d2e07c33af6757be12.png",
  },
  {
    id: 3,
    name: "Anjay Chair",
    category: "Chair",
    price: 519,
    image: "images/sakarias-armchair-black-sporda-dark-gray__0729767_pe737131_s5_adobespark.png",
  },
  {
    id: 4,
    name: "Nyantuy Chair",
    category: "Chair",
    price: 921,
    image: "images/333e98550db048b910838e0964b74d6c4f5e3527.png",
  },
];

// =============================================
//  КОРЗИНА
// =============================================
const cart = {}; // { productId: quantity }

function getCartTotal() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function getCartSum() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find((p) => p.id === Number(id));
    return sum + p.price * qty;
  }, 0);
}

function updateCartBadge() {
  const total = getCartTotal();
  let numBadge = document.getElementById("cart-count");
  if (!numBadge) {
    numBadge = document.createElement("span");
    numBadge.id = "cart-count";
    document.querySelector(".cart").appendChild(numBadge);
  }
  numBadge.textContent = total > 0 ? total : "";
  numBadge.style.display = total > 0 ? "flex" : "none";
}

function renderCartDropdown() {
  const dropdown = document.getElementById("cart-dropdown");
  const items = Object.entries(cart).filter(([, qty]) => qty > 0);

  if (items.length === 0) {
    dropdown.innerHTML = `<div class="cart-empty">Корзина пуста</div>`;
    return;
  }

  const itemsHTML = items
    .map(([id, qty]) => {
      const p = products.find((p) => p.id === Number(id));
      return `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}">
          <div class="cart-item-info">
            <span class="cart-item-name">${p.name}</span>
            <span class="cart-item-price">$${p.price} × ${qty}</span>
          </div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn" data-id="${p.id}" data-action="minus">−</button>
            <span class="cart-item-qty">${qty}</span>
            <button class="cart-qty-btn" data-id="${p.id}" data-action="plus">+</button>
          </div>
          <button class="cart-remove-btn" data-id="${p.id}">✕</button>
        </div>
      `;
    })
    .join("");

  dropdown.innerHTML = `
    <div class="cart-dropdown-header">
      <span>Корзина</span>
      <span>${getCartTotal()} товар(а)</span>
    </div>
    <div class="cart-items-list">${itemsHTML}</div>
    <div class="cart-dropdown-footer">
      <span>Итого:</span>
      <strong>$${getCartSum()}</strong>
    </div>
    <button class="cart-checkout-btn">Оформить заказ →</button>
  `;

  // Кнопки + / −
  dropdown.querySelectorAll(".cart-qty-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      if (btn.dataset.action === "plus") {
        cart[id] = (cart[id] || 0) + 1;
      } else {
        cart[id] = Math.max(0, (cart[id] || 0) - 1);
        if (cart[id] === 0) delete cart[id];
      }
      updateCartBadge();
      renderCartDropdown();
    });
  });

  // Кнопки удаления
  dropdown.querySelectorAll(".cart-remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      delete cart[Number(btn.dataset.id)];
      updateCartBadge();
      renderCartDropdown();
    });
  });
}

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  updateCartBadge();
  renderCartDropdown();
  showCartToast(productId);
}

function showCartToast(productId) {
  const product = products.find((p) => p.id === productId);
  const qty = cart[productId];

  let toast = document.getElementById("cart-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cart-toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="toast-icon">🛒</div>
    <div class="toast-info">
      <strong>${product.name}</strong>
      <span>В корзине: <b>${qty} шт.</b> — $${product.price * qty}</span>
    </div>
  `;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// =============================================
//  ПОИСК
// =============================================
function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  const resultsBox = document.getElementById("search-results");

  if (!q) {
    resultsBox.style.display = "none";
    resultsBox.innerHTML = "";
    return;
  }

  const matches = products.filter((p) => p.name.toLowerCase().includes(q));

  if (matches.length === 0) {
    resultsBox.innerHTML = `<div class="search-no-result">Ничего не найдено</div>`;
  } else {
    resultsBox.innerHTML = matches
      .map(
        (p) => `
      <div class="search-item" data-id="${p.id}">
        <img src="${p.image}" alt="${p.name}">
        <div class="search-item-info">
          <span class="search-item-name">${p.name}</span>
          <span class="search-item-price">$${p.price}</span>
        </div>
        <button class="search-add-btn" data-id="${p.id}">+ В корзину</button>
      </div>
    `
      )
      .join("");

    resultsBox.querySelectorAll(".search-add-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(Number(btn.dataset.id));
      });
    });
  }

  resultsBox.style.display = "block";
}

// =============================================
//  КАТЕГОРИИ
// =============================================
function initCategories() {
  const buttons = document.querySelectorAll(".categories button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// =============================================
//  ИНИЦИАЛИЗАЦИЯ
// =============================================
document.addEventListener("DOMContentLoaded", () => {

  // --- Создаём выпадающую корзину ---
  const cartEl = document.querySelector(".cart");
  cartEl.style.position = "relative";
  cartEl.style.cursor = "pointer";

  const dropdown = document.createElement("div");
  dropdown.id = "cart-dropdown";
  dropdown.innerHTML = `<div class="cart-empty">Корзина пуста</div>`;
  cartEl.appendChild(dropdown);

  // Открыть/закрыть по клику на корзину
  cartEl.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
    if (dropdown.classList.contains("open")) renderCartDropdown();
  });

  // Закрыть при клике вне
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".cart")) {
      dropdown.classList.remove("open");
    }
  });

  // --- Поиск ---
  const searchInput = document.querySelector(".search input");
  const searchBtn = document.querySelector(".search button");

  const searchWrapper = document.querySelector(".search").parentElement;
  searchWrapper.style.position = "relative";

  const resultsBox = document.createElement("div");
  resultsBox.id = "search-results";
  document.querySelector(".search").after(resultsBox);

  searchInput.addEventListener("input", () =>
    renderSearchResults(searchInput.value)
  );
  searchBtn.addEventListener("click", () =>
    renderSearchResults(searchInput.value)
  );

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search") && !e.target.closest("#search-results")) {
      resultsBox.style.display = "none";
    }
  });

  // --- Кнопки «+» на карточках ---
  document.querySelectorAll(".plus").forEach((btn, i) => {
    btn.addEventListener("click", () => addToCart(products[i].id));
  });

  // --- Категории ---
  initCategories();

  // --- Бургер-меню ---
  const burger = document.querySelector(".burger");
  const navbar = document.querySelector(".navbar");
  if (burger && navbar) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      burger.classList.toggle("open");
      navbar.classList.toggle("open");
    });
    // Закрыть при клике вне
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".topnav")) {
        burger.classList.remove("open");
        navbar.classList.remove("open");
      }
    });
    // Закрыть при клике на ссылку
    navbar.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        burger.classList.remove("open");
        navbar.classList.remove("open");
      });
    });
  }
});
