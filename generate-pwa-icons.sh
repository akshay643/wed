#!/bin/bash

# PWA Icon Generator Script
# This script generates PWA icons from the wedding-couple.png image

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first:"
    echo "brew install imagemagick"
    exit 1
fi

# Source image
SOURCE_IMAGE="public/wedding-couple.png"
ICONS_DIR="public/icons"

# Create icons directory if it doesn't exist
mkdir -p "$ICONS_DIR"

# Icon sizes for PWA
SIZES=(72 96 128 144 152 192 384 512)

echo "Generating PWA icons from $SOURCE_IMAGE..."

for size in "${SIZES[@]}"; do
    echo "Generating ${size}x${size} icon..."
    convert "$SOURCE_IMAGE" -resize "${size}x${size}" -quality 100 "$ICONS_DIR/icon-${size}x${size}.png"
done

# Generate favicon
echo "Generating favicon..."
convert "$SOURCE_IMAGE" -resize "32x32" -quality 100 "public/favicon.ico"

echo "PWA icons generated successfully!"
echo "Icons created in $ICONS_DIR/"
