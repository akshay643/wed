import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ArrowLeft, Plus, MessageCircle, Heart, Sparkles } from 'lucide-react';
import withAuth from '../components/withAuth';
import WeddingLoader from '../components/WeddingLoader';

// Dynamic imports for components
const WishModal = dynamic(
  () => import("../components/WishModal"),
  { ssr: false, loading: () => <WeddingLoader type="rings" size="small" /> }
);

const WishesDisplay = dynamic(
  () => import("../components/WishesDisplay"),
  { ssr: false, loading: () => <WeddingLoader type="rings" size="medium" /> }
);

function WishesPage() {
  const router = useRouter();
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  const [wishesRefreshTrigger, setWishesRefreshTrigger] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState('/wedding-couple.jpeg');
  const [imageError, setImageError] = useState(false);

  // Background image logic
  useEffect(() => {
    const loadBackgroundImage = async () => {
      try {
        // Check if we have cached images
        const cachedImages = localStorage.getItem('wedding-gallery-images');
        const cacheTimestamp = localStorage.getItem('wedding-gallery-cache-time');
        const now = Date.now();
        const cacheAge = 24 * 60 * 60 * 1000; // 24 hours

        let images = [];

        if (cachedImages && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheAge) {
          images = JSON.parse(cachedImages);
        } else {
          // Fetch fresh images
          const response = await fetch('/api/gallery?event=all');
          const data = await response.json();
          
          if (data.success && data.images) {
            // Filter out videos, only use images for background
            images = data.images.filter(img => !img.isVideo);
            localStorage.setItem('wedding-gallery-images', JSON.stringify(images));
            localStorage.setItem('wedding-gallery-cache-time', now.toString());
          }
        }

        if (images.length > 0) {
          // Select a random image for this page load
          const randomImage = images[Math.floor(Math.random() * images.length)];
          const imageUrl = `/api/image-proxy?id=${randomImage.id}&width=1920&height=1080`;
          setBackgroundImage(imageUrl);
        }
      } catch (error) {
        console.error('Error loading background image:', error);
        setImageError(true);
      }
    };

    loadBackgroundImage();
  }, []);

  const handleWishSubmitted = () => {
    setIsWishModalOpen(false);
    setWishesRefreshTrigger(prev => prev + 1);
  };

  const goBack = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Wedding Wishes - Akshay & Tripti</title>
        <meta name="description" content="Share your beautiful wishes for Akshay & Tripti's special day" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: imageError 
              ? `url('/wedding-couple.jpeg')` 
              : `url('${backgroundImage}')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-rose-500/30 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium shadow-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 border border-white/30"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>

            <button
              onClick={() => setIsWishModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 hover:scale-105 border border-white/20"
            >
              <Plus className="w-5 h-5" />
              Add Your Wish
            </button>
          </div>

          {/* Page Title */}
          <div className="text-center mb-8 px-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-pink-300 animate-pulse" />
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                Wedding Wishes
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
            <p className="text-white/90 text-lg drop-shadow-md max-w-md mx-auto">
              Beautiful messages and blessings from our loved ones for 
              <span className="font-semibold text-pink-200"> Akshay & Tripti</span>
            </p>
          </div>

          {/* Wishes Display */}
          <div className="flex-1 px-6 pb-6">
            <div className="max-w-4xl mx-auto">
              <WishesDisplay refreshTrigger={wishesRefreshTrigger} />
            </div>
          </div>
        </div>

        {/* Wish Modal */}
        <WishModal
          isOpen={isWishModalOpen}
          onClose={() => setIsWishModalOpen(false)}
          onWishSubmitted={handleWishSubmitted}
        />
      </div>
    </>
  );
}

export default withAuth(WishesPage);
