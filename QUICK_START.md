# 🚀 QUICK START GUIDE

## Step 1: Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This will install all required packages (Express, multer, xlsx, googleapis, etc.)

## Step 2: Start the Server

```bash
npm start
```

You should see:
```
==================================================
🚀 Product Catalog Server Started
==================================================
📍 Server running at: http://localhost:3000
📂 Public catalog: http://localhost:3000/
🔐 Admin panel: http://localhost:3000/admin.html

🔑 Default Admin Credentials:
   Username: admin
   Password: admin123
==================================================
```

## Step 3: Access the Application

Open your browser and go to:

- **Public Catalog**: http://localhost:3000/
- **Admin Panel**: http://localhost:3000/admin.html

## Step 4: Login to Admin

Use these credentials:
- Username: `admin`
- Password: `admin123`

## Step 5: Start Managing Products

### Option A: Add Products Manually
1. Click "Add Product" button
2. Fill in the form (bilingual: English & Arabic)
3. Click "Save Product"

### Option B: Import from Excel
1. Click "Import Excel" button
2. Select your Excel file
3. (Optional) Enter Google Drive Folder ID for auto-image linking
4. Click "Import"

## 📊 Excel File Format

Your Excel file should have these columns:
```
code | name_en | name_ar | brand_en | brand_ar | price | description_en | description_ar
```

Example:
```
1001 | Wireless Mouse | ماوس لاسلكي | TechBrand | تك براند | 49.99 | Ergonomic mouse | ماوس مريح
```

## 🖼️ Upload Company Logo

1. Go to "Settings" tab in admin panel
2. Choose an image file
3. Click "Upload Logo"
4. Logo will appear on both admin panel and public catalog

## 🔗 Google Drive Setup (Optional)

For automatic image linking:

1. Create a Google Cloud project
2. Enable Google Drive API
3. Create a service account
4. Download JSON credentials as `service-account.json`
5. Place in `/server` folder
6. Share your Google Drive images folder with the service account email
7. Name images using product codes (e.g., `1001.jpg`)

See README.md for detailed instructions.

## 🌐 Language Switching

- Click **EN** or **AR** buttons to switch between English and Arabic
- Works on both catalog and admin panel
- All product information displays in selected language

## 🖨️ Print Catalog to PDF

1. Go to public catalog page
2. Click "Print PDF" button
3. In print dialog, select "Save as PDF"
4. Get a clean, professional product catalog!

## ❓ Need Help?

- Check README.md for full documentation
- Check EXCEL_TEMPLATE.md for import format details
- Review server logs for error messages

---

**That's it! You're ready to go! 🎉**
