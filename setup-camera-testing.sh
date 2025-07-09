#!/bin/bash

# Script to help test camera functionality on Mac
echo "📸 Setting up camera testing for your wedding photo app..."

echo ""
echo "🔧 Step 1: Enable camera access for your browser"
echo "For Chrome:"
echo "1. Open Chrome"
echo "2. Go to Chrome > Preferences > Privacy and Security > Site Settings"
echo "3. Click 'Camera'"
echo "4. Make sure 'Sites can ask to use your camera' is selected"
echo "5. Add http://localhost:3000 to 'Allowed to use your camera' if needed"

echo ""
echo "For Safari:"
echo "1. Open Safari"
echo "2. Go to Safari > Preferences > Websites > Camera"
echo "3. Set localhost to 'Allow'"

echo ""
echo "🔧 Step 2: System camera permissions"
echo "1. Open System Preferences > Security & Privacy > Privacy"
echo "2. Click 'Camera' in the left sidebar"
echo "3. Make sure your browser (Chrome/Safari) is checked"

echo ""
echo "🔧 Step 3: Test the camera"
echo "1. Start your app: npm run dev"
echo "2. Go to http://localhost:3000"
echo "3. Login with your passcode"
echo "4. Click the Camera button"
echo "5. Allow camera access when prompted"
echo "6. Take a photo and try uploading"

echo ""
echo "🐛 Debugging tips:"
echo "- Open browser developer console (F12) to see error logs"
echo "- Check file size in console logs"
echo "- Try with a smaller test image first"
echo "- Make sure you're on HTTPS for production (cameras require secure context)"

echo ""
echo "📱 For mobile testing:"
echo "- Use ngrok or similar to create HTTPS tunnel: npx ngrok http 3000"
echo "- Access the HTTPS URL on your mobile device"
echo ""
