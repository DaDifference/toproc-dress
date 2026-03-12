/* =============================================
   TOPROC DRESS - Products Module
   カラーミーショップ「どこでもカラーミー」連携
   ============================================= */

const COLORME_SHOP_DOMAIN = 'toprocdress.shop-pro.jp';
const COLORME_SHOP_ID = 'PA01264773';

const ProductManager = {
  products: [],
  currentCategory: 'ALL',
  currentAvailability: 'ALL',

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

    if (this.currentAvailability === 'AVAILABLE') {
      filtered = filtered.filter(p => !p.soldout);
    } else if (this.currentAvailability === 'SOLDOUT') {
      filtered = filtered.filter(p => p.soldout);
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

    const soldoutOverlay = product.soldout
      ? '<div class="product-card-soldout"><span>SOLD OUT</span></div>'
      : '';

    const priceClass = product.price === null ? 'product-card-price no-price' : 'product-card-price';

    const productUrl = this.getProductUrl(product);
    const cartUrl = this.getCartUrl(product);

    // Buy button: disabled for sold out or no-price items
    let buyButton = '';
    if (product.soldout) {
      buyButton = '<button class="btn-cart btn-cart-disabled" disabled>SOLD OUT</button>';
    } else if (product.price === null) {
      buyButton = '<button class="btn-cart btn-cart-disabled" disabled>COMING SOON</button>';
    } else if (cartUrl) {
      buyButton = `<a href="${cartUrl}" class="btn-cart" target="_blank" rel="noopener">ADD TO CART</a>`;
    }

    // Detail link: wraps image area
    const imageLink = productUrl
      ? `<a href="${productUrl}" target="_blank" rel="noopener" class="product-card-image-link">`
      : '<div class="product-card-image-link">';
    const imageLinkClose = productUrl ? '</a>' : '</div>';

    card.innerHTML = `
      ${imageLink}
        <div class="product-card-image">
          <img src="${product.image}" alt="${product.name}${product.color ? ' - ' + product.color : ''}" loading="lazy">
          ${soldoutOverlay}
        </div>
      ${imageLinkClose}
      <div class="product-card-info">
        <div class="product-card-name">${product.name}</div>
        ${product.color ? `<div class="product-card-color">${product.color}</div>` : ''}
        <div class="${priceClass}">${this.formatPrice(product.price)}</div>
        ${buyButton}
      </div>
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

    // Trigger reveal animation
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
    // Show newest non-soldout first, then fill with soldout
    const available = this.products.filter(p => !p.soldout);
    const soldout = this.products.filter(p => p.soldout);
    const featured = [...available, ...soldout].slice(0, maxItems);
    this.renderGrid(container, featured, true);
  },

  updateCount(countEl) {
    const filtered = this.getFiltered();
    const total = this.products.length;
    if (this.currentCategory === 'ALL' && this.currentAvailability === 'ALL') {
      countEl.textContent = `${total} items`;
    } else {
      countEl.textContent = `${filtered.length} / ${total} items`;
    }
  }
};

// --- Products Page Logic ---
document.addEventListener('DOMContentLoaded', async () => {
  const productGrid = document.getElementById('product-grid');
  const featuredGrid = document.getElementById('featured-grid');
  const filterBar = document.querySelector('.filter-bar');
  const availabilityFilter = document.querySelector('.availability-filter');
  const productCount = document.querySelector('.product-count');

  await ProductManager.init();

  // Featured grid (index page)
  if (featuredGrid) {
    ProductManager.renderFeatured(featuredGrid, 6);
  }

  // Full product grid (products page)
  if (productGrid) {
    const filtered = ProductManager.getFiltered();
    ProductManager.renderGrid(productGrid, filtered);
    if (productCount) ProductManager.updateCount(productCount);
  }

  // Category filter
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      ProductManager.currentCategory = btn.dataset.category;
      const filtered = ProductManager.getFiltered();
      ProductManager.renderGrid(productGrid, filtered);
      if (productCount) ProductManager.updateCount(productCount);
    });
  }

  // Availability filter
  if (availabilityFilter) {
    availabilityFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('.availability-btn');
      if (!btn) return;

      availabilityFilter.querySelectorAll('.availability-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      ProductManager.currentAvailability = btn.dataset.availability;
      const filtered = ProductManager.getFiltered();
      ProductManager.renderGrid(productGrid, filtered);
      if (productCount) ProductManager.updateCount(productCount);
    });
  }
});
