import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Heart, Lock, ArrowRight, User, ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1: Name, 2: Passcode
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("/wedding-couple.png");
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    checkAuth();
    // Load custom background image
    loadBackgroundImage();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        // Already authenticated, redirect to main app
        router.push("/");
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  };

  const loadBackgroundImage = async () => {
    try {
      console.log("Fetching background image from API...");
      const response = await fetch("/api/admin/login-background");
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          console.log("Received background image URL:", data.imageUrl);
          // Directly set the background image without pre-loading
          setBackgroundImage(data.imageUrl);
        }
      }
    } catch (error) {
      console.error("Error loading background image:", error);
      console.log("Using default background image");
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setError("");
      setStep(2);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          passcode: passcode.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, redirect to main app
        router.push("/");
      } else {
        setError(data.error || "Invalid passcode");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Welcome - Akshay & Tripti Wedding</title>
        <meta
          name="description"
          content="Join us in celebrating our special day"
        />
      </Head>

      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundColor: "#f3f4f6", // Fallback color if image fails to load
        }}
      >
        {/* Direct Background Image - high quality */}
        {backgroundImage !== "/wedding-couple.png" && (
          <img 
            src={backgroundImage + "&nocache=" + new Date().getTime()}
            className="absolute inset-0 w-full h-full object-cover"
            alt=""
            style={{ zIndex: 0 }}
            onError={(e) => {
              console.error("Failed to load high-quality background image, falling back to default");
              setBackgroundImage("/wedding-couple.png");
            }}
          />
        )}
        
        {/* Fallback background */}
        {backgroundImage === "/wedding-couple.png" && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Debug Info - Remove in production */}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs p-2 rounded z-50">
            <div title={backgroundImage}>URL: {backgroundImage.substring(0, 20)}...</div>
            <div>Type: {backgroundImage.includes('drive.google.com') ? 'Google Drive' : 'Other'}</div>
          </div>
          
          {/* Couple Profile Circle */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full border-4 border-white/80 overflow-hidden bg-white/10 backdrop-blur-sm">
              <img
                src="/wedding-couple.png"
                alt="Couple"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>

          {/* Wedding Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Akshay & Tripti Weddingssss
            </h1>
            <p className="text-white/90 text-lg mb-6 drop-shadow-md">
              Please Share your photos & videos with us for this special day! ❤️
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            {step === 1 ? (
              /* Step 1: Name Form */
              <form onSubmit={handleNameSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-lg bg-white/80"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg"
                >
                  Let's Go!
                </button>
              </form>
            ) : (
              /* Step 2: Passcode Form */
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Welcome, {name}! 👋
                  </h3>
                  <p className="text-gray-600">
                    Enter the passcode to access our photo collection
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="passcode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Passcode
                  </label>
                  <input
                    type="password"
                    id="passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode"
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-lg bg-white/80 text-center tracking-widest"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError("");
                      setPasscode("");
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Enter
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Hearts */}
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className="w-4 h-4 text-white/70 animate-pulse"
                fill="currentColor"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
