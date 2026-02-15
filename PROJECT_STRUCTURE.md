# 📁 PROJECT STRUCTURE

```
product-catalog/
│
├── 📄 package.json                 # Project dependencies and scripts
├── 📄 README.md                    # Complete documentation
├── 📄 QUICK_START.md              # Quick start guide
├── 📄 EXCEL_TEMPLATE.md           # Excel import format guide
├── 📄 .gitignore                   # Git ignore rules
│
├── 📂 server/                      # Backend (Node.js + Express)
│   ├── 📄 server.js                # Main Express server
│   │                               # - REST API endpoints
│   │                               # - Session management
│   │                               # - File upload handling
│   │                               # - Authentication
│   │
│   ├── 📄 googleDrive.js           # Google Drive API integration
│   │                               # - Image search by product code
│   │                               # - Direct URL generation
│   │                               # - Connection testing
│   │
│   ├── 🔒 service-account.json     # Google Cloud credentials (NOT INCLUDED)
│   │                               # ⚠️ Add this file manually
│   │                               # ⚠️ Never commit to git
│   │
│   └── 📂 data/                    # JSON data storage
│       ├── 📄 products.json        # Product database
│       └── 📄 settings.json        # App settings (logo, etc.)
│
└── 📂 public/                      # Frontend (HTML + CSS + JS)
    │
    ├── 📄 index.html               # Public Catalog Page
    │                               # - Product grid display
    │                               # - Filtering & sorting
    │                               # - Print to PDF
    │                               # - Bilingual (EN/AR)
    │
    ├── 📄 admin.html               # Admin Panel Page
    │                               # - Product management
    │                               # - Excel import
    │                               # - Logo upload
    │                               # - Bilingual (EN/AR)
    │
    ├── 📂 css/                     # Stylesheets
    │   ├── 📄 style.css            # Catalog styles + print CSS
    │   └── 📄 admin.css            # Admin panel styles
    │
    ├── 📂 js/                      # JavaScript files
    │   ├── 📄 script.js            # Catalog frontend logic
    │   │                           # - Product loading
    │   │                           # - Filtering & sorting
    │   │                           # - Language switching
    │   │
    │   └── 📄 admin.js             # Admin panel logic
    │                               # - Authentication
    │                               # - CRUD operations
    │                               # - File uploads
    │                               # - Language switching
    │
    └── 📂 uploads/                 # Uploaded files
        ├── 📄 .gitkeep             # Keep directory in git
        └── (uploaded logos, etc.)


═══════════════════════════════════════════════════════════════

🔑 KEY COMPONENTS:

Backend (Node.js + Express)
├── REST API for products, settings, auth
├── Session-based authentication
├── File uploads (multer)
├── Excel processing (xlsx)
└── Google Drive integration (googleapis)

Frontend (HTML + CSS + JS)
├── Public catalog (responsive, printable)
├── Admin panel (CRUD interface)
├── Bilingual support (AR/EN)
├── Bootstrap 5 for styling
└── Vanilla JavaScript (no framework)

Data Storage
├── JSON files (products, settings)
├── File system (uploaded images)
└── Session storage (authentication)

═══════════════════════════════════════════════════════════════

🌐 URLs:

Public:
  http://localhost:3000/              → Product Catalog

Admin:
  http://localhost:3000/admin.html    → Admin Panel
  
API:
  GET    /api/products                → List all products
  POST   /api/products                → Add product (auth required)
  PUT    /api/products/:id            → Update product (auth required)
  DELETE /api/products/:id            → Delete product (auth required)
  POST   /api/import-excel            → Import from Excel (auth required)
  GET    /api/settings                → Get settings
  POST   /api/logo                    → Upload logo (auth required)
  POST   /api/login                   → Admin login
  POST   /api/logout                  → Admin logout
  GET    /api/check-auth              → Check authentication

═══════════════════════════════════════════════════════════════

🔐 Default Admin Credentials:
   Username: admin
   Password: admin123

═══════════════════════════════════════════════════════════════
```
