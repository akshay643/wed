/**
 * Image compression utility for the wedding photo app
 * This helps reduce file sizes before uploading to the server
 */

/**
 * Compresses an image file using canvas
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {Number} options.maxWidth - Maximum width of the compressed image
 * @param {Number} options.maxHeight - Maximum height of the compressed image
 * @param {Number} options.quality - JPEG quality (0-1)
 * @returns {Promise<string>} - A promise that resolves with the data URL of the compressed image
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    mimeType = 'image/jpeg'
  } = options;
  
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    // Set up FileReader onload handler
    reader.onload = (readerEvent) => {
      // Create an image object
      const img = new Image();
      
      // Set up image onload handler
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the data URL from the canvas
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        // Check if compression actually helped
        const originalSizeKB = Math.round(file.size / 1024);
        const newSizeKB = Math.round((dataUrl.length * 3) / 4 / 1024); // Rough estimate
        
        console.log(`Image compressed from ~${originalSizeKB}KB to ~${newSizeKB}KB`);
        
        // Resolve with the data URL
        resolve(dataUrl);
      };
      
      // Set up image onerror handler
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Set the image source
      img.src = readerEvent.target.result;
    };
    
    // Set up FileReader onerror handler
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
};

/**
 * Compresses an image file to a target size
 * Tries multiple quality levels to reach target size
 * @param {File} file - The image file to compress
 * @param {Number} targetSizeKB - Target size in KB
 * @returns {Promise<string>} - A promise that resolves with the data URL
 */
export const compressToTargetSize = async (file, targetSizeKB = 950) => {
  // If the file is already smaller than target, just return it
  if (file.size / 1024 <= targetSizeKB) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
  
  // Try different quality levels until we get close to target size
  const qualityLevels = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  let result = null;
  
  // Start with a reasonable resolution based on file size
  let maxWidth = 1920;
  let maxHeight = 1080;
  
  // If the file is very large, start with a smaller resolution
  if (file.size / 1024 > 5000) { // 5MB
    maxWidth = 1280;
    maxHeight = 720;
  }
  
  for (const quality of qualityLevels) {
    const dataUrl = await compressImage(file, {
      maxWidth,
      maxHeight,
      quality,
      mimeType: 'image/jpeg'
    });
    
    // Estimate size (the *3/4 is to account for base64 encoding)
    const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
    
    result = dataUrl;
    console.log(`Tried quality ${quality}: ~${sizeKB}KB`);
    
    // If we're under the target size, we're done
    if (sizeKB <= targetSizeKB) {
      break;
    }
    
    // If still too big after lowest quality, reduce dimensions
    if (quality === 0.1 && sizeKB > targetSizeKB) {
      maxWidth = Math.round(maxWidth * 0.7);
      maxHeight = Math.round(maxHeight * 0.7);
      console.log(`Reducing dimensions to ${maxWidth}x${maxHeight}`);
    }
  }
  
  return result;
};

export default {
  compressImage,
  compressToTargetSize
};
