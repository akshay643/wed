import { Heart, Sparkles } from "lucide-react";

const WeddingHeader = ({ showHashtag = true, showDate = true }) => {
  return (
    <div className="text-center py-6 px-4 bg-gradient-to-r from-pink-50 to-rose-50">
      {/* Couple Names */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Akshay
        </span>
        <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
        <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Tripti
        </span>
      </div>
      
      {/* Wedding Date */}
      {showDate && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-600 text-sm font-medium">Wedding 2025</span>
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </div>
      )}
      
      {/* Hashtag */}
      {showHashtag && (
        <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium rounded-full">
          #AkshayTripti2025
        </div>
      )}
    </div>
  );
};

export default WeddingHeader;
