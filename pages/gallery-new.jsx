import { useEffect, useState } from "react";
import {
  Heart,
  Download,
  Share2,
  ArrowLeft,
  CheckSquare,
  Check,
} from "lucide-react";
import withAuth from '../components/withAuth';

const eventOptions = [
  { id: "all", name: "All Events" },
  { id: "mehndi", name: "Mehndi" },
  { id: "haldi", name: "Haldi" },
  { id: "dj-night", name: "DJ Night" },
  { id: "wedding", name: "Wedding" },
];

const fetchGalleryImages = async (event) => {
  const res = await fetch(`/api/gallery?event=${event}`);
  return res.json();
};

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [previewImg, setPreviewImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    current: 0,
    total: 0,
  });

  useEffect(() => {
    setLoading(true);
    fetchGalleryImages(filter).then((data) => {
      setImages(data.images || []);
      setLoading(false);
      setSelectedImages(new Set()); // Clear selection when filter changes
    });
  }, [filter]);

  const toggleSelection = (imageId) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const selectAll = () => {
    setSelectedImages(new Set(images.map((img) => img.id)));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
    setIsSelectionMode(false);
  };

  const handleDownload = async (img) => {
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = img.name || "image.jpg";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const handleBulkDownload = async () => {
    if (selectedImages.size === 0) return;

    setIsDownloading(true);
    const selectedImagesArray = images.filter((img) =>
      selectedImages.has(img.id)
    );
    setDownloadProgress({ current: 0, total: selectedImagesArray.length });

    for (let i = 0; i < selectedImagesArray.length; i++) {
      const img = selectedImagesArray[i];
      setDownloadProgress({
        current: i + 1,
        total: selectedImagesArray.length,
      });

      try {
        // Add a small delay between downloads to avoid overwhelming the browser
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        await handleDownload(img);
      } catch (error) {
        console.error(`Failed to download ${img.name}:`, error);
      }
    }

    setIsDownloading(false);
    setDownloadProgress({ current: 0, total: 0 });
    clearSelection();
  };

  const handleShare = async (url) => {
    if (navigator.share) {
      await navigator.share({ url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">Gallery</h1>
            
            <button
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                  .then(() => window.location.href = '/login');
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3 overflow-x-auto">
            {eventOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${
                  filter === option.id
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      {isSelectionMode && (
        <div className="bg-pink-50 border-b border-pink-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-pink-700 font-medium">
              {selectedImages.size} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded-lg"
              >
                All
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg"
              >
                Cancel
              </button>
              {selectedImages.size > 0 && (
                <button
                  onClick={handleBulkDownload}
                  disabled={isDownloading}
                  className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg disabled:opacity-50 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Download Progress */}
      {isDownloading && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">
              Downloading...
            </span>
            <span className="text-sm text-blue-600">
              {downloadProgress.current}/{downloadProgress.total}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{
                width: `${(downloadProgress.current / downloadProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading photos...</div>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Heart className="w-12 h-12 mb-4 text-gray-300" />
            <p>No photos yet</p>
            <p className="text-sm mt-1">Photos will appear here once uploaded</p>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            {!isSelectionMode && images.length > 0 && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                >
                  <CheckSquare className="w-4 h-4" />
                  Select
                </button>
              </div>
            )}

            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative">
                  {/* Selection Overlay */}
                  {isSelectionMode && (
                    <div
                      className="absolute top-2 left-2 z-10"
                      onClick={() => toggleSelection(img.id)}
                    >
                      {selectedImages.has(img.id) ? (
                        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-white/80 border-2 border-gray-300 rounded-full backdrop-blur-sm" />
                      )}
                    </div>
                  )}

                  {/* Image */}
                  <div
                    className={`relative aspect-square overflow-hidden rounded-xl ${
                      selectedImages.has(img.id) ? "ring-2 ring-pink-500" : ""
                    }`}
                    onClick={() => {
                      if (isSelectionMode) {
                        toggleSelection(img.id);
                      } else {
                        setPreviewImg(img.url);
                      }
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    
                    {/* Action Buttons Overlay - Only show when not in selection mode */}
                    {!isSelectionMode && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 group">
                        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(img);
                            }}
                            className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(img.url);
                            }}
                            className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <button
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-2xl"
              onClick={() => setPreviewImg(null)}
            >
              ✕
            </button>
            <img
              src={previewImg}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(Gallery);
