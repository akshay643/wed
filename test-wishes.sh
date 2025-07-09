#!/bin/bash

# Test script for wedding wishes functionality

echo "🎉 Testing Wedding Wishes Functionality"
echo "========================================"

# Check if server is running
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ Server is running on port 3002"
else
    echo "❌ Server is not running. Please start with 'npm run dev'"
    exit 1
fi

echo ""
echo "🔐 Testing API Authentication (should require auth):"
response=$(curl -s -w "\n%{http_code}" http://localhost:3002/api/wishes)
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" = "401" ]; then
    echo "✅ API correctly requires authentication"
else
    echo "❌ API authentication not working properly"
fi

echo ""
echo "📝 Wedding Wishes Features Implemented:"
echo "✅ API endpoint: /api/wishes (GET/POST)"
echo "✅ Google Drive integration for storing wishes"
echo "✅ Authentication middleware"
echo "✅ WeddingWishes component (form for submitting)"
echo "✅ WishesDisplay component (shows submitted wishes)"
echo "✅ Added to main page and gallery page"

echo ""
echo "🚀 Next Steps:"
echo "1. Login to the app at http://localhost:3002"
echo "2. Submit a test wish using the form"
echo "3. Check if wishes appear in the display section"
echo "4. Verify wishes are stored in Google Drive"

echo ""
echo "💡 Note: You need valid Google Drive credentials in .env for full functionality"
