import React, { useState } from 'react';
import { compressToTargetSize } from '../utils/imageCompression';

const LoginBackgroundUploader = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset states
    setIsUploading(true);
    setProgress(10);
    setMessage('Preparing image...');
    setError('');
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Show file size
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setMessage(`Compressing image (Original: ${originalSizeMB}MB)...`);
      setProgress(30);
      
      // Compress image
      const compressedImageData = await compressToTargetSize(file, 1500); // Target 1.5MB
      
      // Calculate compression ratio
      const compressedSizeMB = ((compressedImageData.length * 3) / 4 / (1024 * 1024)).toFixed(2);
      setMessage(`Image compressed from ${originalSizeMB}MB to ${compressedSizeMB}MB`);
      setProgress(50);
      
      // Upload to server
      setMessage('Uploading to server...');
      const response = await fetch('/api/admin/upload-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: compressedImageData,
          fileName: file.name,
          mimeType: 'image/jpeg' // Force JPEG for better compression
        }),
      });
      
      setProgress(90);
      
      const data = await response.json();
      
      if (response.ok) {
        setProgress(100);
        setMessage('Upload complete!');
        if (onUploadSuccess) {
          onUploadSuccess(data.imageUrl);
        }
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading background:', error);
      setError(error.message || 'Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
      <h3 className="text-lg font-semibold mb-3">Login Background Image</h3>
      
      <div className="space-y-4">
        {imagePreview && (
          <div className="border rounded-lg overflow-hidden h-48 bg-gray-100">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        <div className="flex items-center space-x-3">
          <label className="flex-1">
            <div className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg cursor-pointer text-center transition-colors">
              {isUploading ? 'Processing...' : 'Select Image'}
            </div>
            <input 
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </label>
        </div>
        
        {isUploading && (
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-pink-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          Images will be compressed to optimize loading speed while maintaining quality.
          For best results, use an image with a 16:9 ratio.
        </p>
      </div>
    </div>
  );
};

export default LoginBackgroundUploader;
