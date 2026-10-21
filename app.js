// ========================================================
// ZARAFSHON GRAND RESTAURANT - MENYU VA CHO'G' ANIMATSIYASI
// ========================================================

// App State
const state = {
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'popular'
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

let currentModalDishId = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryCounts();
  renderMenu();
  setupEventListeners();
  initGlowingEmbersAnimation();
});

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
    // popular (default)
    items.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }

  return items;
}

// Render Menu to DOM (Only menus and prices)
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
              <button class="btn-detail-full" onclick="openDishModal(${dish.id})">
                <span>Batafsil ma'lumot</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Open Dish Detail Modal
window.openDishModal = function(id) {
  const dish = MENU_ITEMS.find(item => item.id === id);
  if (!dish) return;

  currentModalDishId = dish.id;
  modalDishImg.src = dish.image;
  modalDishImg.alt = dish.title;
  modalDishCat.textContent = dish.categoryName;
  modalDishTitle.textContent = dish.title;
  modalDishRating.textContent = `★ ${dish.rating} (${dish.reviewsCount} baho)`;
  modalDishPortion.textContent = `Porsiya: ${dish.portion}`;
  modalDishTime.textContent = `⏱️ ${dish.time}`;
  modalDishCalories.textContent = `🔥 ${dish.calories}`;
  modalDishDesc.textContent = dish.desc;
  modalDishPrice.textContent = formatPrice(dish.price);

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
};

// Setup Event Listeners
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

  // Dish Modal Close
  if (closeDishModal) {
    closeDishModal.addEventListener('click', closeDishModalWindow);
  }

  if (dishModalOverlay) {
    dishModalOverlay.addEventListener('click', (e) => {
      if (e.target === dishModalOverlay) {
        closeDishModalWindow();
      }
    });
  }

  // Esc key to close modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDishModalWindow();
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

  // Ember particles count
  const emberCount = Math.min(Math.floor(width / 22), 75);
  const embers = [];

  // Color palettes of hot burning coal / embers
  const emberColors = [
    { r: 255, g: 75, b: 20 },   // Deep fiery orange-red
    { r: 255, g: 140, b: 0 },   // Hot amber
    { r: 255, g: 195, b: 35 },  // Radiant gold
    { r: 255, g: 235, b: 120 }, // Intense white-yellow spark
    { r: 230, g: 45, b: 15 }    // Rich ruby ember
  ];

  class Ember {
    constructor(initialRandomX = false) {
      this.reset(initialRandomX);
    }

    reset(initialRandomX = false) {
      // Moves strictly from left to right
      this.x = initialRandomX ? Math.random() * width : -20 - Math.random() * 60;
      this.y = Math.random() * height;
      
      // Speed from left to right (horizontal velocity)
      this.speedX = 0.8 + Math.random() * 1.8;
      
      // Subtle vertical floating wave
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.angle = Math.random() * Math.PI * 2;
      this.angleSpeed = 0.015 + Math.random() * 0.025;
      this.waveAmplitude = 0.4 + Math.random() * 0.8;

      // Size and glow
      this.radius = 1.2 + Math.random() * 2.6;
      this.baseAlpha = 0.4 + Math.random() * 0.55;
      this.alpha = this.baseAlpha;
      this.pulseSpeed = 0.02 + Math.random() * 0.04;
      this.pulseAngle = Math.random() * Math.PI * 2;

      // Color selection
      this.color = emberColors[Math.floor(Math.random() * emberColors.length)];
    }

    update() {
      // Horizontal motion: chapdan o'ngga
      this.x += this.speedX;
      
      // Gentle wavy vertical movement like realistic hot air currents
      this.angle += this.angleSpeed;
      this.y += Math.sin(this.angle) * this.waveAmplitude + this.speedY;

      // Pulsing glow effect (o'chib-yonish)
      this.pulseAngle += this.pulseSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.pulseAngle) * 0.25;
      if (this.alpha < 0.15) this.alpha = 0.15;
      if (this.alpha > 0.95) this.alpha = 0.95;

      // If particle travels past the right screen border, spawn back on the left
      if (this.x > width + 30) {
        this.reset(false);
      }

      // If it leaves top/bottom boundary, gently wrap around
      if (this.y < -20) this.y = height + 10;
      if (this.y > height + 20) this.y = -10;
    }

    draw() {
      ctx.save();
      
      // Glowing halo (radial glow around the burning ember)
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

      // Hot bright solid core of the ember
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(this.alpha * 1.2, 1)})`;
      ctx.fill();

      ctx.restore();
    }
  }

  // Populate initial embers across the screen
  for (let i = 0; i < emberCount; i++) {
    embers.push(new Ember(true));
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Warm ambient hearth glow on the left edge
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
