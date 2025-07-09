import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Heart,
  Download,
  Eye,
  Share2,
  Filter,
  ArrowLeft,
  CheckSquare,
  Square,
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
    setSelectedImages((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(imageId)) {
        newSelection.delete(imageId);
      } else {
        newSelection.add(imageId);
      }
      return newSelection;
    });
  };

  const selectAll = () => {
    setSelectedImages(new Set(images.map((img) => img.id)));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
    setIsSelectionMode(false);
  };

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
  };

  const handleDownload = async (img) => {
    try {
      // Create a proper download URL for Google Drive files
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${img.id}`;

      // Fetch the image as a blob
      const response = await fetch(downloadUrl);
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = img.name || `wedding-photo-${img.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: try opening the download URL in a new tab
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${img.id}`;
      window.open(downloadUrl, "_blank");
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 pt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:bg-white/50 mr-4"
              title="Back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <Filter className="w-6 h-6 text-pink-500" />
            <select
              className="border rounded-lg px-3 py-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {eventOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-pink-500" />
              <h2 className="text-2xl font-bold text-gray-800">Gallery</h2>
            </div>
          </div>
        </div>
        {!isSelectionMode ? (
          <button
            onClick={enterSelectionMode}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            title="Select multiple images"
          >
            <CheckSquare className="w-4 h-4" />
            Select
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
              title="Select all images"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              title="Clear selection"
            >
              Cancel
            </button>
            {selectedImages.size > 0 && (
              <button
                onClick={handleBulkDownload}
                disabled={isDownloading}
                className="px-3 py-1 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 flex items-center gap-2"
                title={`Download ${selectedImages.size} selected images`}
              >
                <Download className="w-4 h-4" />
                Download ({selectedImages.size})
              </button>
            )}
          </div>
        )}

        {/* Download Progress Indicator */}
        {isDownloading && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Downloading images...
              </span>
              <span className="text-sm text-gray-500">
                {downloadProgress.current} of {downloadProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (downloadProgress.current / downloadProgress.total) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No images found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-xl shadow p-2 flex flex-col items-center relative"
              >
                {/* Selection Checkbox */}
                {isSelectionMode && (
                  <div
                    className="absolute top-3 left-3 z-10 cursor-pointer"
                    onClick={() => toggleSelection(img.id)}
                  >
                    {selectedImages.has(img.id) ? (
                      <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
                    )}
                  </div>
                )}

                <img
                  src={img.url}
                  alt={img.name}
                  className={`w-full h-32 object-cover rounded-lg cursor-pointer transition-all ${
                    isSelectionMode ? "hover:opacity-80" : ""
                  } ${
                    selectedImages.has(img.id) ? "ring-2 ring-pink-500" : ""
                  }`}
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleSelection(img.id);
                    } else {
                      setPreviewImg(img.url);
                    }
                  }}
                />

                {/* Action Buttons - Only show when not in selection mode */}
                {!isSelectionMode && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setPreviewImg(img.url)}
                      title="Preview"
                    >
                      <Eye className="w-5 h-5 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDownload(img)}
                      title="Download"
                    >
                      <Download className="w-5 h-5 text-green-500" />
                    </button>
                    <button onClick={() => handleShare(img.url)} title="Share">
                      <Share2 className="w-5 h-5 text-pink-500" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {previewImg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setPreviewImg(null)}
            >
              ✕
            </button>
            <img
              src={previewImg}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(Gallery);
