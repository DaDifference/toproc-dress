/* =============================================
   TOPROC DRESS — Products Module
   カラーミーショップ連携
   ============================================= */

const COLORME_SHOP_DOMAIN = 'toprocdress.shop-pro.jp';
const COLORME_SHOP_ID = 'PA01264773';

const ProductManager = {
  products: [],
  showInStockOnly: false,
  showColorVariations: false,
  currentCategory: 'ALL',
  currentView: 'item',
  currentCols: 3,

  async init() {
    try {
      const res = await fetch('data/products.json');
      this.products = await res.json();
    } catch {
      this.products = [];
    }
  },

  getFiltered() {
    let filtered = [...this.products];

    if (this.currentCategory !== 'ALL') {
      filtered = filtered.filter(p => p.category === this.currentCategory);
    }

    if (this.showInStockOnly) {
      filtered = filtered.filter(p => !p.soldout && p.price !== null);
    }

    if (!this.showColorVariations) {
      const seen = new Set();
      filtered = filtered.filter(p => {
        if (seen.has(p.name)) return false;
        seen.add(p.name);
        return true;
      });
    }

    return filtered;
  },

  formatPrice(price) {
    if (price === null) return 'PRICE TBA';
    return '¥' + price.toLocaleString('ja-JP') + ' (tax incl.)';
  },

  getProductUrl(product) {
    if (!product.shopProId) return null;
    return `http://${COLORME_SHOP_DOMAIN}/?pid=${product.shopProId}`;
  },

  getCartUrl(product) {
    if (!product.shopProId) return null;
    return `https://${COLORME_SHOP_DOMAIN}/cart?pid=${product.shopProId}&num=1`;
  },

  createCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card reveal';

    const productUrl = this.getProductUrl(product);
    const imageLink = productUrl
      ? `<a href="${productUrl}" target="_blank" rel="noopener" class="product-card-image-link">`
      : '<div class="product-card-image-link">';
    const imageLinkClose = productUrl ? '</a>' : '</div>';

    let statusLabel = '';
    if (product.soldout) {
      statusLabel = '<span class="product-card-status">SOLD OUT</span>';
    } else if (product.price === null) {
      statusLabel = '<span class="product-card-status">Coming soon</span>';
    }

    card.innerHTML = `
      ${imageLink}
        ${statusLabel}
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      ${imageLinkClose}
      <div class="product-card-name">${product.name}</div>
    `;

    return card;
  },

  renderGrid(container, products, isFeatured = false) {
    container.innerHTML = '';

    if (products.length === 0) {
      container.innerHTML = '<div class="empty-state">No products found.</div>';
      return;
    }

    if (isFeatured) {
      container.classList.add('featured');
    }

    products.forEach(product => {
      container.appendChild(this.createCard(product));
    });

    requestAnimationFrame(() => {
      const cards = container.querySelectorAll('.product-card.reveal');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      cards.forEach(card => observer.observe(card));
    });
  },

  renderFeatured(container, maxItems = 6) {
    const available = this.products.filter(p => !p.soldout);
    const soldout = this.products.filter(p => p.soldout);
    const featured = [...available, ...soldout].slice(0, maxItems);
    this.renderGrid(container, featured, true);
  },

  updateCount(countEl) {
    const filtered = this.getFiltered();
    const total = this.products.length;
    countEl.textContent = `${filtered.length} items`;
  }
};

// --- Products Page Logic ---
document.addEventListener('DOMContentLoaded', async () => {
  const productGrid = document.getElementById('product-grid');
  const featuredGrid = document.getElementById('featured-grid');
  const productCount = document.querySelector('.product-count');

  await ProductManager.init();

  // Read category from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    ProductManager.currentCategory = categoryParam;
  }

  if (featuredGrid) {
    ProductManager.renderFeatured(featuredGrid, 6);
  }

  function refreshGrid() {
    if (!productGrid) return;
    const filtered = ProductManager.getFiltered();
    ProductManager.renderGrid(productGrid, filtered);
    if (productCount) ProductManager.updateCount(productCount);
  }

  if (productGrid) {
    refreshGrid();
  }

  // --- In Stock filter ---
  const instockCheckbox = document.getElementById('filter-instock');
  if (instockCheckbox) {
    instockCheckbox.addEventListener('change', () => {
      ProductManager.showInStockOnly = instockCheckbox.checked;
      refreshGrid();
    });
  }

  // --- Color Variations filter ---
  const colorvarCheckbox = document.getElementById('filter-colorvar');
  if (colorvarCheckbox) {
    colorvarCheckbox.addEventListener('change', () => {
      ProductManager.showColorVariations = colorvarCheckbox.checked;
      refreshGrid();
    });
  }

  // --- View toggle (Item / Image) ---
  const viewToggle = document.querySelector('.view-toggle');
  if (viewToggle) {
    viewToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-toggle-btn');
      if (!btn) return;

      viewToggle.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ProductManager.currentView = btn.dataset.view;
      refreshGrid();
    });
  }

  // --- Grid columns toggle (3 / 4) ---
  const gridToggle = document.querySelector('.grid-toggle');
  if (gridToggle && productGrid) {
    gridToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.grid-toggle-btn');
      if (!btn) return;

      gridToggle.querySelectorAll('.grid-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cols = parseInt(btn.dataset.cols, 10);
      ProductManager.currentCols = cols;
      productGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    });
  }
});
