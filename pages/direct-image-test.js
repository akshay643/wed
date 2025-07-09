import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function DirectImageTest() {
  const imageUrl = "https://drive.google.com/uc?export=view&id=1yVQWKYttQ3UjuKNKiemYhLlFys6nSc1l";
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <Head>
        <title>Direct Image Test</title>
      </Head>
      
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Direct Image Test</h1>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-mono text-sm break-all">{imageUrl}</p>
          <p className="mt-2">Status: {isLoaded ? '✅ Loaded' : hasError ? '❌ Error' : '⏳ Loading...'}</p>
        </div>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
          <img 
            src={imageUrl}
            alt="Test Image"
            className="w-full max-h-[400px] object-contain"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-bold mb-2">Alternative formats to try:</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><a href={`${imageUrl}&nocache=${Date.now()}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Add nocache parameter</a></li>
            <li><a href={`https://drive.google.com/thumbnail?id=1yVQWKYttQ3UjuKNKiemYhLlFys6nSc1l`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Try thumbnail URL</a></li>
            <li><a href={`https://drive.google.com/file/d/1yVQWKYttQ3UjuKNKiemYhLlFys6nSc1l/view`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View in Google Drive</a></li>
          </ul>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <p className="text-center py-2 bg-gray-100 font-bold">With cache buster</p>
            <img 
              src={`${imageUrl}&nocache=${Date.now()}`}
              alt="With cache buster"
              className="w-full h-40 object-contain"
            />
          </div>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <p className="text-center py-2 bg-gray-100 font-bold">Thumbnail version</p>
            <img 
              src={`https://drive.google.com/thumbnail?id=1yVQWKYttQ3UjuKNKiemYhLlFys6nSc1l&sz=w1000`}
              alt="Thumbnail version"
              className="w-full h-40 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
