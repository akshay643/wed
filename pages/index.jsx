import { useRef, useState } from "react";
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

  const fileInputRef = useRef(null);
  const cameraPhotoInputRef = useRef(null);
  const cameraVideoInputRef = useRef(null);

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Top Bar with Logout */}
        <div className="flex justify-between items-center pt-4 pb-2">
          <div></div> {/* Spacer */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-medium shadow-lg transition-all duration-200 hover:scale-105"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Capture the Magic
          </h1>
          <p className="text-gray-600">Share your beautiful moments with us</p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-3 mb-6 mt-4">
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold shadow-lg hover:bg-pink-600 transition-all duration-200 hover:scale-105"
          >
            <Gallery className="w-5 h-5" />
            Gallery
          </a>
          <button
            onClick={() => setIsWishModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold shadow-lg hover:bg-purple-600 transition-all duration-200 hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            Wishes
          </button>
        </div>

        {/* Wedding themed banner */}
        <div className="relative flex flex-col items-center mb-6">
          <div className="w-full max-w-lg mx-auto bg-white/80 rounded-2xl shadow-lg border-2 border-pink-200 p-4 flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              {/* <img
                src="/wedding-couple.png"
                alt="Wedding Couple"
                className="w-20 md:w-24 drop-shadow-lg"
                style={{ marginTop: "-1rem", marginBottom: "0.5rem" }}
              /> */}
              <h1 className="text-2xl md:text-3xl font-bold text-pink-700 drop-shadow tracking-wide">
                Akshay <span className="text-pink-400">&</span> Tripti
              </h1>
              <p className="text-sm md:text-base text-pink-900 bg-pink-50 px-3 py-1 rounded-lg shadow">
                2 November, 2025 · Gurugram, India
              </p>
            </div>
            <div className="mt-1 text-center">
              <blockquote className="italic text-pink-700 text-sm md:text-base font-medium">
                "Two souls, but a single thought. Two hearts that beat as one."
              </blockquote>
            </div>
          </div>
        </div>

        <ErrorMessage message={error} />

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => selectEvent(event.id)}
              className={`${event.color} p-4 rounded-xl border-2 hover:shadow-lg transition-all duration-300 hover:scale-105`}
            >
              <div className="text-3xl mb-2">{event.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800">
                {event.name}
              </h3>
            </button>
          ))}
        </div>

        {/* Wishes Display Section */}
        <div className="mt-8">
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
