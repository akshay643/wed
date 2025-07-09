import { Heart, Circle } from 'lucide-react';

// Floating Hearts Animation
const FloatingHearts = () => {
  return (
    <div className="relative w-20 h-20 mx-auto">
      {[...Array(6)].map((_, i) => (
        <Heart
          key={i}
          className={`absolute w-4 h-4 text-pink-400 animate-bounce`}
          style={{
            animationDelay: `${i * 0.2}s`,
            left: `${(i % 3) * 25 + 10}px`,
            top: `${Math.floor(i / 3) * 25 + 10}px`,
            animationDuration: '1.5s'
          }}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

// Wedding Rings Animation
const WeddingRings = () => {
  return (
    <div className="relative w-20 h-20 mx-auto">
      {/* First Ring */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 animate-spin" />
      {/* Second Ring */}
      <div 
        className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-400 animate-spin"
        style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
      />
      {/* Center Heart */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Heart className="w-6 h-6 text-red-500 animate-pulse" fill="currentColor" />
      </div>
    </div>
  );
};

// Pulsing Hearts
const PulsingHearts = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      {[...Array(3)].map((_, i) => (
        <Heart
          key={i}
          className={`w-6 h-6 text-pink-500 animate-pulse`}
          style={{
            animationDelay: `${i * 0.3}s`,
            animationDuration: '1.2s'
          }}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

// Diamond Ring Spinner
const DiamondRing = () => {
  return (
    <div className="relative w-16 h-16 mx-auto">
      {/* Ring Band */}
      <div className="absolute inset-2 rounded-full border-3 border-yellow-400 border-dashed animate-spin" 
           style={{ animationDuration: '3s' }} />
      
      {/* Diamond */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
        <div className="w-4 h-4 bg-gradient-to-t from-blue-200 to-white transform rotate-45 animate-ping" />
      </div>
    </div>
  );
};

// Love Loading Animation
const LoveLoading = () => {
  return (
    <div className="relative w-24 h-24 mx-auto">
      {/* Outer Ring */}
      <div className="absolute inset-0 rounded-full border-4 border-pink-200">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" />
      </div>
      
      {/* Inner Hearts */}
      <div className="absolute inset-3 flex items-center justify-center">
        <div className="relative">
          <Heart className="w-6 h-6 text-red-500 animate-bounce" fill="currentColor" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );
};

// Text Loading with Hearts
const TextLoading = ({ text = "Loading..." }) => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-pink-500 animate-bounce" fill="currentColor" />
        <span className="text-lg font-medium text-gray-700 animate-pulse">{text}</span>
        <Heart className="w-5 h-5 text-pink-500 animate-bounce" fill="currentColor" 
              style={{ animationDelay: '0.5s' }} />
      </div>
      <div className="flex justify-center gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

// Main Loading Component
const WeddingLoader = ({ 
  type = 'rings', 
  text = '',
  size = 'medium',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16', 
    large: 'w-24 h-24'
  };

  const renderLoader = () => {
    switch (type) {
      case 'hearts':
        return <FloatingHearts />;
      case 'rings':
        return <WeddingRings />;
      case 'pulse':
        return <PulsingHearts />;
      case 'diamond':
        return <DiamondRing />;
      case 'love':
        return <LoveLoading />;
      case 'text':
        return <TextLoading text={text} />;
      default:
        return <WeddingRings />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={sizeClasses[size]}>
        {renderLoader()}
      </div>
      {text && type !== 'text' && (
        <p className="mt-4 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Full Screen Loading Overlay
const WeddingLoadingOverlay = ({ 
  isLoading, 
  text = "Loading your beautiful memories...",
  type = 'love'
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <WeddingLoader type={type} size="large" />
        <div className="mt-6 max-w-xs">
          <p className="text-lg font-medium text-gray-800 mb-2">
            Akshay & Tripti
          </p>
          <p className="text-sm text-gray-600 animate-pulse">
            {text}
          </p>
          <div className="mt-4 px-4 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs rounded-full inline-block">
            #AkshayTripti2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingLoader;
export { 
  FloatingHearts,
  WeddingRings, 
  PulsingHearts,
  DiamondRing,
  LoveLoading,
  TextLoading,
  WeddingLoadingOverlay
};
