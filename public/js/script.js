/**
 * Product Catalog Frontend Script
 * 
 * Handles:
 * - Loading and displaying products
 * - Bilingual interface (Arabic/English)
 * - Sorting and filtering
 * - Logo display
 */

// Current language (default: English)
let currentLanguage = 'en';

// All products data
let allProducts = [];

// Translations object for bilingual support
const translations = {
    en: {
        loadingProducts: 'Loading products...',
        noProducts: 'No products found',
        allBrands: 'All Brands',
        sar: 'SAR',
        searchPlaceholder: 'Search...'
    },
    ar: {
        loadingProducts: 'جاري تحميل المنتجات...',
        noProducts: 'لم يتم العثور على منتجات',
        allBrands: 'جميع العلامات التجارية',
        sar: 'ر.س',
        searchPlaceholder: 'بحث...'
    }
};

/**
 * Initialize the page
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Load settings (logo)
    await loadSettings();
    
    // Load products
    await loadProducts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Apply default language
    switchLanguage('en');
});

/**
 * Load company settings (logo)
 */
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        
        if (settings.logo) {
            const logoImg = document.getElementById('companyLogo');
            const printLogo = document.getElementById('printLogo');
            
            logoImg.src = settings.logo;
            logoImg.style.display = 'block';
            
            printLogo.src = settings.logo;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

/**
 * Load all products from API
 */
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        
        // Hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        
        if (allProducts.length === 0) {
            document.getElementById('noProductsMessage').style.display = 'block';
        } else {
            // Populate brand filter
            populateBrandFilter();
            
            // Display products
            displayProducts(allProducts);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('noProductsMessage').style.display = 'block';
    }
}

/**
 * Populate brand filter dropdown
 */
function populateBrandFilter() {
    const brandFilter = document.getElementById('brandFilter');
    
    // Get unique brands based on current language
    const brands = new Set();
    allProducts.forEach(product => {
        const brand = currentLanguage === 'en' ? product.brand_en : product.brand_ar;
        if (brand) brands.add(brand);
    });
    
    // Clear existing options except "All Brands"
    brandFilter.innerHTML = '<option value="">' + 
        (currentLanguage === 'en' ? 'All Brands' : 'جميع العلامات التجارية') + 
        '</option>';
    
    // Add brand options
    [...brands].sort().forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

/**
 * Display products in the grid
 */
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
    
    if (products.length === 0) {
        document.getElementById('noProductsMessage').style.display = 'block';
        return;
    }
    
    document.getElementById('noProductsMessage').style.display = 'none';
    
    products.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3';
        
        const name = currentLanguage === 'en' ? product.name_en : product.name_ar;
        const brand = currentLanguage === 'en' ? product.brand_en : product.brand_ar;
        const description = currentLanguage === 'en' ? product.description_en : product.description_ar;
        const currency = translations[currentLanguage].sar;
        
        col.innerHTML = `
            <div class="card product-card">
                <div class="product-image-container">
                    ${product.imageUrl ? 
                        `<img src="${product.imageUrl}" class="card-img-top product-image" alt="${name}" onerror="this.parentElement.innerHTML='<div class=\\'no-image\\'><i class=\\'bi bi-image\\'></i></div>'">` :
                        `<div class="no-image"><i class="bi bi-image"></i></div>`
                    }
                </div>
                <div class="card-body">
                    <p class="product-code mb-2">${product.code || ''}</p>
                    <h5 class="product-name mb-2">${name || 'N/A'}</h5>
                    <p class="product-brand mb-2">${brand || ''}</p>
                    <h4 class="product-price mb-2">${product.price.toFixed(2)} ${currency}</h4>
                    ${description ? `<p class="product-description">${description}</p>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
}

/**
 * Filter and sort products based on current selections
 */
function filterAndSortProducts() {
    let filtered = [...allProducts];
    
    // Apply brand filter
    const brandFilter = document.getElementById('brandFilter').value;
    if (brandFilter) {
        filtered = filtered.filter(product => {
            const brand = currentLanguage === 'en' ? product.brand_en : product.brand_ar;
            return brand === brandFilter;
        });
    }
    
    // Apply search filter
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(product => {
            const name = currentLanguage === 'en' ? product.name_en : product.name_ar;
            const brand = currentLanguage === 'en' ? product.brand_en : product.brand_ar;
            const code = product.code || '';
            
            return name.toLowerCase().includes(searchTerm) ||
                   brand.toLowerCase().includes(searchTerm) ||
                   code.toLowerCase().includes(searchTerm);
        });
    }
    
    // Apply sorting
    const sortBy = document.getElementById('sortBy').value;
    filtered = sortProducts(filtered, sortBy);
    
    // Display filtered and sorted products
    displayProducts(filtered);
}

/**
 * Sort products based on selected criteria
 */
function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'name':
            sorted.sort((a, b) => {
                const nameA = currentLanguage === 'en' ? a.name_en : a.name_ar;
                const nameB = currentLanguage === 'en' ? b.name_en : b.name_ar;
                return nameA.localeCompare(nameB, currentLanguage === 'ar' ? 'ar' : 'en');
            });
            break;
            
        case 'brand':
            sorted.sort((a, b) => {
                const brandA = currentLanguage === 'en' ? a.brand_en : a.brand_ar;
                const brandB = currentLanguage === 'en' ? b.brand_en : b.brand_ar;
                return brandA.localeCompare(brandB, currentLanguage === 'ar' ? 'ar' : 'en');
            });
            break;
            
        case 'price-asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
            
        case 'price-desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
    }
    
    return sorted;
}

/**
 * Switch interface language
 */
function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update button states
    document.getElementById('btnEn').className = lang === 'en' ? 'btn btn-light' : 'btn btn-outline-light';
    document.getElementById('btnAr').className = lang === 'ar' ? 'btn btn-light' : 'btn btn-outline-light';
    
    // Update all translatable elements
    document.querySelectorAll('[data-lang-en]').forEach(element => {
        const text = element.getAttribute(`data-lang-${lang}`);
        if (text) {
            // Check if it's a title
            if (element.tagName === 'TITLE') {
                element.textContent = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    // Update placeholders
    const searchInput = document.getElementById('searchInput');
    searchInput.placeholder = searchInput.getAttribute(`data-placeholder-${lang}`);
    
    // Update option texts in selects
    document.querySelectorAll('option[data-lang-en]').forEach(option => {
        const text = option.getAttribute(`data-lang-${lang}`);
        if (text) option.textContent = text;
    });
    
    // Repopulate brand filter with current language
    populateBrandFilter();
    
    // Re-display products with current language
    filterAndSortProducts();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Brand filter change
    document.getElementById('brandFilter').addEventListener('change', filterAndSortProducts);
    
    // Sort change
    document.getElementById('sortBy').addEventListener('change', filterAndSortProducts);
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', filterAndSortProducts);
}

// Make switchLanguage available globally
window.switchLanguage = switchLanguage;
