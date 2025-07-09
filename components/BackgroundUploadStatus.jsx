import { useState, useEffect } from 'react';
import { Upload, Check, Heart, Sparkles } from 'lucide-react';

const BackgroundUploadStatus = ({ isUploading, onComplete }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('uploading'); // 'uploading', 'success'
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isUploading) {
      setVisible(true);
      setIsExiting(false);
      setStatus('uploading');
      setProgress(0);
      
      // Simulate progress animation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 800);
      
      return () => clearInterval(interval);
    } else if (visible && !isExiting) {
      // Upload completed - show success
      setProgress(100);
      setStatus('success');
      
      // Start smooth exit animation after 3 seconds
      const timeout = setTimeout(() => {
        setIsExiting(true);
        
        // Actually hide after animation completes
        setTimeout(() => {
          setVisible(false);
          setIsExiting(false);
          if (onComplete) onComplete();
        }, 500);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [isUploading, visible, isExiting, onComplete]);

  if (!visible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
      isExiting ? 'opacity-0 transform -translate-y-full' : 'opacity-100 transform translate-y-0'
    }`}>
      <div className="bg-white shadow-lg border-b border-gray-200 backdrop-blur-sm">
        {/* Header */}
        <div className={`px-4 py-3 transition-colors duration-300 ${
          status === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 
          'bg-gradient-to-r from-pink-50 to-rose-50'
        }`}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors duration-300 flex-shrink-0 ${
                status === 'success' ? 'bg-green-100' : 'bg-pink-100'
              }`}>
                {status === 'uploading' && (
                  <Upload className="w-5 h-5 text-pink-600 animate-pulse" />
                )}
                {status === 'success' && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  {status === 'uploading' && (
                    <>
                      Preserving Memories
                      <Heart className="w-4 h-4 text-pink-500 animate-heartbeat" fill="currentColor" />
                    </>
                  )}
                  {status === 'success' && (
                    <>
                      Memories Saved!
                      <Sparkles className="w-4 h-4 text-yellow-500 animate-sparkle" />
                    </>
                  )}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {status === 'uploading' && `${Math.round(progress)}% - Creating your wedding album`}
                  {status === 'success' && 'Your precious moments are safely stored! 💕'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {status === 'uploading' && (
          <div className="px-4 pb-3">
            <div className="max-w-2xl mx-auto">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-pink-400 to-rose-500 h-1.5 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-30 animate-shimmer rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success celebration */}
        {status === 'success' && (
          <div className="px-4 pb-3">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Heart 
                    key={i} 
                    className="w-3 h-3 text-pink-400 animate-pulse" 
                    fill="currentColor"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundUploadStatus;
