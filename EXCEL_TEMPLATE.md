# Sample Excel Import Template

This document describes the Excel format for importing products.

## Column Headers

The Excel file should contain the following columns (first row):

```
code | name_en | name_ar | brand_en | brand_ar | price | description_en | description_ar
```

## Sample Data

```
1001 | Wireless Mouse | ماوس لاسلكي | TechBrand | تك براند | 49.99 | Ergonomic wireless mouse with USB receiver | ماوس لاسلكي مريح مع مستقبل USB
1002 | USB Keyboard | لوحة مفاتيح USB | TechBrand | تك براند | 79.99 | Mechanical keyboard with RGB lighting | لوحة مفاتيح ميكانيكية مع إضاءة RGB
1003 | HDMI Cable 2m | كابل HDMI 2 متر | CablePro | كيبل برو | 19.99 | High-speed HDMI cable | كابل HDMI عالي السرعة
1004 | USB-C Hub | محول USB-C | ConnectPlus | كونكت بلس | 89.99 | 7-in-1 USB-C hub with multiple ports | محول USB-C 7 في 1 مع منافذ متعددة
```

## Important Notes

1. **Code Column**: This is used to match product images in Google Drive
2. **Arabic Columns**: Optional but recommended for bilingual support
3. **Price**: Must be numeric (use dots for decimals)
4. **Image URLs**: Not needed - images are auto-linked from Google Drive based on code

## Image Naming in Google Drive

Name your image files to match the product codes:
- `1001.jpg` or `1001.png` for product code 1001
- `1002.jpg` for product code 1002
- etc.

The system will automatically find and link these images during import.
