import { useState } from 'react';
import { Heart, Send, MessageCircle, User, Sparkles } from 'lucide-react';
import WeddingLoader from './WeddingLoader';

const WeddingWishes = ({ onWishSubmitted }) => {
  const [wish, setWish] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
        setWish('');
        setGuestName('');
        
        if (onWishSubmitted) {
          onWishSubmitted();
        }

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
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

  if (showSuccess) {
    return (
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 text-center border border-pink-100">
        <div className="mb-4">
          <Heart className="w-12 h-12 text-pink-500 mx-auto animate-heartbeat" fill="currentColor" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Thank You! 💕
        </h3>
        <p className="text-gray-600">
          Your beautiful wish has been saved for Akshay & Tripti
        </p>
        <div className="mt-4 flex justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <Sparkles 
              key={i} 
              className="w-4 h-4 text-yellow-500 animate-sparkle" 
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-pink-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Wishes for the Couple</h2>
            <p className="text-sm text-gray-600">Share your love and blessings</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Guest Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Your Name
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {/* Wish Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Heart className="w-4 h-4 inline mr-1" />
            Your Wishes & Blessings
          </label>
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="Write your heartfelt wishes for Akshay & Tripti..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !wish.trim() || !guestName.trim()}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium py-3 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <WeddingLoader type="pulse" size="small" />
              <span>Sending your wish...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Wishes</span>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 text-center">
        <p className="text-xs text-gray-500">
          Your wishes will be treasured forever 💕
        </p>
      </div>
    </div>
  );
};

export default WeddingWishes;
