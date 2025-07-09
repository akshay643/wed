import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function TestLogin() {
  const [imageUrl, setImageUrl] = useState('/wedding-couple.png');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Try to load the image directly from login-config.json
    fetch('/api/admin/login-background')
      .then(res => res.json())
      .then(data => {
        console.log('Received image URL:', data.imageUrl);
        setImageUrl(data.imageUrl);
      })
      .catch(err => {
        console.error('Error loading background image:', err);
        setError('Failed to load custom background');
      });
  }, []);

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error('Image failed to load');
    setError('Image failed to load');
    setImageUrl('/wedding-couple.png'); // Fallback
  };

  return (
    <div className="min-h-screen p-4">
      <Head>
        <title>Background Image Test</title>
      </Head>
      
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Background Image Test</h1>
        
        <div className="mb-4">
          <p>Current Image URL: <code className="bg-gray-100 p-1 rounded">{imageUrl}</code></p>
          <p>Status: {imageLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
          {error && <p className="text-red-500">{error}</p>}
        </div>
        
        <div className="border-2 border-gray-300 rounded-lg h-64 overflow-hidden mb-4">
          <img 
            src={imageUrl} 
            alt="Background Test"
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
        
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Debugging:</h2>
          <p>1. Check browser console for errors</p>
          <p>2. Make sure Google Drive image is publicly accessible</p>
          <p>3. Try appending &t={Date.now()} to URL to prevent caching</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => setImageUrl('/wedding-couple.png')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Use Default Image
          </button>
          <button 
            onClick={() => setImageUrl(imageUrl.includes('?') ? `${imageUrl}&t=${Date.now()}` : `${imageUrl}?t=${Date.now()}`)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Bypass Cache
          </button>
        </div>
      </div>
    </div>
  );
}
