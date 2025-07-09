import { useState, useEffect } from 'react';
import { Heart, Smile, Sparkles, ThumbsUp } from 'lucide-react';

const PhotoReactions = ({ imageId, compact = false }) => {
  const [reactions, setReactions] = useState({
    heart: 0,
    smile: 0,
    sparkles: 0,
    thumbsUp: 0
  });
  const [userReaction, setUserReaction] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load reactions from localStorage (in real app, this would be from database)
  useEffect(() => {
    const savedReactions = localStorage.getItem(`reactions_${imageId}`);
    const savedUserReaction = localStorage.getItem(`user_reaction_${imageId}`);
    
    if (savedReactions) {
      setReactions(JSON.parse(savedReactions));
    }
    if (savedUserReaction) {
      setUserReaction(savedUserReaction);
    }
  }, [imageId]);

  const addReaction = (type) => {
    const newReactions = { ...reactions };
    
    // Remove previous reaction if exists
    if (userReaction) {
      newReactions[userReaction] = Math.max(0, newReactions[userReaction] - 1);
    }
    
    // Add new reaction
    if (userReaction !== type) {
      newReactions[type] = newReactions[type] + 1;
      setUserReaction(type);
      localStorage.setItem(`user_reaction_${imageId}`, type);
    } else {
      // Remove reaction if clicking same one
      setUserReaction(null);
      localStorage.removeItem(`user_reaction_${imageId}`);
    }
    
    setReactions(newReactions);
    localStorage.setItem(`reactions_${imageId}`, JSON.stringify(newReactions));
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const reactionButtons = [
    { type: 'heart', icon: Heart, emoji: '❤️', color: 'text-red-500' },
    { type: 'smile', icon: Smile, emoji: '😍', color: 'text-yellow-500' },
    { type: 'sparkles', icon: Sparkles, emoji: '✨', color: 'text-purple-500' },
    { type: 'thumbsUp', icon: ThumbsUp, emoji: '👏', color: 'text-blue-500' }
  ];

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  if (compact) {
    // Compact version for photo grid
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => addReaction('heart')}
          className={`p-1 rounded-full transition-all ${
            userReaction === 'heart' 
              ? 'bg-red-100 text-red-500 scale-110' 
              : 'hover:bg-gray-100 text-gray-400'
          } ${isAnimating && userReaction === 'heart' ? 'animate-bounce' : ''}`}
        >
          <Heart className="w-4 h-4" fill={userReaction === 'heart' ? 'currentColor' : 'none'} />
        </button>
        {totalReactions > 0 && (
          <span className="text-xs text-gray-500">{totalReactions}</span>
        )}
      </div>
    );
  }

  // Full version for carousel
  return (
    <div className="bg-black/20 rounded-lg p-3 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3 mb-2">
        {reactionButtons.map(({ type, icon: Icon, emoji, color }) => (
          <button
            key={type}
            onClick={() => addReaction(type)}
            className={`p-2 rounded-full transition-all ${
              userReaction === type 
                ? `bg-white/30 ${color} scale-110` 
                : 'hover:bg-white/20 text-white/70'
            } ${isAnimating && userReaction === type ? 'animate-bounce' : ''}`}
            title={`React with ${emoji}`}
          >
            <Icon className="w-5 h-5" fill={userReaction === type ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
      
      {totalReactions > 0 && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
            <Heart className="w-4 h-4 text-red-400" />
            <span>{totalReactions} reaction{totalReactions !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoReactions;
