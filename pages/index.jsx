import { useRef, useState,useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import {
  Heart,
  AlertCircle,
  ArrowLeft,
  Camera,
  Upload,
  X,
  Check,
  LogOut,
  MessageCircle,
  Image as Gallery
} from "lucide-react";
import withAuth from "../components/withAuth";

// Dynamically import components to avoid SSR issues
const BackgroundUploadStatus = dynamic(
  () => import("../components/BackgroundUploadStatus"),
  { ssr: false }
);
const WeddingLoader = dynamic(
  () => import("../components/WeddingLoader"),
  { ssr: false }
);
// const PWAInstallPrompt = dynamic(
//   () => import("../components/PWAInstallPrompt"),
//   { ssr: false }
// );
// const PWAStatus = dynamic(
//   () => import("../components/PWAStatus"),
//   { ssr: false }
// );
// const PWATestingComponent = dynamic(
//   () => import("../components/PWATestingComponent"),
//   { ssr: false }
// );
// const ForceInstallPWA = dynamic(
//   () => import("../components/ForceInstallPWA"),
//   { ssr: false }
// );
// const NgrokPWAFix = dynamic(
//   () => import("../components/NgrokPWAFix"),
//   { ssr: false }
// );

const WeddingPhotoApp = () => {
  const [currentPage, setCurrentPage] = useState("events");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUploadStatus, setShowUploadStatus] = useState(false);
  const [currentBgImage, setCurrentBgImage] = useState(0);
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [lastImageUpdate, setLastImageUpdate] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef(null);
  const cameraPhotoInputRef = useRef(null);
  const cameraVideoInputRef = useRef(null);

  // Load background images and set up rotation
  useEffect(() => {
    const loadBackgroundImages = async () => {
      try {
        setImageLoading(true);
        setImageError(false);

        // Check if we have cached background images in localStorage
        const cachedImages = localStorage.getItem('wedding-bg-images');
        const cacheTimestamp = localStorage.getItem('wedding-bg-images-timestamp');
        const now = Date.now();
        const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

        // Use cached images if they exist and are less than 24 hours old
        if (cachedImages && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
          console.log('Using cached background images');
          const parsedImages = JSON.parse(cachedImages);
          setBackgroundImages(parsedImages);
          setImageLoading(false);

          // Preload cached images
          parsedImages.slice(0, 3).forEach(imageUrl => {
            const img = new Image();
            img.src = imageUrl;
          });
          return;
        }

        console.log('Loading fresh background images from API');
        // Fetch images from Google Drive via API - get all images from all events
        const response = await fetch('/api/gallery?event=all');
        if (response.ok) {
          const data = await response.json();

          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            console.log(`Total items from API: ${data.images.length}`);
            
            // Filter out videos more strictly and validate image items
            const validImages = data.images
              .filter(img => {
                // More strict video filtering
                const isVideo = img.isVideo === true || 
                               img.mimeType?.startsWith('video/') || 
                               img.name?.match(/\.(mp4|mov|avi|mkv|wmv|flv|webm)$/i);
                
                const hasValidId = img.id && typeof img.id === 'string' && img.id.length > 0;
                
                if (isVideo) {
                  console.log(`Filtering out video: ${img.name} (${img.mimeType})`);
                  return false;
                }
                
                if (!hasValidId) {
                  console.log(`Filtering out item with invalid ID: ${img.name}`);
                  return false;
                }
                
                return true;
              });

            console.log(`Valid images after filtering: ${validImages.length} (filtered out ${data.images.length - validImages.length} items)`);

            if (validImages.length === 0) {
              throw new Error('No valid images found after filtering');
            }

            // Convert to image proxy URLs with validation
            const allImages = validImages
              .map(img => {
                try {
                  // Use optimized background size for faster loading
                  const imageUrl = `/api/image-proxy?id=${img.id}&quality=background&width=1200&height=900`;
                  console.log(`Generated image URL: ${imageUrl} for ${img.name}`);
                  return imageUrl;
                } catch (error) {
                  console.warn(`Failed to generate URL for image ${img.name}:`, error);
                  return null;
                }
              })
              .filter(Boolean); // Remove any null URLs

            if (allImages.length > 0) {
              console.log(`Final background images: ${allImages.length}`);
              setBackgroundImages(allImages);
              setImageLoading(false);

              // Cache the images in localStorage
              localStorage.setItem('wedding-bg-images', JSON.stringify(allImages));
              localStorage.setItem('wedding-bg-images-timestamp', now.toString());

              // Validate and preload images with error handling
              const validateAndPreloadImages = async () => {
                const validatedImages = [];
                
                // Test first 3 images immediately
                for (let i = 0; i < Math.min(3, allImages.length); i++) {
                  const imageUrl = allImages[i];
                  try {
                    await new Promise((resolve, reject) => {
                      const img = new Image();
                      img.onload = () => {
                        console.log(`✓ Validated image ${i + 1}: ${imageUrl}`);
                        validatedImages.push(imageUrl);
                        resolve();
                      };
                      img.onerror = () => {
                        console.warn(`✗ Failed to load image ${i + 1}: ${imageUrl}`);
                        reject(new Error(`Image load failed`));
                      };
                      img.src = imageUrl;
                      
                      // Timeout after 10 seconds
                      setTimeout(() => reject(new Error('Timeout')), 10000);
                    });
                  } catch (error) {
                    console.warn(`Failed to validate image ${i + 1}:`, error);
                  }
                }

                // If no images validated, use fallback
                if (validatedImages.length === 0) {
                  console.warn('No images validated, using fallback');
                  setBackgroundImages(['/wedding-couple.jpeg']);
                  setImageError(true);
                }

                // Load remaining images in background
                setTimeout(() => {
                  allImages.slice(3).forEach((imageUrl, index) => {
                    const img = new Image();
                    img.onload = () => console.log(`Background cached image ${index + 4}: ${imageUrl}`);
                    img.onerror = () => console.warn(`Failed to load background image ${index + 4}: ${imageUrl}`);
                    img.src = imageUrl;
                  });
                }, 2000);
              };

              validateAndPreloadImages();
            } else {
              throw new Error('No valid image URLs generated');
            }
          } else {
            throw new Error('No images found in API response');
          }
        } else {
          throw new Error(`API returned ${response.status}`);
        }
      } catch (error) {
        console.log('Failed to load background images from Drive, using defaults:', error);
        setImageError(true);
        setImageLoading(false);

        // Fallback to default images
        const defaultImages = [
          '/wedding-couple.jpeg',
          '/wedding-souple-2.jpg',
          '/wedding-couple-3.jpg',
          '/wedding-couple-4.jpg',
          '/wedding-couple-5.jpg'
        ];
        setBackgroundImages(defaultImages);

        // Cache default images
        defaultImages.forEach(imageUrl => {
          const img = new Image();
          img.src = imageUrl;
        });
      }
    };

    loadBackgroundImages();
  }, []);

  // Rotate background images every hour with improved caching and error handling
  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentBgImage((prevIndex) => {
          let newIndex = (prevIndex + 1) % backgroundImages.length;
          let attempts = 0;
          const maxAttempts = backgroundImages.length;

          // Try to find a valid image, skip if the current one fails
          const findValidImage = async () => {
            while (attempts < maxAttempts) {
              const testIndex = (prevIndex + 1 + attempts) % backgroundImages.length;
              const imageUrl = backgroundImages[testIndex];
              
              try {
                // Quick validation of the image
                await new Promise((resolve, reject) => {
                  const img = new Image();
                  img.onload = resolve;
                  img.onerror = reject;
                  img.src = imageUrl;
                  
                  // Quick timeout for validation
                  setTimeout(() => reject(new Error('Timeout')), 3000);
                });
                
                newIndex = testIndex;
                break;
              } catch (error) {
                console.warn(`Background image ${testIndex} failed to load, trying next...`);
                attempts++;
              }
            }
          };

          // Run validation asynchronously, but return immediately
          findValidImage();
          
          setLastImageUpdate(new Date().toISOString());

          // Preload next 2 images for smoother transitions with error handling
          const nextImage1 = backgroundImages[(newIndex + 1) % backgroundImages.length];
          const nextImage2 = backgroundImages[(newIndex + 2) % backgroundImages.length];

          [nextImage1, nextImage2].forEach((imageUrl, index) => {
            if (imageUrl) {
              const img = new Image();
              img.onload = () => console.log(`Preloaded next image ${index + 1}`);
              img.onerror = () => console.warn(`Failed to preload next image ${index + 1}: ${imageUrl}`);
              img.src = imageUrl;
            }
          });

          return newIndex;
        });
      }, 5000); // 5 seconds for testing, change to 3600000 for 1 hour

      return () => clearInterval(interval);
    }
  }, [backgroundImages]);

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Detect mobile device and browser
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const isIOS =
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isChrome =
    typeof window !== "undefined" && /Chrome/.test(navigator.userAgent);

  const events = [
    {
      id: "mehndi",
      name: "Mehndi",
      icon: "🎨",
      color: "bg-orange-50 border-orange-200",
    },
    {
      id: "haldi",
      name: "Haldi",
      icon: "🌻",
      color: "bg-yellow-50 border-yellow-200",
    },
    {
      id: "dj-night",
      name: "DJ Night",
      icon: "🎵",
      color: "bg-purple-50 border-purple-200",
    },
    {
      id: "wedding",
      name: "Wedding",
      icon: "💒",
      color: "bg-pink-50 border-pink-200",
    },
  ];

  const selectEvent = (eventId) => {
    // Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50); // Short vibration
    }

    setSelectedEvent(eventId);
    setCurrentPage("upload-options");
    setError("");
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }

    // Handle both single and multiple files
    const fileArray = Array.from(files);

    // Check if this is from camera capture vs gallery
    const isCameraCapture = event.target === cameraPhotoInputRef.current || event.target === cameraVideoInputRef.current;

    // For camera captures, process as single file with no size limit
    if (isCameraCapture && fileArray.length === 1) {
      const file = fileArray[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      console.log("Camera file selected:", {
        name: file.name,
        size: file.size,
        sizeMB: sizeMB + 'MB',
        type: file.type,
        lastModified: file.lastModified,
        input: event.target,
      });

      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Please select an image or video file");
        return;
      }

      // Additional size check for debugging
      if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setError(`File is too large: ${sizeMB}MB (max 2GB)`);
        return;
      }

      setError("");

      try {
        uploadPhotosInBackground([file]);
      } catch (error) {
        console.error("Error processing file:", error);
        setError(`Failed to process file: ${error.message}`);
      }
    } else {
      // For gallery uploads, handle multiple files
      handleMultipleFileUpload(fileArray);
    }
  };

  const handleMultipleFileUpload = async (files) => {
    setError("");

    // Validate files
    const validFiles = [];
    const invalidFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        invalidFiles.push(`${file.name} (not an image or video)`);
      } else if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        invalidFiles.push(`${file.name} (${sizeMB}MB - too large, max 2GB)`);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      setError(`Some files were skipped: ${invalidFiles.join(", ")}`);
    }

    if (validFiles.length === 0) {
      setError("No valid image or video files selected");
      return;
    }

    console.log(
      `Uploading ${validFiles.length} files:`,
      validFiles.map((f) => f.name)
    );

    // Start upload in background (non-blocking)
    uploadPhotosInBackground(validFiles);

    // Reset UI immediately so user can continue using the app
    setCurrentPage("events");
    setSelectedEvent("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraPhotoInputRef.current) {
      cameraPhotoInputRef.current.value = "";
    }
    if (cameraVideoInputRef.current) {
      cameraVideoInputRef.current.value = "";
    }
  };

  const uploadPhotosInBackground = async (photos) => {
    // Show upload status indicator
    console.log("Starting upload, setting status...");
    setIsUploading(true);
    setShowUploadStatus(true);

    try {
      let response;

      if (photos.length === 1) {
        // Single photo upload
        const formData = new FormData();
        formData.append("photo", photos[0]);
        formData.append("event", selectedEvent);

        response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });
      } else {
        // Multiple photos upload
        const formData = new FormData();
        photos.forEach((photo) => {
          formData.append("photos", photo);
        });
        formData.append("event", selectedEvent);

        response = await fetch("/api/upload-multiple", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });
      }

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Upload completed successfully - just update status
          console.log("Upload completed successfully!");
        } else {
          console.error("Some memories failed to upload");
        }
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);

      // More specific error messages
      if (error.message && error.message.includes('413')) {
        setError("File too large. Please try with a smaller file (under 2GB).");
      } else if (error.message && error.message.includes('network')) {
        setError("Network error. Please check your connection and try again.");
      } else if (error.message && error.message.includes('timeout')) {
        setError("Upload timeout. The file might be too large or connection too slow.");
      } else {
        setError(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      console.log("Upload finished, setting isUploading to false");
      setIsUploading(false);
    }
  };

  const resetApp = () => {
    setCurrentPage("events");
    setSelectedEvent("");
    setIsUploading(false);
    setError("");
    setShowUploadStatus(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (backCameraInputRef.current) {
      backCameraInputRef.current.value = "";
    }
  };

  const ErrorMessage = ({ message }) =>
    message ? (
      <div className="glass-card border border-red-300/50 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-300 mr-2" />
          <p className="text-white font-medium">{message}</p>
        </div>
      </div>
    ) : null;

  const UploadNotification = () => {
    return null; // Removed blocking modal
  };

  const renderEventSelection = () => (
    <div className="min-h-screen flex flex-col relative">
      {/* Top Navigation Bar - Transparent overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 h-[10vh] bg-transparent backdrop-blur-sm flex items-center justify-between px-4">
        {/* Left: Navigation Buttons */}
        <div className="flex gap-3">
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md text-white rounded-xl font-semibold shadow-lg active:bg-black/30 transition-all duration-200 active:scale-95 border border-white/30"
          >
            <Gallery className="w-4 h-4" />
            Gallery
          </a>
          <a
            href="/wishes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md text-white rounded-xl font-semibold shadow-lg active:bg-black/30 transition-all duration-200 active:scale-95 border border-white/30"
          >
            <MessageCircle className="w-4 h-4" />
            Wishes
          </a>
        </div>

        {/* Right: Logout and Debug */}
        <div className="flex gap-2">
          {/* Debug: Manual cache refresh button - remove in production */}
          <button
            onClick={refreshBackgroundImages}
            className="flex items-center gap-2 px-3 py-2 bg-black/20 backdrop-blur-md active:bg-black/30 text-white rounded-full font-medium shadow-lg transition-all duration-200 active:scale-95 border border-white/30 text-sm"
            title="Refresh Background Images"
          >
            🔄
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md active:bg-black/30 text-white rounded-full font-medium shadow-lg transition-all duration-200 active:scale-95 border border-white/30"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Top 70% - Background Image Section (Full height from top) */}
      <div
        className="relative overflow-hidden transition-all duration-1000 ease-in-out"
        style={{
          height: "70vh",
        }}
      >
        {/* Loading State */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-orange-100 to-purple-100 flex items-center justify-center">
            <div className="text-center">
              <WeddingLoader type="rings" size="large" />
              <p className="text-gray-600 mt-4 font-medium">Loading beautiful moments...</p>
            </div>
          </div>
        )}

        {/* Background Image with Error Handling */}
        <div
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: backgroundImages.length > 0 && backgroundImages[currentBgImage]
              ? `url('${backgroundImages[currentBgImage]}')`
              : "url('/wedding-couple.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: imageLoading ? 'blur(10px)' : 'none',
          }}
          onError={(e) => {
            console.warn('Background image failed to load, using fallback');
            e.target.style.backgroundImage = "url('/wedding-couple.jpeg')";
          }}
        >
          {/* Subtle overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
          
          {/* Error indicator for debugging */}
          {imageError && (
            <div className="absolute top-20 right-4 bg-red-500/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-red-300/30">
              ⚠ Using fallback image
            </div>
          )}
        </div>

        <div className="relative z-10 h-full p-4 flex flex-col justify-between">
          {/* Best Capture Tag - Positioned to avoid transparent navbar */}          <div className="flex justify-center pt-16">
            <div className="relative inline-flex items-center gap-3 px-8 py-4 glass-gradient-card rounded-2xl transition-all duration-300 hover:scale-105" style={{ animation: 'glass-glow 4s ease-in-out infinite' }}>
              {/* Additional glassmorphic layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-pink-500/10 rounded-2xl opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/10 via-transparent to-white/10 rounded-2xl opacity-40"></div>

              {/* Content */}
              <div className="relative z-10 flex items-center gap-3">
                <span className="text-3xl animate-pulse drop-shadow-lg filter brightness-110">✨</span>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-base leading-tight drop-shadow-lg filter brightness-110">Best Capture of the Moment</span>
                  <span className="text-white/95 font-medium text-xs drop-shadow-md">A perfect memory from our celebration</span>
                </div>
                <span className="text-pink-200 animate-pulse text-2xl drop-shadow-lg filter brightness-110">💕</span>
              </div>

              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            </div>
          </div>

          {/* Center content area for errors */}
          <div className="flex-1 flex flex-col justify-center px-4">
            <ErrorMessage message={error} />
          </div>

          {/* Bottom spacing */}
          <div className="pb-4"></div>
        </div>
      </div>

      {/* Bottom 20% - Event Cards Row */}
      <div className="h-[20vh] bg-gradient-to-r from-pink-50/80 via-orange-50/80 to-purple-50/80 backdrop-blur-sm flex flex-col items-center justify-center px-4 border-t border-white/30">
        {/* Instruction Text */}
        <div className="text-center mb-6">
          <p className="text-gray-700 text-base font-semibold flex items-center justify-center gap-2 mb-1">
            <span className="animate-bounce text-lg">👆</span>
            Choose an event to upload photos
            <span className="animate-bounce text-lg">👇</span>
          </p>
          <p className="text-gray-600 text-sm">Tap any event circle below</p>
        </div>

        <div className="flex gap-6 sm:gap-8 justify-center items-center max-w-4xl w-full">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => selectEvent(event.id)}
              className={`
                flex flex-col items-center justify-center
                w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20
                rounded-full
                ${event.id === 'mehndi' ? 'bg-gradient-to-br from-orange-400 to-orange-600' : ''}
                ${event.id === 'haldi' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : ''}
                ${event.id === 'dj-night' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : ''}
                ${event.id === 'wedding' ? 'bg-gradient-to-br from-pink-400 to-pink-600' : ''}
                text-white
                shadow-lg active:shadow-md
                transition-all duration-200 active:scale-95
                border-3 border-white/70
                relative
                focus:ring-4 focus:ring-white/50 focus:outline-none
                select-none
                touch-manipulation
                touch-feedback
              `}
              type="button"
              style={{
                animation: `gentle-pulse-${event.id} 3s ease-in-out infinite`
              }}
            >
              <div className="text-xl sm:text-2xl md:text-3xl mb-1 filter drop-shadow-sm">{event.icon}</div>
            </button>
          ))}
        </div>

        {/* Event Labels Row */}
        <div className="absolute bottom-2 left-0 right-0 flex gap-6 sm:gap-8 justify-center items-center max-w-4xl mx-auto px-4">
          {events.map((event) => (
            <div
              key={`label-${event.id}`}
              className="flex flex-col items-center w-16 sm:w-18 md:w-20"
            >
              <span className={`
                text-xs sm:text-sm font-bold px-2 py-1 rounded-full text-center
                ${event.id === 'mehndi' ? 'bg-orange-500/90 text-white' : ''}
                ${event.id === 'haldi' ? 'bg-yellow-500/90 text-white' : ''}
                ${event.id === 'dj-night' ? 'bg-purple-500/90 text-white' : ''}
                ${event.id === 'wedding' ? 'bg-pink-500/90 text-white' : ''}
                shadow-md backdrop-blur-sm border border-white/30
                whitespace-nowrap
              `}>
                {event.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUploadOptions = () => (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: backgroundImages.length > 0
          ? `url('${backgroundImages[currentBgImage]}')`
          : "url('/wedding-couple.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40"></div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8 pt-8">
            <button
              onClick={() => setCurrentPage("events")}
              className="mr-4 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-200 active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              {events.find((e) => e.id === selectedEvent)?.name} Memories
            </h2>
          </div>

          <ErrorMessage message={error} />

          {/* Glassmorphic Upload Options - Compact Grid */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Upload Media */}
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log("Gallery button clicked");
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className="glass-card p-4 rounded-xl transition-all duration-300 active:scale-95 touch-manipulation group"
            >
              <div className="flex items-center gap-4">
                <div className="upload-icon flex-shrink-0 w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-orange-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Upload Media
                  </h3>
                  <p className="text-white/80 text-sm">Photos & Videos from gallery</p>
                  <p className="text-white/60 text-xs mt-1">Max 50 files, 2GB each</p>
                </div>
              </div>
            </button>

            {/* Take Photo & Take Video in one row */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Camera Photo button clicked");
                  if (cameraPhotoInputRef.current) {
                    cameraPhotoInputRef.current.click();
                  }
                }}
                className="glass-card p-4 rounded-xl transition-all duration-300 active:scale-95 touch-manipulation group"
              >
                <div className="text-center">
                  <div className="upload-icon w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-6 h-6 text-pink-300" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    Take Photo
                  </h3>
                  <p className="text-white/80 text-xs">Camera</p>
                  <p className="text-white/60 text-xs">Original quality</p>
                </div>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Camera Video button clicked");
                  if (cameraVideoInputRef.current) {
                    cameraVideoInputRef.current.click();
                  }
                }}
                className="glass-card p-4 rounded-xl transition-all duration-300 active:scale-95 touch-manipulation group"
              >
                <div className="text-center">
                  <div className="upload-icon w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 relative">
                    <Camera className="w-6 h-6 text-purple-300" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    Take Video
                  </h3>
                  <p className="text-white/80 text-xs">Camera</p>
                  <p className="text-white/60 text-xs">HD quality</p>
                </div>
              </button>
            </div>
          </div>

          {/* Camera Photo input - opens camera in photo mode */}
          <input
            ref={cameraPhotoInputRef}
            type="file"
            accept="image/*,image/heic,image/heif"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
            multiple={false}
            style={{ display: "none" }}
          />

          {/* Camera Video input - opens camera in video mode */}
          <input
            ref={cameraVideoInputRef}
            type="file"
            accept="video/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
            multiple={false}
            style={{ display: "none" }}
          />

          {/* Gallery input for file selection - supports multiple files */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,image/heic,image/heif,video/*"
            onChange={handleFileUpload}
            className="hidden"
            multiple={true}
            style={{ display: "none" }}
          />
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Upload Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your memory has been added to the{" "}
            {events.find((e) => e.id === selectedEvent)?.name} collection on
            Google Drive.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setCurrentPage("upload-options")}
              className="w-full py-3 px-6 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
            >
              Share Another Memory
            </button>
            <button
              onClick={resetApp}
              className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Choose Different Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Function to manually refresh background images cache
  const refreshBackgroundImages = async () => {
    console.log('Manually refreshing background images...');
    setImageLoading(true);
    setImageError(false);

    // Clear existing cache
    localStorage.removeItem('wedding-bg-images');
    localStorage.removeItem('wedding-bg-images-timestamp');

    // Reload images with validation
    try {
      const response = await fetch('/api/gallery?event=all');
      if (response.ok) {
        const data = await response.json();

        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          console.log(`Refreshing: Total items from API: ${data.images.length}`);
          
          // Filter out videos more strictly
          const validImages = data.images
            .filter(img => {
              const isVideo = img.isVideo === true || 
                             img.mimeType?.startsWith('video/') || 
                             img.name?.match(/\.(mp4|mov|avi|mkv|wmv|flv|webm)$/i);
              
              const hasValidId = img.id && typeof img.id === 'string' && img.id.length > 0;
              
              if (isVideo) {
                console.log(`Refresh: Filtering out video: ${img.name}`);
                return false;
              }
              
              if (!hasValidId) {
                console.log(`Refresh: Filtering out item with invalid ID: ${img.name}`);
                return false;
              }
              
              return true;
            });

          console.log(`Refresh: Valid images after filtering: ${validImages.length}`);

          const allImages = validImages
            .map(img => `/api/image-proxy?id=${img.id}&quality=background&width=1200&height=900`)
            .filter(Boolean);

          if (allImages.length > 0) {
            console.log(`Refresh: Final background images: ${allImages.length}`);
            setBackgroundImages(allImages);
            setImageLoading(false);

            // Cache the refreshed images
            localStorage.setItem('wedding-bg-images', JSON.stringify(allImages));
            localStorage.setItem('wedding-bg-images-timestamp', Date.now().toString());

            // Validate first few images
            for (let i = 0; i < Math.min(3, allImages.length); i++) {
              const img = new Image();
              img.onload = () => console.log(`✓ Refresh validated image ${i + 1}`);
              img.onerror = () => console.warn(`✗ Refresh failed to validate image ${i + 1}`);
              img.src = allImages[i];
            }

            alert(`✅ Refreshed ${allImages.length} background images`);
          } else {
            throw new Error('No valid images after refresh');
          }
        } else {
          throw new Error('No images returned from API');
        }
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to refresh background images:', error);
      setImageError(true);
      setImageLoading(false);
      alert(`❌ Failed to refresh: ${error.message}`);
      
      // Use fallback
      setBackgroundImages(['/wedding-couple.jpeg']);
    }
  };

  // Render based on current page
  const renderMainContent = () => {
    switch (currentPage) {
      case "events":
        return renderEventSelection();
      case "upload-options":
        return renderUploadOptions();
      case "success":
        return renderSuccess();
      default:
        return renderEventSelection();
    }
  };

  return (
    <>
      <Head>
        <title>Akshay & Tripti Wedding Photos</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta
          name="description"
          content="Upload your wedding photos to our shared Google Drive collection"
        />
      </Head>
      {/* <PWAStatus />
      <PWAInstallPrompt />
      <PWATestingComponent />
      <ForceInstallPWA />
      <NgrokPWAFix /> */}
      {renderMainContent()}
      <UploadNotification />
      {showUploadStatus && (
        <BackgroundUploadStatus
          isUploading={isUploading}
          onComplete={() => setShowUploadStatus(false)}
        />
      )}
    </>
  );
};

export default withAuth(WeddingPhotoApp);
