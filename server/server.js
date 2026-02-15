/**
 * Product Catalog Server
 * 
 * Express server with REST API for product management, admin authentication,
 * logo upload, Excel import, and Google Drive image integration.
 * 
 * DEFAULT ADMIN CREDENTIALS:
 * Username: admin
 * Password: admin123
 */

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs').promises;
const path = require('path');
const { findImageByCode } = require('./googleDrive');

const app = express();
const PORT = process.env.PORT || 3000;

// Paths to data files
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Ensure uploads directory exists
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Session configuration
app.use(session({
  secret: 'product-catalog-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// Multer storage configuration for logo uploads
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadLogo = multer({ 
  storage: logoStorage,
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Multer storage for Excel file uploads
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'excel-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadExcel = multer({ 
  storage: excelStorage,
  fileFilter: (req, file, cb) => {
    // Accept Excel files only
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls, .csv) are allowed!'), false);
    }
  }
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Middleware to check if user is authenticated
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Read products from JSON file
 */
async function readProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

/**
 * Write products to JSON file
 */
async function writeProducts(products) {
  try {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing products:', error);
    return false;
  }
}

/**
 * Read settings from JSON file
 */
async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings:', error);
    return { logo: null };
  }
}

/**
 * Write settings to JSON file
 */
async function writeSettings(settings) {
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing settings:', error);
    return false;
  }
}

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * POST /api/login
 * Admin login endpoint
 * Body: { username, password }
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Default admin credentials
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAuthenticated = true;
    req.session.username = username;
    res.json({ 
      success: true, 
      message: 'Login successful',
      username: username
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials' 
    });
  }
});

/**
 * POST /api/logout
 * Admin logout endpoint
 */
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
    } else {
      res.json({ success: true, message: 'Logout successful' });
    }
  });
});

/**
 * GET /api/check-auth
 * Check if user is authenticated
 */
app.get('/api/check-auth', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    res.json({ 
      authenticated: true,
      username: req.session.username
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ============================================
// PRODUCT ROUTES
// ============================================

/**
 * GET /api/products
 * Get all products (public endpoint)
 */
app.get('/api/products', async (req, res) => {
  try {
    const products = await readProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * POST /api/products
 * Add a new product (protected)
 * Body: { code, name_en, name_ar, brand_en, brand_ar, price, description_en, description_ar, imageUrl }
 */
app.post('/api/products', requireAuth, async (req, res) => {
  try {
    const products = await readProducts();
    
    // Generate new ID
    const newId = products.length > 0 
      ? Math.max(...products.map(p => p.id)) + 1 
      : 1;

    const newProduct = {
      id: newId,
      code: req.body.code || '',
      name_en: req.body.name_en || '',
      name_ar: req.body.name_ar || '',
      brand_en: req.body.brand_en || '',
      brand_ar: req.body.brand_ar || '',
      price: parseFloat(req.body.price) || 0,
      description_en: req.body.description_en || '',
      description_ar: req.body.description_ar || '',
      imageUrl: req.body.imageUrl || ''
    };

    products.push(newProduct);
    await writeProducts(products);

    res.json({ 
      success: true, 
      message: 'Product added successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

/**
 * PUT /api/products/:id
 * Update an existing product (protected)
 */
app.put('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const products = await readProducts();
    
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update product
    products[index] = {
      ...products[index],
      code: req.body.code || products[index].code,
      name_en: req.body.name_en || products[index].name_en,
      name_ar: req.body.name_ar || products[index].name_ar,
      brand_en: req.body.brand_en || products[index].brand_en,
      brand_ar: req.body.brand_ar || products[index].brand_ar,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : products[index].price,
      description_en: req.body.description_en !== undefined ? req.body.description_en : products[index].description_en,
      description_ar: req.body.description_ar !== undefined ? req.body.description_ar : products[index].description_ar,
      imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : products[index].imageUrl
    };

    await writeProducts(products);

    res.json({ 
      success: true, 
      message: 'Product updated successfully',
      product: products[index]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product (protected)
 */
app.delete('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const products = await readProducts();
    
    const filteredProducts = products.filter(p => p.id !== productId);
    
    if (filteredProducts.length === products.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await writeProducts(filteredProducts);

    res.json({ 
      success: true, 
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============================================
// EXCEL IMPORT ROUTE
// ============================================

/**
 * POST /api/import-excel
 * Import products from Excel file (protected)
 * The Excel file should contain columns: code, name_en, name_ar, brand_en, brand_ar, price, description_en, description_ar
 * Images are automatically resolved from Google Drive based on product code
 */
app.post('/api/import-excel', requireAuth, uploadExcel.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    // Get Google Drive folder ID from request (optional)
    const folderId = req.body.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    const products = await readProducts();
    let importedCount = 0;
    let skippedCount = 0;

    // Generate new IDs starting from max existing ID
    let nextId = products.length > 0 
      ? Math.max(...products.map(p => p.id)) + 1 
      : 1;

    for (const row of data) {
      try {
        // Skip if required fields are missing
        if (!row.code) {
          skippedCount++;
          continue;
        }

        // Try to find image from Google Drive if folder ID is provided
        let imageUrl = row.imageUrl || '';
        if (folderId && row.code && !imageUrl) {
          const foundImageUrl = await findImageByCode(folderId, row.code.toString());
          if (foundImageUrl) {
            imageUrl = foundImageUrl;
          }
        }

        const newProduct = {
          id: nextId++,
          code: row.code ? row.code.toString() : '',
          name_en: row.name_en || row.Name_EN || row.name || '',
          name_ar: row.name_ar || row.Name_AR || '',
          brand_en: row.brand_en || row.Brand_EN || row.brand || '',
          brand_ar: row.brand_ar || row.Brand_AR || '',
          price: parseFloat(row.price || row.Price || 0),
          description_en: row.description_en || row.Description_EN || '',
          description_ar: row.description_ar || row.Description_AR || '',
          imageUrl: imageUrl
        };

        products.push(newProduct);
        importedCount++;
      } catch (error) {
        console.error('Error processing row:', error);
        skippedCount++;
      }
    }

    // Save updated products
    await writeProducts(products);

    // Clean up uploaded file
    await fs.unlink(req.file.path).catch(console.error);

    res.json({ 
      success: true, 
      message: `Import completed: ${importedCount} products imported, ${skippedCount} skipped`,
      imported: importedCount,
      skipped: skippedCount
    });

  } catch (error) {
    console.error('Error importing Excel:', error);
    res.status(500).json({ error: 'Failed to import Excel file: ' + error.message });
  }
});

// ============================================
// SETTINGS ROUTES (Logo)
// ============================================

/**
 * GET /api/settings
 * Get current settings including logo (public endpoint)
 */
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await readSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * POST /api/logo
 * Upload and update company logo (protected)
 */
app.post('/api/logo', requireAuth, uploadLogo.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const settings = await readSettings();
    
    // Delete old logo file if exists
    if (settings.logo) {
      const oldLogoPath = path.join(__dirname, '..', 'public', settings.logo);
      await fs.unlink(oldLogoPath).catch(console.error);
    }

    // Update settings with new logo path
    settings.logo = '/uploads/' + req.file.filename;
    await writeSettings(settings);

    res.json({ 
      success: true, 
      message: 'Logo uploaded successfully',
      logo: settings.logo
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Product Catalog Server Started');
  console.log('='.repeat(50));
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`📂 Public catalog: http://localhost:${PORT}/`);
  console.log(`🔐 Admin panel: http://localhost:${PORT}/admin.html`);
  console.log('');
  console.log('🔑 Default Admin Credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('='.repeat(50));
});
