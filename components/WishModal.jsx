import { useState, useEffect } from 'react';
import { X, Heart, Send, User, MessageCircle, Sparkles } from 'lucide-react';
import WeddingLoader from './WeddingLoader';

const WishModal = ({ isOpen, onClose, onWishSubmitted }) => {
  const [wish, setWish] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setWish('');
      setGuestName('');
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!wish.trim() || !guestName.trim()) {
      alert('Please fill in both your name and wish!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: guestName.trim(),
          wish: wish.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        
        if (onWishSubmitted) {
          onWishSubmitted();
        }

        // Close modal after success animation
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        throw new Error('Failed to submit wish');
      }
    } catch (error) {
      console.error('Error submitting wish:', error);
      alert('Failed to submit your wish. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-label="Close modal"
      />
      
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto relative animate-modal-enter">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {showSuccess ? (
          // Success View
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Heart className="w-10 h-10 text-white" fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Thank You! 💕
              </h3>
              <p className="text-gray-600 mb-4">
                Your beautiful wish has been saved for<br />
                <span className="font-semibold text-pink-600">Akshay & Tripti</span>
              </p>
              <div className="flex justify-center gap-2 opacity-60">
                {[...Array(5)].map((_, i) => (
                  <Sparkles 
                    key={i} 
                    className="w-5 h-5 text-yellow-500 animate-sparkle" 
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Form View
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-5 rounded-t-2xl border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Wishes for the Couple</h2>
                  <p className="text-sm text-gray-600">Share your love and blessings</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Guest Name */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {/* Wish Message */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Your Wishes & Blessings
                </label>
                <textarea
                  value={wish}
                  onChange={(e) => setWish(e.target.value)}
                  placeholder="Write your heartfelt wishes for Akshay & Tripti..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none transition-colors"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !wish.trim() || !guestName.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <WeddingLoader type="pulse" size="small" />
                    <span>Sending your wish...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Wishes</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-pink-400" fill="currentColor" />
                Your wishes will be treasured forever
                <Heart className="w-3 h-3 text-pink-400" fill="currentColor" />
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishModal;
