#!/bin/bash

echo "🔧 Ngrok PWA Setup for Wedding App"
echo "==================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ Ngrok not found. Installing..."
    npm install -g ngrok
fi

echo "📋 Setup Steps:"
echo "1. Go to: https://dashboard.ngrok.com/signup"
echo "2. Sign up for a free account"
echo "3. Go to: https://dashboard.ngrok.com/get-started/your-authtoken"
echo "4. Copy your authtoken"
echo "5. Run: ngrok config add-authtoken YOUR_TOKEN_HERE"
echo ""

# Check if authtoken is configured
if ngrok config check &> /dev/null; then
    echo "✅ Ngrok authtoken is configured"
else
    echo "⚠️  Please configure your ngrok authtoken first:"
    echo "   ngrok config add-authtoken YOUR_TOKEN_HERE"
    echo ""
    read -p "Press Enter after configuring authtoken..."
fi

echo "🚀 Starting ngrok tunnel with PWA optimization..."
echo ""

# Start the production server if not running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "📦 Starting production server..."
    npm run build
    npm run start &
    sleep 5
fi

echo "🔗 Starting ngrok tunnel..."
echo "   Local server: http://localhost:3000"
echo "   Ngrok will provide an HTTPS URL for mobile testing"
echo ""
echo "🎯 For PWA testing:"
echo "   1. Look for the blue 'Ngrok PWA Mode' component"
echo "   2. Test PWA installation on mobile devices"
echo "   3. Use Chrome DevTools > Application > Manifest"
echo ""
echo "📱 Mobile PWA Testing:"
echo "   - Copy the ngrok URL to your mobile device"
echo "   - Chrome Android: Menu → 'Add to Home Screen'"
echo "   - Safari iOS: Share → 'Add to Home Screen'"
echo ""

# Start ngrok with specific headers for PWA
ngrok http 3000 \
  --host-header=rewrite \
  --log=stdout \
  --region=us
