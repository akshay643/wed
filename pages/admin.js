import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Shield, Settings, ArrowLeft, Key, Users, LogOut } from "lucide-react";
import LoginBackgroundUploader from "../components/LoginBackgroundUploader";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [isUpdatingBackground, setIsUpdatingBackground] = useState(false);
  const [backgroundSuccess, setBackgroundSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    checkAdminAuth();
    if (isAuthenticated) {
      loadCurrentBackground();
    }
  }, [isAuthenticated]);

  const checkAdminAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user.type === "admin") {
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      // Not authenticated
    }
  };

  const loadCurrentBackground = async () => {
    try {
      const response = await fetch("/api/admin/login-background");
      if (response.ok) {
        const data = await response.json();
        setBackgroundImageUrl(data.imageUrl || "");
      }
    } catch (error) {
      console.error("Failed to load background image:", error);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminPasscode }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setAdminPasscode("");
      } else {
        setError(data.error || "Invalid admin passcode");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleBackgroundImageUpload = async (e) => {
    e.preventDefault();
    setIsUpdatingBackground(true);
    setBackgroundSuccess("");

    const formData = new FormData();
    formData.append("file", e.target.elements.file.files[0]);

    try {
      const response = await fetch("/api/admin/upload-background", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setBackgroundImageUrl(data.url);
        setBackgroundSuccess("Background image updated successfully!");
      } else {
        setError(data.error || "Failed to upload background image");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsUpdatingBackground(false);
    }
  };

  const handleBackgroundUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingBackground(true);
    setBackgroundSuccess("");
    setError("");

    try {
      const response = await fetch("/api/admin/login-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: backgroundImageUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setBackgroundSuccess("Login background updated successfully!");
        setTimeout(() => setBackgroundSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update background");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsUpdatingBackground(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUpdatingBackground(true);
    setBackgroundSuccess("");
    setError("");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target.result;

        try {
          const response = await fetch("/api/admin/upload-background", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageData: imageData,
              fileName: file.name,
              mimeType: file.type,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setBackgroundImageUrl(data.imageUrl);
            setBackgroundSuccess(
              'Image uploaded successfully! Click "Update Background" to apply.'
            );
          } else {
            setError(data.error || "Failed to upload image");
          }
        } catch (error) {
          setError("Failed to upload image. Please try again.");
        } finally {
          setIsUpdatingBackground(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setError("Failed to read file. Please try again.");
      setIsUpdatingBackground(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Access - Wedding Photo App</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <button
                  onClick={() => router.push("/login")}
                  className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Admin Access
                </h2>
                <p className="text-gray-600">
                  Enter admin passcode to manage the wedding app
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="adminPasscode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Admin Passcode
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="adminPasscode"
                      type="password"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-lg"
                      placeholder="Enter admin passcode"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !adminPasscode}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Access Admin Panel
                      <Shield className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Wedding Photo App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Admin Panel
                  </h1>
                  <p className="text-gray-600">Manage your wedding photo app</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Settings */}
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Current Passcodes
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Wedding Passcode:
                    </p>
                    <p className="text-lg font-mono bg-white px-3 py-2 rounded border">
                      {process.env.NEXT_PUBLIC_WEDDING_PASSCODE ||
                        "Akshay&Tripti2025"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Admin Passcode:
                    </p>
                    <p className="text-lg font-mono bg-white px-3 py-2 rounded border">
                      {process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
                        "Admin@Wedding2025"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Quick Actions
                  </h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/")}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Go to Photo App
                  </button>
                  <button
                    onClick={() => router.push("/gallery")}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    View Gallery
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Instructions
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    • Share the <strong>Wedding Passcode</strong> with your
                    guests
                  </p>
                  <p>
                    • Keep the <strong>Admin Passcode</strong> private
                  </p>
                  <p>• Passcodes are set via environment variables</p>
                  <p>• Sessions last 7 days for guests, 24 hours for admin</p>
                </div>
              </div>

              {/* Login Background Management */}
              <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Login Page Background
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Current Background Preview */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Current Background
                    </p>
                    <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                      {backgroundImageUrl ? (
                        <img
                          src={backgroundImageUrl}
                          alt="Login background"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500"
                        style={backgroundImageUrl ? { display: "none" } : {}}
                      >
                        No image set
                      </div>
                    </div>
                  </div>

                  {/* Background Update with Image Compression */}
                  <div>
                    <LoginBackgroundUploader 
                      onUploadSuccess={(url) => {
                        setBackgroundImageUrl(url);
                        setBackgroundSuccess("Login background updated successfully!");
                      }} 
                    />

                    <div className="flex items-center my-4">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="px-3 text-sm text-gray-500">OR</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <form
                      onSubmit={handleBackgroundUpdate}
                      className="space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="backgroundUrl"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Background Image URL
                        </label>
                        <input
                          type="url"
                          id="backgroundUrl"
                          value={backgroundImageUrl}
                          onChange={(e) =>
                            setBackgroundImageUrl(e.target.value)
                          }
                          placeholder="https://example.com/your-wedding-photo.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Or paste a direct link to your image
                        </p>
                      </div>

                      {backgroundSuccess && (
                        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                          {backgroundSuccess}
                        </div>
                      )}

                      {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={
                          isUpdatingBackground || !backgroundImageUrl.trim()
                        }
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isUpdatingBackground ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            Update Background
                            <Settings className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-4 text-xs text-gray-500">
                      <p>
                        💡 <strong>Tips:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Use a romantic couple photo for best results</li>
                        <li>Ensure the image is publicly accessible</li>
                        <li>
                          Higher resolution images look better on all devices
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Environment Variables Info */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Environment Variables
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <code className="bg-gray-200 px-2 py-1 rounded">
                    WEDDING_PASSCODE
                  </code>{" "}
                  - Passcode for wedding guests
                </p>
                <p>
                  <code className="bg-gray-200 px-2 py-1 rounded">
                    ADMIN_PASSCODE
                  </code>{" "}
                  - Passcode for admin access
                </p>
                <p>
                  <code className="bg-gray-200 px-2 py-1 rounded">
                    JWT_SECRET
                  </code>{" "}
                  - Secret key for JWT tokens
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  To change passcodes, update these environment variables and
                  restart the application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
