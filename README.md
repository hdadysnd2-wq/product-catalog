# Product Catalog - Bilingual (Arabic/English)

A complete product management and catalog system with admin panel, Google Drive image integration, and bilingual support (Arabic/English).

## 🌟 Features

### Public Catalog (`/`)
- ✅ Bilingual interface (Arabic/English)
- ✅ Responsive product grid with images
- ✅ Filter by brand
- ✅ Sort by name, brand, or price
- ✅ Search functionality
- ✅ Print to PDF with clean layout
- ✅ Company logo display

### Admin Panel (`/admin.html`)
- ✅ Secure authentication (session-based)
- ✅ Bilingual interface (Arabic/English)
- ✅ Add/Edit/Delete products
- ✅ Excel import with automatic image linking
- ✅ Google Drive integration for product images
- ✅ Company logo upload and management

### Backend API
- ✅ RESTful API with Express.js
- ✅ JSON file-based data storage
- ✅ Session management
- ✅ File uploads (logos, Excel)
- ✅ Google Drive API integration

## 📋 Requirements

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Google Cloud account (for Google Drive integration - optional)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Access the Application

- **Public Catalog**: http://localhost:3000/
- **Admin Panel**: http://localhost:3000/admin.html

### 4. Login to Admin Panel

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

## 📁 Project Structure

```
product-catalog/
├── server/
│   ├── server.js              # Main Express server
│   ├── googleDrive.js         # Google Drive API integration
│   ├── service-account.json   # Google Cloud credentials (not included)
│   └── data/
│       ├── products.json      # Product data storage
│       └── settings.json      # Settings (logo, etc.)
├── public/
│   ├── index.html             # Public catalog page
│   ├── admin.html             # Admin panel page
│   ├── css/
│   │   ├── style.css          # Catalog styles + print CSS
│   │   └── admin.css          # Admin panel styles
│   ├── js/
│   │   ├── script.js          # Catalog frontend logic
│   │   └── admin.js           # Admin panel frontend logic
│   └── uploads/               # Uploaded files (logos, etc.)
├── package.json
└── README.md
```

## 🔧 Google Drive Integration Setup

The Google Drive integration allows automatic linking of product images based on product codes.

### Step 1: Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **IAM & Admin** > **Service Accounts**
4. Click **Create Service Account**
5. Give it a name (e.g., "product-catalog-service")
6. Click **Create and Continue**, then **Done**

### Step 2: Enable Google Drive API

1. Go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

### Step 3: Download Credentials

1. Go back to **IAM & Admin** > **Service Accounts**
2. Click on your service account email
3. Go to the **Keys** tab
4. Click **Add Key** > **Create new key**
5. Choose **JSON** format
6. Click **Create** - this downloads the credentials file
7. Rename it to `service-account.json`
8. Place it in the `/server` directory

### Step 4: Share Google Drive Folder

1. Create a folder in Google Drive for product images
2. Name image files using product codes (e.g., `1001.jpg`, `2050.png`)
3. Right-click the folder and select **Share**
4. Copy the service account email from `service-account.json`
   - It looks like: `your-service@project.iam.gserviceaccount.com`
5. Paste it in the share dialog
6. Give it **Viewer** permission
7. Click **Send**

### Step 5: Get Folder ID

1. Open the folder in Google Drive
2. Look at the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
3. Copy the `FOLDER_ID_HERE` part
4. Use this ID when importing Excel files in the admin panel

### Testing Google Drive Connection

The server will automatically check for the `service-account.json` file on startup. If it's missing, Google Drive integration will be disabled, but the application will still work normally.

## 📊 Excel Import Format

When importing products via Excel, use the following column names:

| Column | Required | Description |
|--------|----------|-------------|
| `code` | Yes | Product code (used to find images in Google Drive) |
| `name_en` | Yes | Product name in English |
| `name_ar` | No | Product name in Arabic |
| `brand_en` | Yes | Brand name in English |
| `brand_ar` | No | Brand name in Arabic |
| `price` | Yes | Product price (numeric) |
| `description_en` | No | Description in English |
| `description_ar` | No | Description in Arabic |

**Example Excel Structure:**

```
code    name_en             name_ar         brand_en    brand_ar    price   description_en
1001    Wireless Mouse      ماوس لاسلكي     TechBrand   تك براند   49.99   Ergonomic wireless mouse
1002    USB Keyboard        لوحة مفاتيح    TechBrand   تك براند   79.99   Mechanical keyboard
```

**Note:** Image URLs are automatically resolved from Google Drive based on the product code. You don't need to include image URLs in the Excel file.

## 🌐 Bilingual Support

The application supports both Arabic and English languages:

### Language Switching

- Click the **EN** or **AR** buttons in the top navigation
- The entire interface will switch languages
- Product names, brands, and descriptions display in the selected language
- Sorting and filtering respect the current language

### Adding Translations

To extend translations, modify the `translations` object in:
- `/public/js/script.js` (for catalog page)
- `/public/js/admin.js` (for admin panel)

## 🖨️ Print to PDF

The catalog page includes optimized print styles:

1. Click the **Print PDF** button
2. In the print dialog, select **Save as PDF**
3. The printed version automatically:
   - Hides filters, buttons, and controls
   - Shows company logo
   - Optimizes layout for paper
   - Displays clean product information

## 🔐 Security Notes

- **Change default admin credentials** in production
- Keep `service-account.json` secure and never commit it to version control
- Use HTTPS in production
- Consider implementing proper user management for production use
- The `.gitignore` file is configured to exclude sensitive files

## 🛠️ API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/settings` - Get settings (logo)

### Protected Endpoints (Require Authentication)
- `POST /api/login` - Admin login
- `POST /api/logout` - Admin logout
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/import-excel` - Import products from Excel
- `POST /api/logo` - Upload company logo

## 📝 Development

For development with auto-restart on file changes:

```bash
npm run dev
```

(Requires `nodemon` - already included in `devDependencies`)

## 🐛 Troubleshooting

### Google Drive Images Not Loading

1. Verify `service-account.json` is in the `/server` directory
2. Check that the Google Drive folder is shared with the service account email
3. Ensure the folder ID is correct
4. Check server logs for error messages

### Products Not Displaying

1. Check the browser console for errors
2. Verify the server is running
3. Check `/server/data/products.json` for data
4. Clear browser cache

### Login Issues

1. Verify credentials: `admin` / `admin123`
2. Check browser cookies are enabled
3. Look for errors in browser console

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all dependencies are installed correctly

---

**Enjoy using the Product Catalog System! 🎉**
