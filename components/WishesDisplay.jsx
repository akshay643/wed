import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Calendar, User, Sparkles, RefreshCw } from 'lucide-react';
import WeddingLoader from './WeddingLoader';

const WishesDisplay = ({ refreshTrigger }) => {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wishes');
      const data = await response.json();

      if (data.success) {
        setWishes(data.wishes || []);
        setError(null);
      } else {
        setError('Failed to load wishes');
      }
    } catch (err) {
      console.error('Error fetching wishes:', err);
      setError('Failed to load wishes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    fetchWishes();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-pink-50 via-white to-rose-50 rounded-2xl shadow-lg border border-pink-100 p-8">
        <div className="text-center">
          <WeddingLoader type="rings" size="medium" />
          <p className="text-gray-600 mt-4 font-medium">Loading beautiful wishes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg border border-red-100 p-8">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-red-300" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Oops!</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (wishes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl shadow-lg border border-purple-100 p-10">
        <div className="text-center">
          <div className="relative mb-6">
            <MessageCircle className="w-16 h-16 mx-auto text-purple-200" />
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-3">✨ No wishes yet ✨</h3>
          <p className="text-gray-600 leading-relaxed">
            Be the first to share your love and blessings<br />
            for <span className="font-semibold text-pink-600">Akshay & Tripti</span>!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 via-white to-rose-50 rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
      {/* Elegant Header */}
      <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-6 py-6">
        <div className="absolute inset-0 bg-white opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Wedding Wishes
              </h2>
              <p className="text-pink-100 text-sm">
                {wishes.length} message{wishes.length !== 1 ? 's' : ''} of love & blessings
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
            title="Refresh wishes"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-2 right-20 text-white opacity-20">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="absolute bottom-2 right-16 text-white opacity-20">
          <Heart className="w-3 h-3" fill="currentColor" />
        </div>
      </div>

      {/* Wishes Grid/List */}
      <div className="max-h-96 overflow-y-auto p-4">
        <div className="space-y-4">
          {wishes.map((wish, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-pink-200 overflow-hidden"
            >
              {/* Wish Card */}
              <div className="p-5">
                {/* Header with Avatar */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {wish.guestName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {wish.guestName}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(wish.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wish Content with Quote Styling */}
                <div className="relative bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 mb-3">
                  <div className="text-pink-300 absolute top-2 left-2 text-lg font-serif">"</div>
                  <p className="text-gray-700 leading-relaxed font-medium text-sm pl-6 pr-2 italic">
                    {wish.wish}
                  </p>
                  <div className="text-pink-300 absolute bottom-2 right-2 text-lg font-serif">"</div>
                </div>

                {/* Decorative Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Heart 
                        key={i} 
                        className="w-3 h-3 text-pink-300 group-hover:text-pink-400 transition-colors" 
                        fill="currentColor"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <Sparkles className="w-4 h-4 text-yellow-400 group-hover:animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Beautiful Footer */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-t border-pink-100">
        <div className="text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2 font-medium">
            <Heart className="w-4 h-4 text-pink-400 animate-pulse" fill="currentColor" />
            Every wish is a blessing that will be cherished forever
            <Heart className="w-4 h-4 text-pink-400 animate-pulse" fill="currentColor" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default WishesDisplay;
