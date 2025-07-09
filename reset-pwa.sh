#!/bin/bash

echo "🔄 Resetting PWA installation state..."

# Kill Chrome processes to reset PWA state
echo "1. Closing Chrome..."
pkill -f "Google Chrome" 2>/dev/null || echo "Chrome not running"

# Clear Chrome's PWA data (optional - user can do this manually)
echo "2. Clearing PWA cache..."
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Web\ Applications/* 2>/dev/null || echo "PWA cache not found"

# Restart the production server
echo "3. Restarting production server..."
pkill -f "next start" 2>/dev/null
sleep 2

# Start fresh production server
echo "4. Starting fresh production server..."
npm run start &

sleep 3

echo ""
echo "🎉 Reset complete! Now try:"
echo ""
echo "1. Open Chrome in incognito mode (⌘+Shift+N)"
echo "2. Go to http://localhost:3000"
echo "3. Look for the new ForceInstallPWA component (top-right)"
echo "4. If still no prompt, click 'Chrome DevTools Method'"
echo ""
echo "Alternative method:"
echo "1. Chrome DevTools (F12) → Application → Manifest"
echo "2. Click 'Add to Home Screen' at the bottom"
echo ""
