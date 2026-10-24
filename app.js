// ========================================================
// ZARAFSHON GRAND RESTAURANT - MENYU VA TELEGRAM ZAKAZ
// ========================================================

// Telegram qabul qiluvchi username
const TELEGRAM_USERNAME = "fainted_4k";

// App State
const state = {
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'popular',
  modalQuantity: 1,
  orderDishId: null,
  orderQuantity: 1
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

// Order Modal Elements
const orderModalOverlay = document.getElementById('orderModalOverlay');
const closeOrderModal = document.getElementById('closeOrderModal');
const orderDishImg = document.getElementById('orderDishImg');
const orderDishTitle = document.getElementById('orderDishTitle');
const orderDishPortion = document.getElementById('orderDishPortion');
const orderDishUnitPrice = document.getElementById('orderDishUnitPrice');
const orderQtyMinus = document.getElementById('orderQtyMinus');
const orderQtyPlus = document.getElementById('orderQtyPlus');
const orderQtyNum = document.getElementById('orderQtyNum');
const orderTotalPrice = document.getElementById('orderTotalPrice');
const orderForm = document.getElementById('orderForm');
const orderCustomerName = document.getElementById('orderCustomerName');
const orderCustomerPhone = document.getElementById('orderCustomerPhone');
const orderDeliveryAddress = document.getElementById('orderDeliveryAddress');
const orderNotes = document.getElementById('orderNotes');

let currentModalDishId = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryCounts();
  renderMenu();
  setupEventListeners();
  loadSavedCustomerInfo();
  initGlowingEmbersAnimation();
});

// Load previously used customer name and phone
function loadSavedCustomerInfo() {
  const savedName = localStorage.getItem('zarafshon_customer_name');
  const savedPhone = localStorage.getItem('zarafshon_customer_phone');
  const savedAddress = localStorage.getItem('zarafshon_customer_address');
  
  if (savedName && orderCustomerName) orderCustomerName.value = savedName;
  if (savedPhone && orderCustomerPhone) orderCustomerPhone.value = savedPhone;
  if (savedAddress && orderDeliveryAddress) orderDeliveryAddress.value = savedAddress;
}

// Category counts calculation
function renderCategoryCounts() {
  const counts = {
    all: MENU_ITEMS.length,
    milliy: MENU_ITEMS.filter(item => item.category === 'milliy').length,
    kabob: MENU_ITEMS.filter(item => item.category === 'kabob').length,
    shorva: MENU_ITEMS.filter(item => item.category === 'shorva').length,
    salat: MENU_ITEMS.filter(item => item.category === 'salat').length,
    desert: MENU_ITEMS.filter(item => item.category === 'desert').length,
    ichimlik: MENU_ITEMS.filter(item => item.category === 'ichimlik').length
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
          "${state.searchQuery}" bo'yicha taom topilmadi. Qidiruv so'zini tekshiring yoki barcha toifani tanlang.
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
              <button class="btn-order-tg-card" onclick="openOrderModal(${dish.id}, 1)" title="Telegram orqali zakaz berish">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                Zakaz berish
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ========================================================
// BUYURTMA RASMIYLASHTIRISH VA TELEGRAMGA YUBORISH
// ========================================================

// Buyurtma modalini ochish
window.openOrderModal = function(dishId, initialQty = 1) {
  const dish = MENU_ITEMS.find(item => item.id === dishId);
  if (!dish) return;

  state.orderDishId = dish.id;
  state.orderQuantity = Math.max(1, initialQty);

  if (orderDishImg) {
    orderDishImg.src = dish.image;
    orderDishImg.alt = dish.title;
  }
  if (orderDishTitle) orderDishTitle.textContent = dish.title;
  if (orderDishPortion) orderDishPortion.textContent = `Porsiya: ${dish.portion}`;
  if (orderDishUnitPrice) orderDishUnitPrice.textContent = formatPrice(dish.price);

  updateOrderModalCalculation();

  if (orderModalOverlay) {
    orderModalOverlay.classList.add('open');
  }
};

// Modal ichidagi porsiya soni va umumiy summani yangilash
function updateOrderModalCalculation() {
  const dish = MENU_ITEMS.find(item => item.id === state.orderDishId);
  if (!dish) return;

  if (orderQtyNum) orderQtyNum.textContent = state.orderQuantity;
  if (orderTotalPrice) orderTotalPrice.textContent = formatPrice(dish.price * state.orderQuantity);
}

// Buyurtma modalini yopish
window.closeOrderModalWindow = function() {
  if (orderModalOverlay) {
    orderModalOverlay.classList.remove('open');
  }
};

// Batafsil modalidan to'g'ridan-to'g'ri zakaz modaliga o'tish
window.openOrderModalFromDetail = function() {
  if (!currentModalDishId) return;
  const qty = state.modalQuantity || 1;
  closeDishModalWindow();
  openOrderModal(currentModalDishId, qty);
};

// Telegramga yuborish (Form submit hodisasi)
function handleOrderFormSubmit(e) {
  e.preventDefault();

  const dish = MENU_ITEMS.find(item => item.id === state.orderDishId);
  if (!dish) return;

  const customerName = orderCustomerName.value.trim();
  const customerPhone = orderCustomerPhone.value.trim();
  const deliveryAddress = orderDeliveryAddress.value.trim();
  const notes = orderNotes.value.trim();

  if (!customerName || !customerPhone) {
    alert("Iltimos, ismingiz va telefon raqamingizni kiriting!");
    return;
  }

  // Mijoz ma'lumotlarini keyingi safar uchun xotirada saqlash
  localStorage.setItem('zarafshon_customer_name', customerName);
  localStorage.setItem('zarafshon_customer_phone', customerPhone);
  if (deliveryAddress) {
    localStorage.setItem('zarafshon_customer_address', deliveryAddress);
  }

  const unitPrice = formatPrice(dish.price);
  const totalAmount = formatPrice(dish.price * state.orderQuantity);
  const qtyString = state.orderQuantity > 1 
    ? `${state.orderQuantity} porsiya (${dish.portion})` 
    : `1 porsiya (${dish.portion})`;

  // Foydalanuvchi talab qilgan to'liq tartibli xabar matni:
  let message = `Assalomu alaykum! Zarafshon Grand Restoranidan yangi buyurtma:\n\n`;
  message += `📋 TAOM MA'LUMOTLARI:\n`;
  message += `• Taom nomi: ${dish.title}\n`;
  message += `• Toifasi: ${dish.categoryName}\n`;
  message += `• Miqdori: ${qtyString}\n`;
  message += `• Bir porsiya narxi: ${unitPrice}\n`;
  message += `💰 UMUMIY SUMMA: ${totalAmount}\n\n`;

  message += `👤 MIJOZ MA'LUMOTLARI:\n`;
  message += `• Ismi: ${customerName}\n`;
  message += `• Telefon raqami: ${customerPhone}\n`;

  if (deliveryAddress) {
    message += `📍 Yetkazib berish manzili: ${deliveryAddress}\n`;
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

  // Modalni yopish
  closeOrderModalWindow();
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

  // Order Modal Quantity Plus / Minus
  if (orderQtyMinus) {
    orderQtyMinus.addEventListener('click', () => {
      if (state.orderQuantity > 1) {
        state.orderQuantity--;
        updateOrderModalCalculation();
      }
    });
  }

  if (orderQtyPlus) {
    orderQtyPlus.addEventListener('click', () => {
      if (state.orderQuantity < 50) {
        state.orderQuantity++;
        updateOrderModalCalculation();
      }
    });
  }

  // Order form submit
  if (orderForm) {
    orderForm.addEventListener('submit', handleOrderFormSubmit);
  }

  // Close modals
  if (closeDishModal) closeDishModal.addEventListener('click', closeDishModalWindow);
  if (closeOrderModal) closeOrderModal.addEventListener('click', closeOrderModalWindow);

  if (dishModalOverlay) {
    dishModalOverlay.addEventListener('click', (e) => {
      if (e.target === dishModalOverlay) closeDishModalWindow();
    });
  }

  if (orderModalOverlay) {
    orderModalOverlay.addEventListener('click', (e) => {
      if (e.target === orderModalOverlay) closeOrderModalWindow();
    });
  }

  // Esc key closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDishModalWindow();
      closeOrderModalWindow();
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
