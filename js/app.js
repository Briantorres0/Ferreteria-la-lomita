let cart = [];

// Elementos del DOM
const productsGrid = document.getElementById('products-grid');
const cartCount = document.getElementById('cart-count');
const cartBtn = document.getElementById('cart-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.getElementById('close-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartIvaTotal = document.getElementById('cart-iva-total');
const orderForm = document.getElementById('order-form');

// Modal Ficha Técnica
const productModalOverlay = document.getElementById('product-modal-overlay');
const closeProductModal = document.getElementById('close-product-modal');
const productModalContent = document.getElementById('product-modal-content');

// Elementos del Menú Lateral
const filterBtns = document.querySelectorAll('.sidebar .filter-btn');
const accordionHeaders = document.querySelectorAll('.accordion-header');
const subBtns = document.querySelectorAll('.sub-btn');

// Formato de moneda ARS con soporte para centavos
const formatPrice = (price) => {
  const num = Number(price) || 0;
  return new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2 
  }).format(num);
};

// Normalizador de texto para comparar categorías y subcategorías
const normalize = (text) => 
  (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// Renderizado de tarjetas de productos
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

    const ivaRate = product.iva !== undefined ? product.iva : 21;

    card.innerHTML = `
      <div class="img-wrapper" onclick="openProductModal(${product.id})">
        <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <span class="product-brand">${product.brand}</span>
        <h4 class="product-title" onclick="openProductModal(${product.id})">${product.name}</h4>
        <div class="price-tag-wrapper">
          <span class="product-price">${formatPrice(product.price)}</span>
          <span class="iva-badge">+ IVA (${ivaRate}%)</span>
        </div>
        <button class="add-btn" onclick="openProductModal(${product.id})">Descripción</button>
      </div>
    `;

    productsGrid.appendChild(card);
  });
}

// Abrir Modal de Ficha Técnica
window.openProductModal = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const ivaRate = product.iva !== undefined ? product.iva : 21;

  productModalContent.innerHTML = `
    <div class="modal-img-wrapper">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="modal-info">
      <span class="product-brand">${product.brand} · Garantía Oficial 6 Meses</span>
      <h3>${product.name}</h3>
      <div class="modal-price">
        ${formatPrice(product.price)} 
        <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">+ IVA (${ivaRate}%)</span>
      </div>
      <p class="modal-desc">${product.description}</p>
      
      <label style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted);">Especificaciones técnicas:</label>
      <ul class="specs-list">
        ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
      </ul>

      <button class="add-btn-primary" onclick="addToCart(${product.id})">
        Agregar al Carrito
      </button>
    </div>
  `;

  productModalOverlay.classList.add('active');
};

// Agregar al presupuesto
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
      price: product.price,
      iva: product.iva !== undefined ? product.iva : 21,
      brand: product.brand,
      quantity: 1
    });
  }

  productModalOverlay.classList.remove('active');
  updateCartUI();
  modalOverlay.classList.add('active');
};

// Quitar del presupuesto
window.removeFromCart = function(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
};

// Actualizar vista del carrito y cálculos de IVA
function updateCartUI() {
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.textContent = totalCount;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding: 20px 0;">No seleccionaste ninguna máquina aún.</p>';
    if (cartSubtotal) cartSubtotal.textContent = '$0';
    if (cartIvaTotal) cartIvaTotal.textContent = '$0';
    cartTotalPrice.textContent = '$0';
    return;
  }

  cartItemsContainer.innerHTML = '';
  let subtotalNeto = 0;
  let totalIva = 0;

  cart.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    const itemIva = itemSubtotal * (item.iva / 100);

    subtotalNeto += itemSubtotal;
    totalIva += itemIva;

    const itemEl = document.createElement('div');
    itemEl.classList.add('cart-item');
    itemEl.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${item.brand} · IVA ${item.iva}%</div>
        <div style="font-weight: 700; font-size: 0.85rem; margin-top: 2px;">
          ${item.quantity}x ${formatPrice(itemSubtotal)} <span style="font-size: 0.7rem; font-weight: normal; color: var(--text-muted);">(Neto)</span>
        </div>
      </div>
      <button style="background:none; border:none; color:#ef4444; font-size:1.4rem; cursor:pointer;" onclick="removeFromCart(${item.id})">&times;</button>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  const totalFinal = subtotalNeto + totalIva;

  if (cartSubtotal) cartSubtotal.textContent = formatPrice(subtotalNeto);
  if (cartIvaTotal) cartIvaTotal.textContent = formatPrice(totalIva);
  cartTotalPrice.textContent = formatPrice(totalFinal);
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

// Envío a WhatsApp con desglose de IVA y datos comerciales
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (cart.length === 0) return;

  const name = document.getElementById('customer-name').value;
  const location = document.getElementById('customer-location').value;
  const invoice = document.getElementById('invoice-type').value;
  
  // Reemplazar con el número oficial de atención de la ferretería
  const phone = "2244424335"; 

  let message = `🛠️ *NUEVO PEDIDO / COTIZACIÓN - FERRETERÍA LA LOMITA*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `👤 *Cliente:* ${name}\n`;
  message += `📍 *Destino del Envío:* ${location}\n`;
  message += `🧾 *Tipo de Factura:* ${invoice}\n\n`;
  message += `📦 *Maquinaria solicitada:*\n`;

  let subtotalNeto = 0;
  let totalIva = 0;

  cart.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    subtotalNeto += itemSubtotal;
    totalIva += itemSubtotal * (item.iva / 100);

    message += `• ${item.name} x${item.quantity} ➔ ${formatPrice(itemSubtotal)} (+${item.iva}% IVA)\n`;
  });

  const totalFinal = subtotalNeto + totalIva;

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔹 *Subtotal Neto:* ${formatPrice(subtotalNeto)}\n`;
  message += `🔹 *IVA Estimado:* ${formatPrice(totalIva)}\n`;
  message += `💰 *TOTAL ESTIMADO (c/ IVA):* ${formatPrice(totalFinal)}\n\n`;
  message += `_Hola! Quería consultar disponibilidad de stock y coordinar el envío a mi localidad._`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
});

// Limpieza de estados visuales en el sidebar
function clearAllActiveStates() {
  filterBtns.forEach(btn => btn.classList.remove('active'));
  accordionHeaders.forEach(btn => btn.classList.remove('active'));
  subBtns.forEach(btn => btn.classList.remove('active'));
}

// 1. Botones simples (Todos, Outlet, Lubricantes)
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    clearAllActiveStates();
    btn.classList.add('active');

    // Cierra todos los acordeones desplegados
    document.querySelectorAll('.accordion').forEach(acc => acc.classList.remove('open'));

    const category = btn.getAttribute('data-category');
    if (category === 'todos') {
      renderProducts(products);
    } else {
      renderProducts(products.filter(p => normalize(p.category) === normalize(category)));
    }
  });
});

// 2. Encabezados de categorías padre con acordeón
accordionHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const parentAccordion = header.closest('.accordion');

    // Cierra los demás acordeones abiertos
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

// 3. Botones de subcategorías internas
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

// Carga inicial
renderProducts(products);

// Control del Menú Desplegable Lateral en Móviles
const openSidebarBtn = document.getElementById('open-sidebar-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');

function openMobileSidebar() {
  sidebar.classList.add('mobile-open');
  sidebarBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden'; // Bloquea el scroll de la web de fondo
}

function closeMobileSidebar() {
  sidebar.classList.remove('mobile-open');
  sidebarBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

if (openSidebarBtn) openSidebarBtn.addEventListener('click', openMobileSidebar);
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeMobileSidebar);
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

// Auto-cerrar el sidebar en celular tras hacer clic en una categoría o subcategoría
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