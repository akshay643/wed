# Google Drive Setup Guide

Follow these steps to configure Google Drive for your wedding photo app:

## Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing):
   - Click "Select a project" → "New Project"
   - Name: "Wedding Photo App" (or similar)
   - Click "Create"

3. **Enable Google Drive API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click on it and click "Enable"

4. **Create Service Account**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Name: "Wedding Photo Uploader"
   - Description: "Service account for uploading wedding photos"
   - Click "Create and Continue"
   - Skip role assignment (click "Continue")
   - Skip user access (click "Done")

5. **Generate Service Account Key**:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON" format
   - Click "Create" - this downloads a JSON file

## Step 2: Setup Google Drive Folders

1. **Save the downloaded JSON file** as `service-account-key.json` in your project root
2. **Run the setup script**:
   ```bash
   node setup-google-drive.js
   ```
3. **Copy the output** and update your `.env` file

## Step 3: Update .env File

Replace the placeholder values in your `.env` file with the values from the setup script output.

## Step 4: Test the Upload

1. Start your app: `npm run dev`
2. Go to http://localhost:3000
3. Login with the passcode
4. Try uploading a photo

## Troubleshooting

- **"Google Drive not configured" error**: Make sure all environment variables are set correctly
- **"Permission denied" error**: Make sure the service account has access to the folders
- **"Invalid credentials" error**: Check that the private key is properly formatted with line breaks

## Security Notes

- Never commit `service-account-key.json` to version control
- The `.env` file contains sensitive information - keep it secure
- Consider using environment-specific variables for production

## Folder Structure Created

The script creates this folder structure in Google Drive:
```
Akshay & Tripti Wedding Photos/
├── Mehndi/
├── Haldi/
├── DJ Night/
└── Wedding/
```

All folders are set to be publicly viewable (read-only) so guests can view the gallery.
