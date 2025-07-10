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
const WishModal = dynamic(
  () => import("../components/WishModal"),
  { ssr: false }
);
const WishesDisplay = dynamic(
  () => import("../components/WishesDisplay"),
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
  const [wishesRefreshTrigger, setWishesRefreshTrigger] = useState(0);
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  const [currentBgImage, setCurrentBgImage] = useState(0);
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [lastImageUpdate, setLastImageUpdate] = useState(null);

  const fileInputRef = useRef(null);
  const cameraPhotoInputRef = useRef(null);
  const cameraVideoInputRef = useRef(null);

  // Load background images and set up rotation
  useEffect(() => {
    const loadBackgroundImages = async () => {
      try {
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

          // Preload cached images
          parsedImages.forEach(imageUrl => {
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
            // Filter out videos and convert Google Drive URLs to use our image proxy
            const allImages = data.images
              .filter(img => !img.isVideo) // Only use images for background, not videos
              .map(img => {
                if (img.id) {
                  // Use our image proxy endpoint to serve Google Drive images
                  return `/api/image-proxy?id=${img.id}`;
                }
                return null;
              }).filter(Boolean); // Remove any null URLs

            if (allImages.length > 0) {
              console.log(`Loaded ${allImages.length} background images from Drive (filtered out ${data.images.length - allImages.length} videos)`);
              setBackgroundImages(allImages);

              // Cache the images in localStorage
              localStorage.setItem('wedding-bg-images', JSON.stringify(allImages));
              localStorage.setItem('wedding-bg-images-timestamp', now.toString());

              // Preload images for faster loading
              allImages.forEach(imageUrl => {
                const img = new Image();
                img.src = imageUrl;
                img.onload = () => console.log(`Cached image: ${imageUrl}`);
                img.onerror = () => console.warn(`Failed to load image: ${imageUrl}`);
              });
            } else {
              throw new Error('No valid image IDs found');
            }
          } else {
            throw new Error('No images found in API response');
          }
        } else {
          throw new Error(`API returned ${response.status}`);
        }
      } catch (error) {
        console.log('Failed to load background images from Drive, using defaults:', error);

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

  // Rotate background images every hour with improved caching
  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentBgImage((prevIndex) => {
          const newIndex = (prevIndex + 1) % backgroundImages.length;
          setLastImageUpdate(new Date().toISOString());

          // Preload next 2 images for smoother transitions
          const nextImage1 = backgroundImages[(newIndex + 1) % backgroundImages.length];
          const nextImage2 = backgroundImages[(newIndex + 2) % backgroundImages.length];

          [nextImage1, nextImage2].forEach(imageUrl => {
            if (imageUrl) {
              const img = new Image();
              img.src = imageUrl;
            }
          });

          return newIndex;
        });
      }, 5000); // 1 hour = 3,600,000ms

      return () => clearInterval(interval);
    }
  }, [backgroundImages]);

  // Function to trigger wishes refresh
  const handleWishSubmitted = () => {
    setWishesRefreshTrigger(prev => prev + 1);
  };

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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700">{message}</p>
        </div>
      </div>
    ) : null;

  const UploadNotification = () => {
    return null; // Removed blocking modal
  };

  const renderEventSelection = () => (
    <div
      className="min-h-screen relative overflow-hidden transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: backgroundImages.length > 0
          ? `url('${backgroundImages[currentBgImage]}')`
          : "url('/wedding-couple.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
        {/* Top Bar with Logout */}
        <div className="flex justify-between items-center pt-4 pb-2">
          <div></div> {/* Spacer */}
          <div className="flex gap-2">
            {/* Debug: Manual cache refresh button - remove in production */}
            <button
              onClick={refreshBackgroundImages}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 backdrop-blur-sm hover:bg-blue-500/30 text-white rounded-full font-medium shadow-lg transition-all duration-200 hover:scale-105 border border-white/20 text-sm"
              title="Refresh Background Images"
            >
              🔄
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full font-medium shadow-lg transition-all duration-200 hover:scale-105 border border-white/20"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>        {/* Navigation Buttons */}
        <div className="flex justify-center gap-3 mb-6 mt-4">
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500/90 backdrop-blur-sm text-white rounded-xl font-semibold shadow-lg hover:bg-pink-600 transition-all duration-200 hover:scale-105 border border-white/20"
          >
            <Gallery className="w-5 h-5" />
            Gallery
          </a>
          <button
            onClick={() => setIsWishModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/90 backdrop-blur-sm text-white rounded-xl font-semibold shadow-lg hover:bg-purple-600 transition-all duration-200 hover:scale-105 border border-white/20"
          >
            <MessageCircle className="w-5 h-5" />
            Wishes
          </button>
        </div>

        <ErrorMessage message={error} />

        {/* Events Grid - 2x2 layout for all events */}
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => selectEvent(event.id)}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border-2 border-white/30 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/95"
            >
              <div className="text-4xl mb-3">{event.icon}</div>
              <h3 className="text-base font-semibold text-gray-800">
                {event.name}
              </h3>
            </button>
          ))}
        </div>

        {/* Wishes Display Section */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <WishesDisplay refreshTrigger={wishesRefreshTrigger} />
        </div>

        {/* Wish Modal */}
        <WishModal
          isOpen={isWishModalOpen}
          onClose={() => setIsWishModalOpen(false)}
          onWishSubmitted={handleWishSubmitted}
        />

        {/* PWA Install Prompt - only show if not installed */}
        {/* <PWAInstallPrompt /> */}
        </div>
      </div>
    </div>
  );

  const renderUploadOptions = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button
            onClick={() => setCurrentPage("events")}
            className="mr-4 p-2 rounded-full hover:bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {events.find((e) => e.id === selectedEvent)?.name} Memories
          </h2>
        </div>

        <ErrorMessage message={error} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log("Gallery button clicked");
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-orange-100 touch-manipulation"
          >
            <Upload className="w-10 h-10 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Upload Media
            </h3>
            <p className="text-gray-600 text-sm">Photos & Videos</p>
            <p className="text-gray-500 text-xs mt-1">
              Max 50 files, 2GB each
            </p>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log("Camera Photo button clicked");
              if (cameraPhotoInputRef.current) {
                cameraPhotoInputRef.current.click();
              }
            }}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-pink-100 touch-manipulation"
          >
            <Camera className="w-10 h-10 text-pink-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Take Photo
            </h3>
            <p className="text-gray-600 text-sm">
              Camera - Photo Mode
            </p>
            <p className="text-gray-500 text-xs mt-1">Original quality</p>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log("Camera Video button clicked");
              if (cameraVideoInputRef.current) {
                cameraVideoInputRef.current.click();
              }
            }}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-purple-100 touch-manipulation"
          >
            <div className="relative mx-auto mb-3 w-10 h-10 flex items-center justify-center">
              <Camera className="w-10 h-10 text-purple-500" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Take Video
            </h3>
            <p className="text-gray-600 text-sm">
              Camera - Video Mode
            </p>
            <p className="text-gray-500 text-xs mt-1">No compression</p>
          </button>
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

    // Clear existing cache
    localStorage.removeItem('wedding-bg-images');
    localStorage.removeItem('wedding-bg-images-timestamp');

    // Reload images
    try {
      const response = await fetch('/api/gallery?event=all');
      if (response.ok) {
        const data = await response.json();

        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          const allImages = data.images.map(img => {
            if (img.id) {
              return `/api/image-proxy?id=${img.id}`;
            }
            return null;
          }).filter(Boolean);

          if (allImages.length > 0) {
            setBackgroundImages(allImages);

            // Cache the new images
            const now = Date.now();
            localStorage.setItem('wedding-bg-images', JSON.stringify(allImages));
            localStorage.setItem('wedding-bg-images-timestamp', now.toString());

            // Preload new images
            allImages.forEach(imageUrl => {
              const img = new Image();
              img.src = imageUrl;
            });

            console.log(`Refreshed ${allImages.length} background images`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh background images:', error);
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
