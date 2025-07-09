// Example usage of Wedding Loading Animations

import WeddingLoader, { 
  WeddingLoadingOverlay,
  PulsingHearts,
  DiamondRing 
} from '../components/WeddingLoader';

// Usage Examples:

// 1. Full page loading overlay
const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div>
      <WeddingLoadingOverlay 
        isLoading={isLoading}
        text="Preparing your wedding memories..."
        type="love"
      />
      {/* Your app content */}
    </div>
  );
};

// 2. Small inline loaders
const PhotoGallery = () => {
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  
  return (
    <div className="p-4">
      {loadingPhotos ? (
        <WeddingLoader 
          type="hearts" 
          text="Loading photos..." 
          size="medium"
        />
      ) : (
        <div>Photos here...</div>
      )}
    </div>
  );
};

// 3. Upload progress
const PhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  
  return (
    <div>
      {uploading ? (
        <WeddingLoader 
          type="rings" 
          text="Uploading your beautiful moment..." 
          size="large"
        />
      ) : (
        <button>Upload Photo</button>
      )}
    </div>
  );
};

// 4. Different animation types:
/*
  type="hearts"   - Floating hearts animation
  type="rings"    - Wedding rings spinning
  type="pulse"    - Pulsing hearts
  type="diamond"  - Diamond ring with sparkle
  type="love"     - Love loading with ring and heart
  type="text"     - Text with animated dots
*/
