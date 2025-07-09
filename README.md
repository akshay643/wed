# Wedding Photo Upload App

A beautiful, responsive web application for uploading wedding photos to Google Drive, organized by events (Mehndi, Haldi, DJ Night, Wedding).

## Features

- 📸 Camera integration for taking photos
- 📁 File upload from device gallery (supports multiple files)
- 🗂️ Automatic organization by event type
- ☁️ Direct upload to Google Drive
- 📱 Mobile-responsive design
- 🎨 Beautiful wedding-themed UI
- 🔐 **Passcode Authentication** - Secure access with simple passcodes
- 👤 **Admin Panel** - Manage app settings
- 🔄 **Background Uploads** - Continue using app while photos upload
- 📊 **Upload Status Indicator** - Real-time upload progress

## 🔐 Authentication

The app uses a simple but secure passcode system:

- **Wedding Passcode**: Share with your wedding guests for access
- **Admin Passcode**: Private access for managing the app
- **Session Management**: Guests stay logged in for 7 days, admins for 24 hours

### Access URLs:
- **Guest Login**: `/login` - For wedding guests
- **Admin Panel**: `/admin` - For app management
- **Main App**: `/` - Photo upload (requires authentication)
- **Gallery**: `/gallery` - View all photos (requires authentication)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Drive Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Create a Service Account:
   - Go to "Credentials" → "Create Credentials" → "Service Account"
   - Download the JSON key file
   - Note down the credentials

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Authentication
WEDDING_PASSCODE=Akshay&Tripti2025
ADMIN_PASSCODE=Admin@Wedding2025
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Drive Configuration
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id

# Pre-created folder IDs (optional)
MEHNDI_FOLDER_ID=your-mehndi-folder-id
HALDI_FOLDER_ID=your-haldi-folder-id
DJ_NIGHT_FOLDER_ID=your-dj-night-folder-id
WEDDING_FOLDER_ID=your-wedding-folder-id
```

### 4. Create Google Drive Folders

You can either:

**Option A**: Let the app create folders automatically
- The app will create a "Wedding Photos" folder with subfolders for each event

**Option B**: Create folders manually and add their IDs to `.env.local`
- Create folders in Google Drive
- Right-click → "Get link" → Copy the folder ID from the URL
- Add the IDs to your environment variables

### 5. Run the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## File Structure

```
wedding-photo-upload/
├── pages/
│   ├── api/
│   │   ├── upload.js          # Main upload endpoint
│   │   └── create-folders.js  # Folder creation endpoint
│   ├── _app.js                # App wrapper
│   └── index.js               # Main component
├── lib/
│   └── googleDrive.js         # Google Drive utilities
├── utils/
│   └── multer.js              # File upload middleware
├── styles/
│   └── globals.css            # Global styles
├── .env.local                 # Environment variables
├── package.json               # Dependencies
├── next.config.js             # Next.js configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

## Usage

1. Users select an event (Mehndi, Haldi, DJ Night, Wedding)
2. Choose to either take a photo or upload from gallery
3. Photos are automatically uploaded to the corresponding Google Drive folder
4. Success confirmation with options to upload more photos

## Deployment Notes

- Make sure to set all environment variables in your deployment platform
- The app requires HTTPS for camera functionality
- File size limit is set to 50MB
- Only image files are accepted

## Troubleshooting

1. **Camera not working**: Ensure the app is served over HTTPS
2. **Upload fails**: Check Google Drive API credentials and permissions
3. **File too large**: Ensure files are under 50MB
4. **Folder not found**: Verify folder IDs in environment variables
