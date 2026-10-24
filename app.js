// ========================================================
// ZARAFSHON GRAND RESTAURANT - MENYU, SAVATCHA VA TELEGRAM ZAKAZ
// ========================================================

// Telegram qabul qiluvchi username
const TELEGRAM_USERNAME = "fainted_4k";

// App State
const state = {
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'popular',
  cart: JSON.parse(localStorage.getItem('zarafshon_multi_cart') || '[]'),
  modalQuantity: 1
};

// Currency Formatter
function formatPrice(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}

// DOM Elements
const dishesContainer = document.getElementById('dishesGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryTabs = document.querySelectorAll('.tab-btn');
const resultsCountEl = document.getElementById('resultsCount');

// Cart Elements
const cartToggleBtn = document.getElementById('cartToggleBtn');
const floatingCartBtn = document.getElementById('floatingCartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartBadge = document.getElementById('cartBadge');
const floatingCartBadge = document.getElementById('floatingCartBadge');
const floatingCartTotal = document.getElementById('floatingCartTotal');
const cartHeaderCount = document.getElementById('cartHeaderCount');
const cartItemsContainer = document.getElementById('cartItems');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartGrandTotalEl = document.getElementById('cartGrandTotal');
const cartCheckoutForm = document.getElementById('cartCheckoutForm');
const cartCustomerName = document.getElementById('cartCustomerName');
const cartCustomerPhone = document.getElementById('cartCustomerPhone');
const cartDeliveryAddress = document.getElementById('cartDeliveryAddress');
const cartNotes = document.getElementById('cartNotes');
const checkoutBtn = document.getElementById('checkoutBtn');

// Dish Modal Elements
const dishModalOverlay = document.getElementById('dishModalOverlay');
const closeDishModal = document.getElementById('closeDishModal');
const modalDishImg = document.getElementById('modalDishImg');
const modalDishBadge = document.getElementById('modalDishBadge');
const modalDishCat = document.getElementById('modalDishCat');
const modalDishTitle = document.getElementById('modalDishTitle');
const modalDishRating = document.getElementById('modalDishRating');
const modalDishPortion = document.getElementById('modalDishPortion');
const modalDishTime = document.getElementById('modalDishTime');
const modalDishCalories = document.getElementById('modalDishCalories');
const modalDishDesc = document.getElementById('modalDishDesc');
const modalIngredientsList = document.getElementById('modalIngredientsList');
const modalDishPrice = document.getElementById('modalDishPrice');
const modalQtyNum = document.getElementById('modalQtyNum');
const modalQtyMinus = document.getElementById('modalQtyMinus');
const modalQtyPlus = document.getElementById('modalQtyPlus');
const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');

let currentModalDishId = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryCounts();
  renderMenu();
  updateCartUI();
  setupEventListeners();
  loadSavedCustomerInfo();
  initGlowingEmbersAnimation();
});

// Load previously saved customer contact info
function loadSavedCustomerInfo() {
  const savedName = localStorage.getItem('zarafshon_customer_name');
  const savedPhone = localStorage.getItem('zarafshon_customer_phone');
  const savedAddress = localStorage.getItem('zarafshon_customer_address');
  
  if (savedName && cartCustomerName) cartCustomerName.value = savedName;
  if (savedPhone && cartCustomerPhone) cartCustomerPhone.value = savedPhone;
  if (savedAddress && cartDeliveryAddress) cartDeliveryAddress.value = savedAddress;
}

// Category counts calculation
function renderCategoryCounts() {
  const counts = {
    all: MENU_ITEMS.length,
    milliy: MENU_ITEMS.filter(item => item.category === 'milliy').length,
    kabob: MENU_ITEMS.filter(item => item.category === 'kabob').length,
    shorva: MENU_ITEMS.filter(item => item.category === 'shorva').length,
    salat: MENU_ITEMS.filter(item => item.category === 'salat').length,
    non: MENU_ITEMS.filter(item => item.category === 'non').length,
    ichimlik: MENU_ITEMS.filter(item => item.category === 'ichimlik').length,
    choy: MENU_ITEMS.filter(item => item.category === 'choy').length,
    desert: MENU_ITEMS.filter(item => item.category === 'desert').length
  };

  categoryTabs.forEach(tab => {
    const cat = tab.dataset.category;
    const countBadge = tab.querySelector('.tab-count');
    if (countBadge && counts[cat] !== undefined) {
      countBadge.textContent = counts[cat];
    }
  });
}

// Filter and Sort Menu
function getFilteredAndSortedItems() {
  let items = [...MENU_ITEMS];

  // Category Filter
  if (state.activeCategory !== 'all') {
    items = items.filter(item => item.category === state.activeCategory);
  }

  // Search Filter
  if (state.searchQuery.trim() !== '') {
    const query = state.searchQuery.toLowerCase().trim();
    items = items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query) ||
      item.ingredients.some(ing => ing.toLowerCase().includes(query))
    );
  }

  // Sort
  if (state.sortBy === 'price-asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'rating') {
    items.sort((a, b) => b.rating - a.rating);
  } else {
    items.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }

  return items;
}

// Render Menu to DOM
function renderMenu() {
  const items = getFilteredAndSortedItems();

  if (resultsCountEl) {
    resultsCountEl.textContent = `${items.length} ta taom mavjud`;
  }

  if (items.length === 0) {
    dishesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>Bunday taom topilmadi</h3>
        <p style="color: var(--text-secondary); margin-top: 8px;">
          "${state.searchQuery}" bo'yicha hech qanday taom topilmadi. Boshqa so'z bilan qidirib ko'ring.
        </p>
      </div>
    `;
    return;
  }

  dishesContainer.innerHTML = items.map(dish => {
    const badgeHtml = dish.badge 
      ? `<span class="dish-badge ${dish.badgeType}">${dish.badge}</span>` 
      : '';

    const oldPriceHtml = dish.oldPrice 
      ? `<span class="dish-old-price">${formatPrice(dish.oldPrice)}</span>` 
      : '';

    const tagsHtml = dish.ingredients.slice(0, 3).map(tag => 
      `<span class="dish-tag-item">${tag}</span>`
    ).join('');

    return `
      <div class="dish-card" data-id="${dish.id}">
        <div class="dish-image-wrapper" onclick="openDishModal(${dish.id})">
          <img src="${dish.image}" alt="${dish.title}" class="dish-image" loading="lazy" />
          ${badgeHtml}
          <div class="dish-quick-meta">
            <span>⏱️ ${dish.time}</span>
            <span>⚖️ ${dish.portion}</span>
          </div>
        </div>

        <div class="dish-content">
          <div class="dish-header-row">
            <span class="dish-category">${dish.categoryName}</span>
            <div class="dish-rating">
              <span>★</span>
              <span>${dish.rating}</span>
              <span class="dish-rating-count">(${dish.reviewsCount})</span>
            </div>
          </div>

          <h3 class="dish-title" onclick="openDishModal(${dish.id})">${dish.title}</h3>
          <p class="dish-description">${dish.desc}</p>

          <div class="dish-tags">
            ${tagsHtml}
          </div>

          <div class="dish-footer">
            <div class="dish-price-wrap">
              <span class="price-label">Narxi:</span>
              ${oldPriceHtml}
              <div class="dish-price">${formatPrice(dish.price)}</div>
            </div>

            <div class="dish-buttons">
              <button class="btn-detail-sm" onclick="openDishModal(${dish.id})" title="Batafsil ma'lumot">
                Batafsil
              </button>
              <button class="btn-add-cart-primary" onclick="addToCart(${dish.id}, 1)" title="Savatchaga qo'shish">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                + Savatga
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ========================================================
// SAVATCHA (SHOPPING CART) LOGIKASI
// ========================================================

// Savatchaga qo'shish
window.addToCart = function(dishId, qty = 1) {
  const dish = MENU_ITEMS.find(item => item.id === dishId);
  if (!dish) return;

  const existingItem = state.cart.find(i => i.id === dishId);
  if (existingItem) {
    existingItem.qty += qty;
  } else {
    state.cart.push({
      id: dish.id,
      title: dish.title,
      price: dish.price,
      portion: dish.portion,
      categoryName: dish.categoryName,
      image: dish.image,
      qty: qty
    });
  }

  saveCart();
  updateCartUI();
  bumpCartBadges();
  showToast(`"${dish.title}" (${qty}x) savatchaga qo'shildi! 🛒`);
};

// Savatchadagi miqdorni o'zgartirish (+ / -)
window.changeCartItemQty = function(dishId, delta) {
  const item = state.cart.find(i => i.id === dishId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.id !== dishId);
  }

  saveCart();
  updateCartUI();
};

// Savatchadan o'chirish
window.removeCartItem = function(dishId) {
  state.cart = state.cart.filter(i => i.id !== dishId);
  saveCart();
  updateCartUI();
  showToast("Taom savatchadan o'chirildi");
};

function saveCart() {
  localStorage.setItem('zarafshon_multi_cart', JSON.stringify(state.cart));
}

function bumpCartBadges() {
  [cartBadge, floatingCartBadge].forEach(badge => {
    if (badge) {
      badge.classList.add('bump');
      setTimeout(() => badge.classList.remove('bump'), 300);
    }
  });
}

// Savatcha UI ni yangilash
function updateCartUI() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (cartBadge) cartBadge.textContent = totalCount;
  if (floatingCartBadge) floatingCartBadge.textContent = totalCount;
  if (floatingCartTotal) floatingCartTotal.textContent = formatPrice(totalAmount);
  if (cartHeaderCount) cartHeaderCount.textContent = `${totalCount} ta taom`;
  if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(totalAmount);
  if (cartGrandTotalEl) cartGrandTotalEl.textContent = formatPrice(totalAmount);

  // Floating button visible if cart has items
  if (floatingCartBtn) {
    if (totalCount > 0) {
      floatingCartBtn.classList.add('show');
    } else {
      floatingCartBtn.classList.remove('show');
    }
  }

  if (state.cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart-state">
        <div style="font-size: 46px; margin-bottom: 12px;">🛍️</div>
        <h4>Savatchangiz hozircha bo'sh</h4>
        <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5;">
          Menyudan sevimli taomlaringizni (osh, shashlik, salat, cola...) tanlab, <strong>"+ Savatga"</strong> tugmasini bosing!
        </p>
      </div>
    `;
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.cursor = 'not-allowed';
    }
    return;
  }

  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.cursor = 'pointer';
  }

  cartItemsContainer.innerHTML = state.cart.map(item => `
    <div class="cart-item-card">
      <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.title}</h4>
        <div class="cart-item-meta">${item.portion} • ${formatPrice(item.price)}</div>
        <div class="cart-item-counter">
          <button class="count-btn" onclick="changeCartItemQty(${item.id}, -1)">-</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="count-btn" onclick="changeCartItemQty(${item.id}, 1)">+</button>
          <span class="cart-item-line-total">${formatPrice(item.price * item.qty)}</span>
        </div>
      </div>
      <button class="btn-delete-cart-item" onclick="removeCartItem(${item.id})" title="O'chirish">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `).join('');
}

// Savatchani ochish / yopish
window.openCartDrawer = function() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
  }
};

window.closeCartDrawer = function() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
  }
};

// ========================================================
// UMUMIY BUYURTMANI TELEGRAMGA YUBORISH (@fainted_4k)
// ========================================================
function handleCartCheckoutSubmit(e) {
  e.preventDefault();

  if (state.cart.length === 0) {
    alert("Savatchangiz bo'sh! Iltimos, oldin taomlarni tanlang.");
    return;
  }

  const name = cartCustomerName.value.trim();
  const phone = cartCustomerPhone.value.trim();
  const address = cartDeliveryAddress.value.trim();
  const notes = cartNotes.value.trim();

  if (!name || !phone) {
    alert("Iltimos, ismingiz va telefon raqamingizni to'ldiring!");
    return;
  }

  // Saqlab qo'yish
  localStorage.setItem('zarafshon_customer_name', name);
  localStorage.setItem('zarafshon_customer_phone', phone);
  if (address) localStorage.setItem('zarafshon_customer_address', address);

  const totalSum = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Ko'p taomli xabarni shakllantirish
  let message = `Assalomu alaykum! Zarafshon Grand Restoranidan yangi umumiy buyurtma:\n\n`;
  message += `📋 BUYURTMA TARKIBI (${state.cart.length} xil taom):\n`;
  
  state.cart.forEach((item, index) => {
    message += `${index + 1}. ${item.title} — ${item.qty} dona x ${formatPrice(item.price)} = ${formatPrice(item.price * item.qty)}\n`;
  });

  message += `----------------------------------------\n`;
  message += `💰 JAMI TO'LOV: ${formatPrice(totalSum)}\n\n`;

  message += `👤 MIJOZ MA'LUMOTLARI:\n`;
  message += `• Ismi: ${name}\n`;
  message += `• Telefon raqami: ${phone}\n`;

  if (address) {
    message += `📍 Yetkazib berish manzili: ${address}\n`;
  } else {
    message += `📍 Yetkazib berish: Olib ketish yoki aniqlanadi\n`;
  }

  if (notes) {
    message += `📝 Qo'shimcha izoh: ${notes}\n`;
  }

  message += `\nIltimos, buyurtmani qabul qilib, tasdiqlasangiz!`;

  // Telegram deep-link @fainted_4k ga yo'naltirish
  const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;

  // Telegramni ochish
  window.open(telegramUrl, '_blank');

  showToast("Telegram ochilmoqda! Xabarni yuboring ✈️");
}

// ========================================================
// TAOM BATAFSIL MA'LUMOTI MODALI
// ========================================================
function updateModalPrice() {
  const dish = MENU_ITEMS.find(item => item.id === currentModalDishId);
  if (!dish) return;

  if (modalQtyNum) {
    modalQtyNum.textContent = state.modalQuantity;
  }
  if (modalDishPrice) {
    modalDishPrice.textContent = formatPrice(dish.price * state.modalQuantity);
  }
}

window.openDishModal = function(id) {
  const dish = MENU_ITEMS.find(item => item.id === id);
  if (!dish) return;

  currentModalDishId = dish.id;
  state.modalQuantity = 1;

  modalDishImg.src = dish.image;
  modalDishImg.alt = dish.title;
  modalDishCat.textContent = dish.categoryName;
  modalDishTitle.textContent = dish.title;
  modalDishRating.textContent = `★ ${dish.rating} (${dish.reviewsCount} baho)`;
  modalDishPortion.textContent = `Porsiya: ${dish.portion}`;
  modalDishTime.textContent = `⏱️ ${dish.time}`;
  modalDishCalories.textContent = `🔥 ${dish.calories}`;
  modalDishDesc.textContent = dish.desc;
  
  updateModalPrice();

  if (dish.badge) {
    modalDishBadge.style.display = 'inline-block';
    modalDishBadge.textContent = dish.badge;
    modalDishBadge.className = `dish-badge ${dish.badgeType}`;
  } else {
    modalDishBadge.style.display = 'none';
  }

  modalIngredientsList.innerHTML = dish.ingredients.map(ing => 
    `<span class="modal-ingredient-chip">✓ ${ing}</span>`
  ).join('');

  dishModalOverlay.classList.add('open');
};

window.closeDishModalWindow = function() {
  dishModalOverlay.classList.remove('open');
  currentModalDishId = null;
  state.modalQuantity = 1;
};

// ========================================================
// TOAST BILDIRISHNOMALARI
// ========================================================
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ========================================================
// HODISALAR (EVENT LISTENERS)
// ========================================================
function setupEventListeners() {
  // Category tabs click
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeCategory = tab.dataset.category;
      renderMenu();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderMenu();
    });
  }

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderMenu();
    });
  }

  // Modal Detail Quantity Plus / Minus
  if (modalQtyMinus) {
    modalQtyMinus.addEventListener('click', () => {
      if (state.modalQuantity > 1) {
        state.modalQuantity--;
        updateModalPrice();
      }
    });
  }

  if (modalQtyPlus) {
    modalQtyPlus.addEventListener('click', () => {
      if (state.modalQuantity < 50) {
        state.modalQuantity++;
        updateModalPrice();
      }
    });
  }

  // Modal Detail Add to Cart Button
  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      if (currentModalDishId) {
        addToCart(currentModalDishId, state.modalQuantity);
        closeDishModalWindow();
      }
    });
  }

  // Cart Drawer open/close
  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  // Cart Form submit (Telegram Order)
  if (cartCheckoutForm) {
    cartCheckoutForm.addEventListener('submit', handleCartCheckoutSubmit);
  }

  // Close modals
  if (closeDishModal) closeDishModal.addEventListener('click', closeDishModalWindow);

  if (dishModalOverlay) {
    dishModalOverlay.addEventListener('click', (e) => {
      if (e.target === dishModalOverlay) closeDishModalWindow();
    });
  }

  // Esc key closes modals/drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDishModalWindow();
      closeCartDrawer();
    }
  });

  // Navbar scroll background
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      if (navLinks.classList.contains('open')) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '80px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = '#0d1117';
        navLinks.style.padding = '24px';
        navLinks.style.borderBottom = '1px solid var(--border-color)';
      } else {
        navLinks.style.display = '';
      }
    });
  }
}

// ========================================================
// REALISTIC GLOWING EMBERS (CHO'G' HARAKATI: CHAPDAN O'NGGA)
// ========================================================
function initGlowingEmbersAnimation() {
  const canvas = document.getElementById('embersCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const emberCount = Math.min(Math.floor(width / 22), 75);
  const embers = [];

  const emberColors = [
    { r: 255, g: 75, b: 20 },
    { r: 255, g: 140, b: 0 },
    { r: 255, g: 195, b: 35 },
    { r: 255, g: 235, b: 120 },
    { r: 230, g: 45, b: 15 }
  ];

  class Ember {
    constructor(initialRandomX = false) {
      this.reset(initialRandomX);
    }

    reset(initialRandomX = false) {
      this.x = initialRandomX ? Math.random() * width : -20 - Math.random() * 60;
      this.y = Math.random() * height;
      this.speedX = 0.8 + Math.random() * 1.8;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.angle = Math.random() * Math.PI * 2;
      this.angleSpeed = 0.015 + Math.random() * 0.025;
      this.waveAmplitude = 0.4 + Math.random() * 0.8;
      this.radius = 1.2 + Math.random() * 2.6;
      this.baseAlpha = 0.4 + Math.random() * 0.55;
      this.alpha = this.baseAlpha;
      this.pulseSpeed = 0.02 + Math.random() * 0.04;
      this.pulseAngle = Math.random() * Math.PI * 2;
      this.color = emberColors[Math.floor(Math.random() * emberColors.length)];
    }

    update() {
      this.x += this.speedX;
      this.angle += this.angleSpeed;
      this.y += Math.sin(this.angle) * this.waveAmplitude + this.speedY;

      this.pulseAngle += this.pulseSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.pulseAngle) * 0.25;
      if (this.alpha < 0.15) this.alpha = 0.15;
      if (this.alpha > 0.95) this.alpha = 0.95;

      if (this.x > width + 30) {
        this.reset(false);
      }

      if (this.y < -20) this.y = height + 10;
      if (this.y > height + 20) this.y = -10;
    }

    draw() {
      ctx.save();
      const glowRadius = this.radius * 3.8;
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, glowRadius
      );
      
      const { r, g, b } = this.color;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.alpha})`);
      gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.6})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(this.alpha * 1.2, 1)})`;
      ctx.fill();

      ctx.restore();
    }
  }

  for (let i = 0; i < emberCount; i++) {
    embers.push(new Ember(true));
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const leftHearthGradient = ctx.createLinearGradient(0, 0, width * 0.35, 0);
    leftHearthGradient.addColorStop(0, 'rgba(255, 60, 0, 0.045)');
    leftHearthGradient.addColorStop(1, 'rgba(255, 60, 0, 0)');
    ctx.fillStyle = leftHearthGradient;
    ctx.fillRect(0, 0, width * 0.35, height);

    for (let i = 0; i < embers.length; i++) {
      embers[i].update();
      embers[i].draw();
    }

    requestAnimationFrame(animate);
  }

  animate();
}
