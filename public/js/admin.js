/**
 * Admin Panel Frontend Script
 * 
 * Handles:
 * - Admin authentication
 * - Product CRUD operations
 * - Excel import
 * - Logo upload
 * - Bilingual interface (Arabic/English)
 */

// Current language (default: English)
let currentLanguage = 'en';

// Current products
let products = [];

// Bootstrap modal instances
let loginModal;
let addProductModal;
let importExcelModal;

/**
 * Initialize the page
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Bootstrap modals
    loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    addProductModal = new bootstrap.Modal(document.getElementById('addProductModal'));
    importExcelModal = new bootstrap.Modal(document.getElementById('importExcelModal'));
    
    // Check authentication status
    checkAuth();
    
    // Set up form event listeners
    setupEventListeners();
    
    // Apply default language
    switchLanguage('en');
});

/**
 * Check if user is authenticated
 */
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (data.authenticated) {
            showMainContent(data.username);
        } else {
            loginModal.show();
        }
    } catch (error) {
        console.error('Error checking auth:', error);
        loginModal.show();
    }
}

/**
 * Show main content after successful login
 */
async function showMainContent(username) {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('welcomeMessage').textContent = 
        (currentLanguage === 'en' ? 'Welcome, ' : 'مرحباً، ') + username;
    
    loginModal.hide();
    
    // Load data
    await loadProducts();
    await loadSettings();
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMainContent(data.username);
        } else {
            errorDiv.textContent = currentLanguage === 'en' ? 
                'Invalid username or password' : 
                'اسم المستخدم أو كلمة المرور غير صحيحة';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = currentLanguage === 'en' ? 
            'Login failed. Please try again.' : 
            'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.';
        errorDiv.style.display = 'block';
    }
}

/**
 * Logout user
 */
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/**
 * Load all products
 */
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showAlert('danger', currentLanguage === 'en' ? 
            'Failed to load products' : 
            'فشل تحميل المنتجات');
    }
}

/**
 * Display products in table
 */
function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
    const noProducts = document.getElementById('noProducts');
    
    if (products.length === 0) {
        tbody.innerHTML = '';
        noProducts.style.display = 'block';
        return;
    }
    
    noProducts.style.display = 'none';
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.code || ''}</td>
            <td>${product.name_en || ''}</td>
            <td dir="rtl">${product.name_ar || ''}</td>
            <td>${currentLanguage === 'en' ? product.brand_en : product.brand_ar}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>
                ${product.imageUrl ? 
                    `<img src="${product.imageUrl}" class="product-thumbnail" alt="${product.name_en}">` :
                    '<i class="bi bi-image text-muted"></i>'
                }
            </td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary btn-action" onclick="editProduct(${product.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Open add product modal
 */
function openAddProductModal() {
    // Reset form
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModalTitle').textContent = 
        currentLanguage === 'en' ? 'Add Product' : 'إضافة منتج';
    
    addProductModal.show();
}

/**
 * Edit product
 */
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Fill form with product data
    document.getElementById('productId').value = product.id;
    document.getElementById('productCode').value = product.code || '';
    document.getElementById('productNameEn').value = product.name_en || '';
    document.getElementById('productNameAr').value = product.name_ar || '';
    document.getElementById('productBrandEn').value = product.brand_en || '';
    document.getElementById('productBrandAr').value = product.brand_ar || '';
    document.getElementById('productPrice').value = product.price || 0;
    document.getElementById('productDescEn').value = product.description_en || '';
    document.getElementById('productDescAr').value = product.description_ar || '';
    document.getElementById('productImageUrl').value = product.imageUrl || '';
    
    document.getElementById('productModalTitle').textContent = 
        currentLanguage === 'en' ? 'Edit Product' : 'تعديل المنتج';
    
    addProductModal.show();
}

/**
 * Save product (add or update)
 */
async function saveProduct() {
    const productId = document.getElementById('productId').value;
    const isEdit = productId !== '';
    
    const productData = {
        code: document.getElementById('productCode').value,
        name_en: document.getElementById('productNameEn').value,
        name_ar: document.getElementById('productNameAr').value,
        brand_en: document.getElementById('productBrandEn').value,
        brand_ar: document.getElementById('productBrandAr').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description_en: document.getElementById('productDescEn').value,
        description_ar: document.getElementById('productDescAr').value,
        imageUrl: document.getElementById('productImageUrl').value
    };
    
    try {
        const url = isEdit ? `/api/products/${productId}` : '/api/products';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            addProductModal.hide();
            showAlert('success', data.message);
            await loadProducts();
        } else {
            showAlert('danger', data.error || 
                (currentLanguage === 'en' ? 'Failed to save product' : 'فشل حفظ المنتج'));
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showAlert('danger', currentLanguage === 'en' ? 
            'Failed to save product' : 
            'فشل حفظ المنتج');
    }
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
    const confirmMessage = currentLanguage === 'en' ? 
        'Are you sure you want to delete this product?' : 
        'هل أنت متأكد من حذف هذا المنتج؟';
    
    if (!confirm(confirmMessage)) return;
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('success', data.message);
            await loadProducts();
        } else {
            showAlert('danger', data.error || 
                (currentLanguage === 'en' ? 'Failed to delete product' : 'فشل حذف المنتج'));
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showAlert('danger', currentLanguage === 'en' ? 
            'Failed to delete product' : 
            'فشل حذف المنتج');
    }
}

/**
 * Import products from Excel
 */
async function importExcel() {
    const fileInput = document.getElementById('excelFile');
    const folderId = document.getElementById('folderId').value;
    
    if (!fileInput.files[0]) {
        alert(currentLanguage === 'en' ? 'Please select a file' : 'يرجى اختيار ملف');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    if (folderId) {
        formData.append('folderId', folderId);
    }
    
    // Show progress
    document.getElementById('importProgress').style.display = 'block';
    
    try {
        const response = await fetch('/api/import-excel', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        document.getElementById('importProgress').style.display = 'none';
        
        if (data.success) {
            importExcelModal.hide();
            showAlert('success', data.message);
            await loadProducts();
            
            // Reset form
            document.getElementById('excelImportForm').reset();
        } else {
            showAlert('danger', data.error || 
                (currentLanguage === 'en' ? 'Import failed' : 'فشل الاستيراد'));
        }
    } catch (error) {
        console.error('Error importing Excel:', error);
        document.getElementById('importProgress').style.display = 'none';
        showAlert('danger', currentLanguage === 'en' ? 
            'Import failed' : 
            'فشل الاستيراد');
    }
}

/**
 * Load settings (logo)
 */
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        
        const container = document.getElementById('currentLogoContainer');
        
        if (settings.logo) {
            container.innerHTML = `
                <img src="${settings.logo}" alt="Company Logo" style="max-width: 300px; max-height: 200px;">
            `;
        } else {
            container.innerHTML = `
                <p class="text-muted">${currentLanguage === 'en' ? 'No logo uploaded' : 'لم يتم تحميل شعار'}</p>
            `;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

/**
 * Upload logo
 */
async function uploadLogo(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('logoFile');
    
    if (!fileInput.files[0]) {
        alert(currentLanguage === 'en' ? 'Please select an image' : 'يرجى اختيار صورة');
        return;
    }
    
    const formData = new FormData();
    formData.append('logo', fileInput.files[0]);
    
    try {
        const response = await fetch('/api/logo', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('success', data.message);
            await loadSettings();
            
            // Reset form
            document.getElementById('logoUploadForm').reset();
        } else {
            showAlert('danger', data.error || 
                (currentLanguage === 'en' ? 'Upload failed' : 'فشل التحميل'));
        }
    } catch (error) {
        console.error('Error uploading logo:', error);
        showAlert('danger', currentLanguage === 'en' ? 
            'Upload failed' : 
            'فشل التحميل');
    }
}

/**
 * Show alert message
 */
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
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
    document.getElementById('btnEn').className = lang === 'en' ? 
        'btn btn-sm btn-light' : 'btn btn-sm btn-outline-light';
    document.getElementById('btnAr').className = lang === 'ar' ? 
        'btn btn-sm btn-light' : 'btn btn-sm btn-outline-light';
    
    // Update all translatable elements
    document.querySelectorAll('[data-lang-en]').forEach(element => {
        const text = element.getAttribute(`data-lang-${lang}`);
        if (text) {
            if (element.tagName === 'TITLE') {
                element.textContent = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    // Update welcome message if logged in
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg.textContent) {
        const username = welcomeMsg.textContent.split(',')[1]?.trim() || 
                        welcomeMsg.textContent.split('،')[1]?.trim();
        if (username) {
            welcomeMsg.textContent = (lang === 'en' ? 'Welcome, ' : 'مرحباً، ') + username;
        }
    }
    
    // Re-display products
    displayProducts();
    
    // Update settings display
    loadSettings();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logo upload form
    document.getElementById('logoUploadForm').addEventListener('submit', uploadLogo);
    
    // Add product button (in modal footer)
    // Note: saveProduct is called via onclick in HTML
}

// Make functions available globally
window.logout = logout;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.saveProduct = saveProduct;
window.importExcel = importExcel;
window.switchLanguage = switchLanguage;
