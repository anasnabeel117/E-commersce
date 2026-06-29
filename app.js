/**
 * Capstone Storefront Modular Architecture Engine
 * Handles decoupled Client-Side Hash Routing, Core REST fetches, and persistent State Management.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Application Architecture State Management ---
    let catalogProducts = [];
    let customerCart = JSON.parse(localStorage.getItem('TECH_STORE_CART')) || [];
    
    const viewPortal = document.getElementById('view-portal');
    const cartCounter = document.getElementById('cart-counter');

    // ==========================================================================
    // 1. CLIENT ROUTING ENGINE SYSTEM
    // ==========================================================================
    const appRouter = async () => {
        const routePath = window.location.hash || '#/';
        
        // Router View Switching Matrix
        if (routePath === '#/') {
            await renderCatalogView();
        } else if (routePath === '#/cart') {
            renderCartView();
        } else {
            viewPortal.innerHTML = `<section><h2>404 Component Not Found</h2><a href="#/">Return to Storefront</a></section>`;
        }
        updateGlobalCartBadge();
    };

    // Bind Router Event Listeners to routing hash change streams
    window.addEventListener('hashchange', appRouter);

    // ==========================================================================
    // 2. DATA ACQUISITION CONTROLLER (Asynchronous Fetch Operations)
    // ==========================================================================
    const fetchCatalogData = async () => {
        if (catalogProducts.length > 0) return catalogProducts; // Return cached data if already loaded
        
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            if (!response.ok) throw new Error('API platform encountered unexpected runtime connectivity degradation.');
            catalogProducts = await response.json();
            return catalogProducts;
        } catch (error) {
            console.error('Core data acquisition exception:', error);
            return [];
        }
    };

    // ==========================================================================
    // 3. UI VIEW RENDERING LIFECYCLES
    // ==========================================================================
    
    // View A: Main Storefront Catalog View
    const renderCatalogView = async () => {
        viewPortal.innerHTML = `<div class="app-spinner" role="status"></div>`;
        const products = await fetchCatalogData();

        if (products.length === 0) {
            viewPortal.innerHTML = `<p class="error-msg">Failed to resolve products registry context. Please try reloading.</p>`;
            return;
        }

        viewPortal.innerHTML = `
            <div class="catalog-controls">
                <input type="search" id="product-search" class="search-field" placeholder="Search catalog collection..." aria-label="Search items">
            </div>
            <div id="grid-mount" class="product-matrix"></div>
        `;

        const gridMount = document.getElementById('grid-mount');
        const searchField = document.getElementById('product-search');

        // Functional Layout Generation Callback mapping values safely to the Viewport
        const displayGrid = (items) => {
            gridMount.innerHTML = items.map(item => `
                <article class="product-card" data-id="${item.id}">
                    <div class="img-container">
                        <img src="${item.image}" alt="${item.title} item preview showcase visual asset.">
                    </div>
                    <div class="card-details">
                        <h3>${escapeText(item.title)}</h3>
                        <p class="card-price">$${item.price.toFixed(2)}</p>
                        <button class="btn-add-cart" data-id="${item.id}">Add To Cart</button>
                    </div>
                </article>
            `).join('');
        };

        // Initialize Primary Static Display
        displayGrid(products);

        // Instant Dynamic Character Sequence Search Match Handler
        searchField.addEventListener('input', (e) => {
            const matchToken = e.target.value.toLowerCase();
            const matchingHits = products.filter(p => p.title.toLowerCase().includes(matchToken));
            displayGrid(matchingHits);
        });
    };

    // View B: Dynamic Shopping Cart View
    const renderCartView = () => {
        if (customerCart.length === 0) {
            viewPortal.innerHTML = `
                <div class="cart-view">
                    <h2>Your Basket is Empty</h2>
                    <p style="margin-top: 1rem;"><a href="#/" style="color: var(--brand-accent)">Return to Storefront catalog to select items.</a></p>
                </div>
            `;
            return;
        }

        const cumulativeCartValue = customerCart.reduce((acc, currentItem) => acc + currentItem.price, 0);

        viewPortal.innerHTML = `
            <div class="cart-view">
                <h2>Your Shopping Cart Manifest</h2>
                <div class="cart-items-list" id="cart-items-mount">
                    ${customerCart.map((item, index) => `
                        <div class="cart-item">
                            <div class="cart-item-info">
                                <h4>${escapeText(item.title)}</h4>
                                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                            </div>
                            <button class="btn-remove" data-index="${index}">Remove</button>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-summary-panel">
                    Total Due: $${cumulativeCartValue.toFixed(2)}
                </div>
            </div>
        `;
    };

    // ==========================================================================
    // 4. TRANSACTION ENGINE STATE INTERACTIONS (Event Delegations)
    // ==========================================================================
    
    // Intercept catalog insertion events
    viewPortal.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-add-cart')) return;
        const productId = parseInt(e.target.dataset.id);
        const resolvedMatch = catalogProducts.find(p => p.id === productId);
        
        if (resolvedMatch) {
            customerCart.push(resolvedMatch);
            commitCartStateMutation();
        }
    });

    // Intercept item removal events inside the Cart view
    viewPortal.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-remove')) return;
        const indexTarget = parseInt(e.target.dataset.index);
        customerCart.splice(indexTarget, 1);
        commitCartStateMutation();
        renderCartView(); // Re-render cart changes immediately
    });

    // Sync state mutations to physical client storage
    const commitCartStateMutation = () => {
        localStorage.setItem('TECH_STORE_CART', JSON.stringify(customerCart));
        updateGlobalCartBadge();
    };

    const updateGlobalCartBadge = () => {
        cartCounter.textContent = customerCart.length;
    };

    // Secondary XSS Protection Escaping Logic Pipeline
    function escapeText(text) {
        return text.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    // --- Execute Core Application Startup Boot Pipeline ---
    appRouter();
});
