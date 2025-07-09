#!/bin/bash

echo "🚀 Production PWA Deployment Script"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: No package.json found. Run this script from the project root."
    exit 1
fi

echo "📦 Building production-ready PWA..."
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out

# Install dependencies
echo "📋 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# Test the production build locally
echo "🧪 Testing production build locally..."
echo "Starting server at http://localhost:3000"
echo "Press Ctrl+C to stop when done testing"
echo ""

npm run start &
SERVER_PID=$!

sleep 3

echo ""
echo "🎯 PWA Production Testing Checklist:"
echo "======================================"
echo ""
echo "1. 🌐 Open: http://localhost:3000"
echo "2. 🔧 Open Chrome DevTools (F12)"
echo "3. 📱 Go to Application > Manifest"
echo "4. ✅ Verify manifest loads correctly"
echo "5. 🔄 Check Service Worker is registered"
echo "6. 📋 Click 'Add to Home Screen' to test install"
echo "7. 🎨 Test offline functionality"
echo ""
echo "💡 For mobile testing:"
echo "   - Use ngrok for HTTPS testing"
echo "   - Or deploy to production for real testing"
echo ""

read -p "Press Enter to stop the test server and continue with deployment options..."

# Stop the test server
kill $SERVER_PID 2>/dev/null

echo ""
echo "🚀 Ready for Production Deployment!"
echo "==================================="
echo ""
echo "Choose your deployment platform:"
echo ""
echo "1. 🔷 Vercel (Recommended - Free HTTPS)"
echo "   npm install -g vercel"
echo "   vercel --prod"
echo ""
echo "2. 🟢 Netlify (Free HTTPS)"
echo "   - Connect GitHub repository"
echo "   - Build command: npm run build"
echo "   - Publish directory: .next"
echo ""
echo "3. 🌍 Static Export (Any hosting)"
echo "   npm run export"
echo "   # Upload 'out' folder to any static hosting"
echo ""
echo "4. 🐳 Docker (Self-hosted)"
echo "   # Create Dockerfile and deploy to any cloud"
echo ""

echo "📋 Post-Deployment Checklist:"
echo "============================="
echo "1. ✅ Site loads over HTTPS"
echo "2. ✅ Service Worker registers"
echo "3. ✅ Manifest accessible at /manifest.json"
echo "4. ✅ Install prompt appears on mobile"
echo "5. ✅ App works offline"
echo "6. ✅ Lighthouse PWA score > 90"
echo ""

echo "🎉 Your PWA is ready for production!"
echo "The build artifacts are in the .next folder."
echo ""
