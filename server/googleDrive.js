/**
 * Google Drive API Integration
 * 
 * This module provides functionality to search for product images in Google Drive
 * based on product codes and return direct image URLs.
 * 
 * SETUP INSTRUCTIONS:
 * ===================
 * 
 * 1. Create a Service Account in Google Cloud Console:
 *    - Go to: https://console.cloud.google.com/
 *    - Create a new project or select an existing one
 *    - Navigate to "IAM & Admin" > "Service Accounts"
 *    - Click "Create Service Account"
 *    - Give it a name (e.g., "product-catalog-service")
 *    - Click "Create and Continue"
 *    - Skip the optional steps and click "Done"
 * 
 * 2. Enable the Google Drive API:
 *    - Go to "APIs & Services" > "Library"
 *    - Search for "Google Drive API"
 *    - Click on it and press "Enable"
 * 
 * 3. Download the Service Account JSON Key:
 *    - Go back to "IAM & Admin" > "Service Accounts"
 *    - Click on your service account email
 *    - Go to the "Keys" tab
 *    - Click "Add Key" > "Create new key"
 *    - Choose "JSON" format
 *    - Click "Create" - this will download the service-account.json file
 *    - Save this file as "service-account.json" in the /server directory
 * 
 * 4. Share your Google Drive folder with the Service Account:
 *    - Open Google Drive and navigate to the folder containing product images
 *    - Right-click the folder and select "Share"
 *    - Copy the service account email from the JSON file (it looks like: your-service@project.iam.gserviceaccount.com)
 *    - Paste it in the share dialog and give it "Viewer" permission
 *    - Click "Send"
 * 
 * 5. Get the Folder ID:
 *    - Open the folder in Google Drive
 *    - Look at the URL: https://drive.google.com/drive/folders/FOLDER_ID_HERE
 *    - Copy the FOLDER_ID_HERE part
 *    - Use this ID when calling findImageByCode()
 * 
 * IMPORTANT: Add service-account.json to .gitignore to prevent committing credentials!
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Path to service account credentials
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

/**
 * Initialize Google Drive API client
 * @returns {Promise<drive_v3.Drive>} Google Drive API client
 */
async function getDriveClient() {
  try {
    let credentials;
    
    // Check if credentials are in environment variable (for Render/Production)
    if (process.env.GOOGLE_SERVICE_ACCOUNT) {
      console.log('✓ Using Google Drive credentials from environment variable');
      try {
        credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
      } catch (parseError) {
        console.error('❌ Failed to parse GOOGLE_SERVICE_ACCOUNT environment variable:', parseError.message);
        return null;
      }
    } 
    // Fallback to file (for local development)
    else if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.log('✓ Using Google Drive credentials from service-account.json file');
      credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    } 
    // No credentials found
    else {
      console.warn('⚠️  Google Drive credentials not found.');
      console.warn('   For production: Set GOOGLE_SERVICE_ACCOUNT environment variable');
      console.warn('   For local: Add service-account.json to /server directory');
      return null;
    }

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    // Get authenticated client
    const authClient = await auth.getClient();

    // Create Drive API client
    const drive = google.drive({ version: 'v3', auth: authClient });

    console.log('✓ Google Drive API client initialized successfully');
    return drive;
  } catch (error) {
    console.error('❌ Error initializing Google Drive client:', error.message);
    return null;
  }
}

/**
 * Find image in Google Drive folder by product code
 * @param {string} folderId - Google Drive folder ID
 * @param {string} productCode - Product code (e.g., "1001")
 * @returns {Promise<string|null>} Direct image URL or null if not found
 */
async function findImageByCode(folderId, productCode) {
  try {
    const drive = await getDriveClient();
    
    if (!drive) {
      console.warn(`⚠️  Google Drive not configured. Cannot find image for product: ${productCode}`);
      return null;
    }

    // Search for files in the folder that start with the product code
    // Query searches for files whose name starts with productCode and are images
    const query = `'${folderId}' in parents and name contains '${productCode}' and (mimeType contains 'image/' or name contains '.jpg' or name contains '.jpeg' or name contains '.png' or name contains '.gif' or name contains '.webp') and trashed=false`;

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType)',
      pageSize: 10
    });

    const files = response.data.files;

    if (!files || files.length === 0) {
      console.log(`ℹ️  No image found for product code: ${productCode}`);
      return null;
    }

    // Find exact match or closest match
    // Priority: exact match (1001.jpg) > starts with code (1001-variant.jpg)
    let selectedFile = files.find(f => {
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '');
      return nameWithoutExt === productCode;
    });

    if (!selectedFile) {
      selectedFile = files.find(f => f.name.startsWith(productCode));
    }

    if (!selectedFile) {
      selectedFile = files[0]; // Fallback to first result
    }

    // Return direct view URL
    const imageUrl = `https://drive.google.com/uc?export=view&id=${selectedFile.id}`;
    console.log(`✓ Found image for ${productCode}: ${selectedFile.name}`);
    
    return imageUrl;

  } catch (error) {
    console.error(`❌ Error finding image for product ${productCode}:`, error.message);
    return null;
  }
}

/**
 * Test Google Drive connection
 * @param {string} folderId - Folder ID to test
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection(folderId) {
  try {
    const drive = await getDriveClient();
    
    if (!drive) {
      return false;
    }

    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      pageSize: 1,
      fields: 'files(id, name)'
    });

    console.log('✓ Google Drive connection successful!');
    console.log(`  Found ${response.data.files.length > 0 ? 'files' : 'no files'} in folder`);
    return true;

  } catch (error) {
    console.error('❌ Google Drive connection test failed:', error.message);
    return false;
  }
}

module.exports = {
  findImageByCode,
  testConnection
};
