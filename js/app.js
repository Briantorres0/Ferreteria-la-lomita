let cart = [];

// Elementos del DOM
const productsGrid = document.getElementById('products-grid');
const cartCount = document.getElementById('cart-count');
const cartBtn = document.getElementById('cart-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.getElementById('close-modal');
const cartItemsContainer = document.getElementById('cart-items');
const orderForm = document.getElementById('order-form');

// Modal Ficha Técnica
const productModalOverlay = document.getElementById('product-modal-overlay');
const closeProductModal = document.getElementById('close-product-modal');
const productModalContent = document.getElementById('product-modal-content');

// Elementos del Menú Lateral
const filterBtns = document.querySelectorAll('.sidebar .filter-btn');
const accordionHeaders = document.querySelectorAll('.accordion-header');
const subBtns = document.querySelectorAll('.sub-btn');

// Normalizador para filtros de categorías
const normalize = (text) => 
  (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// Renderizado de tarjetas de catálogo
function renderProducts(items) {
  productsGrid.innerHTML = '';

  if (!items || items.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 0; color: var(--text-muted);">
        <p>No se encontraron productos disponibles en esta categoría.</p>
      </div>
    `;
    return;
  }
  
  items.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');

    card.innerHTML = `
      <div class="img-wrapper" onclick="openProductModal(${product.id})">
        <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <span class="product-brand">${product.brand}</span>
        <h4 class="product-title" onclick="openProductModal(${product.id})">${product.name}</h4>
        <button class="add-btn" onclick="openProductModal(${product.id})">Ver Ficha Técnica</button>
      </div>
    `;

    productsGrid.appendChild(card);
  });
}

// Abrir Modal de Ficha Técnica
window.openProductModal = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const validSpecs = (product.specs && Array.isArray(product.specs)) 
    ? product.specs.filter(s => s && s.trim() !== '') 
    : [];

  const specsList = validSpecs.length > 0
    ? `<label style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted);">Especificaciones técnicas:</label>
       <ul class="specs-list">
         ${validSpecs.map(spec => `<li>${spec}</li>`).join('')}
       </ul>`
    : '';

  productModalContent.innerHTML = `
    <div class="modal-img-wrapper">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="modal-info">
      <span class="product-brand">${product.brand} · Garantía Oficial 6 Meses</span>
      <h3 style="margin-bottom: 12px;">${product.name}</h3>
      <p class="modal-desc">${product.description || ''}</p>
      ${specsList}
      <button class="add-btn-primary" onclick="addToCart(${product.id})">
        Agregar a la Consulta
      </button>
    </div>
  `;

  productModalOverlay.classList.add('active');
};

// Agregar ítem a la lista de consulta
window.addToCart = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      quantity: 1
    });
  }

  productModalOverlay.classList.remove('active');
  updateCartUI();
  modalOverlay.classList.add('active');
};

// Modificar cantidades (+ / -)
window.changeQuantity = function(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    updateCartUI();
  }
};

// Quitar ítem
window.removeFromCart = function(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
};

// Actualizar vista del modal de consulta
function updateCartUI() {
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.textContent = totalCount;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding: 20px 0;">No seleccionaste ninguna máquina aún.</p>';
    return;
  }

  cartItemsContainer.innerHTML = '';

  cart.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.classList.add('cart-item');
    itemEl.innerHTML = `
      <div style="flex: 1; padding-right: 10px;">
        <strong>${item.name}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${item.brand}</div>
      </div>
      <div style="display:flex; align-items:center; gap: 8px;">
        <button style="width:24px; height:24px; border:1px solid #cbd5e1; background:#fff; border-radius:4px; font-weight:700; cursor:pointer;" onclick="changeQuantity(${item.id}, -1)">-</button>
        <span style="font-size:0.85rem; font-weight:700;">${item.quantity}</span>
        <button style="width:24px; height:24px; border:1px solid #cbd5e1; background:#fff; border-radius:4px; font-weight:700; cursor:pointer;" onclick="changeQuantity(${item.id}, 1)">+</button>
      </div>
      <button style="background:none; border:none; color:#ef4444; font-size:1.4rem; cursor:pointer; margin-left:12px;" onclick="removeFromCart(${item.id})">&times;</button>
    `;
    cartItemsContainer.appendChild(itemEl);
  });
}

// Cierre y apertura de modales
closeProductModal.addEventListener('click', () => productModalOverlay.classList.remove('active'));
productModalOverlay.addEventListener('click', (e) => {
  if (e.target === productModalOverlay) productModalOverlay.classList.remove('active');
});

cartBtn.addEventListener('click', () => modalOverlay.classList.add('active'));
closeModal.addEventListener('click', () => modalOverlay.classList.remove('active'));
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('active');
});

// Envío a WhatsApp
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (cart.length === 0) return;

  const name = document.getElementById('customer-name').value;
  const location = document.getElementById('customer-location').value;
  const invoice = document.getElementById('invoice-type').value;
  
  const phone = "2244424335"; 

  let message = `🛠️️ *CONSULTA DE DISPONIBILIDAD Y COTIZACIÓN - FERRETERÍA DON HECTOR*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `👤 *Cliente:* ${name}\n`;
  message += `📍 *Destino:* ${location}\n`;
  message += `🧾 *Facturación:* ${invoice}\n\n`;
  message += `📦 *Productos consultados:*\n`;

  cart.forEach(item => {
    message += `• ${item.name} (${item.brand}) x${item.quantity}u.\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `_Hola! Quería consultar disponibilidad de stock, medios de envío y cotización para estos productos._`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
});

// Sidebar & filtros
function clearAllActiveStates() {
  filterBtns.forEach(btn => btn.classList.remove('active'));
  accordionHeaders.forEach(btn => btn.classList.remove('active'));
  subBtns.forEach(btn => btn.classList.remove('active'));
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    clearAllActiveStates();
    btn.classList.add('active');
    document.querySelectorAll('.accordion').forEach(acc => acc.classList.remove('open'));

    const category = btn.getAttribute('data-category');
    if (category === 'todos') {
      renderProducts(products);
    } else {
      renderProducts(products.filter(p => normalize(p.category) === normalize(category)));
    }
  });
});

accordionHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const parentAccordion = header.closest('.accordion');
    document.querySelectorAll('.accordion').forEach(acc => {
      if (acc !== parentAccordion) acc.classList.remove('open');
    });

    parentAccordion.classList.toggle('open');
    clearAllActiveStates();
    header.classList.add('active');

    const category = header.getAttribute('data-category');
    renderProducts(products.filter(p => normalize(p.category) === normalize(category)));
  });
});

subBtns.forEach(sub => {
  sub.addEventListener('click', (e) => {
    e.stopPropagation();
    clearAllActiveStates();
    
    sub.classList.add('active');
    const parentAccordion = sub.closest('.accordion');
    parentAccordion.querySelector('.accordion-header').classList.add('active');

    const subcategory = sub.getAttribute('data-sub');
    renderProducts(products.filter(p => normalize(p.subcategory) === normalize(subcategory)));
  });
});

// Mobile Sidebar
const openSidebarBtn = document.getElementById('open-sidebar-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');

function openMobileSidebar() {
  sidebar.classList.add('mobile-open');
  sidebarBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  sidebar.classList.remove('mobile-open');
  sidebarBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

if (openSidebarBtn) openSidebarBtn.addEventListener('click', openMobileSidebar);
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeMobileSidebar);
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (window.innerWidth < 900) closeMobileSidebar();
  });
});

subBtns.forEach(sub => {
  sub.addEventListener('click', () => {
    if (window.innerWidth < 900) closeMobileSidebar();
  });
});

// ============================================
// CARRUSEL AUTOMÁTICO DE PRODUCTOS DISCONTINUADOS
// ============================================
function initOutletCarousel() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const section = document.getElementById('outlet-section');

  if (!track || !section) return;

  const discontinuedProducts = products.filter(
    p => normalize(p.category) === 'discontinuados'
  );

  if (discontinuedProducts.length === 0) {
    section.style.display = 'none';
    return;
  }

  track.innerHTML = discontinuedProducts.map(p => `
    <div class="carousel-slide" onclick="openProductModal(${p.id})">
      <div class="img-box">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <span class="carousel-slide-brand">${p.brand}</span>
      <h4 class="carousel-slide-title">${p.name}</h4>
    </div>
  `).join('');

  let currentIndex = 0;
  let autoSlideTimer = null;

  const getVisibleCards = () => window.innerWidth >= 900 ? 4 : 2;

  function updateSlider() {
    const slides = track.querySelectorAll('.carousel-slide');
    if (!slides.length) return;

    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, discontinuedProducts.length - visibleCards);

    if (currentIndex > maxIndex) currentIndex = 0;
    if (currentIndex < 0) currentIndex = maxIndex;

    // Medición exacta del ancho de tarjeta + gap de 14px
    const slideRect = slides[0].getBoundingClientRect();
    const stepSize = slideRect.width + 14;

    track.style.transform = `translateX(-${currentIndex * stepSize}px)`;
  }

  function nextSlide() {
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, discontinuedProducts.length - visibleCards);
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    updateSlider();
  }

  function prevSlide() {
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, discontinuedProducts.length - visibleCards);
    currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    updateSlider();
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });

  function startAutoplay() {
    // Pasa de 3500 (3.5s) a 5500 (5.5s)
    autoSlideTimer = setInterval(nextSlide, 5500);
  }

  function stopAutoplay() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  function resetTimer() {
    stopAutoplay();
    startAutoplay();
  }

  section.addEventListener('mouseenter', stopAutoplay);
  section.addEventListener('mouseleave', startAutoplay);

  window.addEventListener('resize', updateSlider);

  // Inicializar posición
  updateSlider();
  startAutoplay();
}

// Carga inicial
renderProducts(products);
initOutletCarousel();