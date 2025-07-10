import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { ArrowRight, ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1: Name, 2: Passcode
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [weddingImages, setWeddingImages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    checkAuth();
    // Load wedding images
    loadWeddingImages();
  }, []);

  useEffect(() => {
    // Auto-rotate background images every 10 seconds
    if (weddingImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % weddingImages.length
        );
      }, 10000); // 10 seconds

      return () => clearInterval(interval);
    }
  }, [weddingImages]);

  const loadWeddingImages = async () => {
    try {
      // Get list of wedding images from the API
      const response = await fetch('/api/wedding-images');
      if (response.ok) {
        const images = await response.json();
        setWeddingImages(images);
      } else {
        // Fallback to default images if API fails
        setWeddingImages([
          '/wedding-couple.jpeg',
          '/wedding-souple-2.jpg'
        ]);
      }
    } catch (error) {
      console.log('Failed to load wedding images, using defaults');
      // Fallback to default images
      setWeddingImages([
        '/wedding-couple.jpeg',
        '/wedding-souple-2.jpg'
      ]);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        // Already authenticated, redirect to main app
        router.push("/");
      }
      // It's normal to get a 401 if not authenticated, no need for error handling
    } catch (error) {
      // Network error or other issue, just stay on login page
      console.log("Auth check failed, staying on login page");
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
    <>        <Head>
        <title>Welcome - Akshay & Tripti Wedding</title>
        <meta
          name="description"
          content="Join us in celebrating our special day"
        />
      </Head>

      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: weddingImages.length > 0
            ? `url('${weddingImages[currentImageIndex]}')`
            : "url('/wedding-couple.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50 backdrop-blur-[1px]"></div>

        {/* Image indicators */}
        {weddingImages.length > 1 && (
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            {weddingImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/30 ${
                  index === currentImageIndex
                    ? 'bg-white/90 scale-125 shadow-lg'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Switch to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        {weddingImages.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm border border-white/20">
            {currentImageIndex + 1} / {weddingImages.length}
          </div>
        )}

        {/* Preload next image for smooth transition */}
        {weddingImages.length > 1 && (
          <div className="hidden">
            <img
              src={weddingImages[(currentImageIndex + 1) % weddingImages.length]}
              alt="Preload next"
              onLoad={() => {/* Preload complete */}}
            />
          </div>
        )}

        {/* Main Content Container - Flexbox to push content to bottom */}
        <div className="relative z-10 w-full max-w-md min-h-screen flex flex-col justify-end pb-8">

          {/* Wedding Title and Login Form - At the bottom */}
          <div className="space-y-6">
            {/* Wedding Title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Akshay & Tripti Wedding
              </h1>
              <p className="text-white/90 text-lg mb-6 drop-shadow-md">
                Please Share your photos & videos with us for this special day! ❤️
              </p>
            </div>

            {/* Login Form Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/30 ring-1 ring-white/20">
            {step === 1 ? (
              /* Step 1: Name Form */
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm"
                  >
                    Welcome to our first class wedding celebration! Please share your name
                    with us
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-400/50 focus:border-white/50 outline-none transition-all text-base bg-white/20 backdrop-blur-sm text-white placeholder-white/70"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-100 text-sm text-center bg-red-500/20 backdrop-blur-sm p-2 rounded-xl border border-red-300/30">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500/80 to-rose-600/80 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-semibold text-base hover:from-pink-600/80 hover:to-rose-700/80 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:ring-offset-2 shadow-lg border border-white/20"
                >
                  Let's Go!
                </button>
              </form>
            ) : (
              /* Step 2: Passcode Form */
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-white mb-1 drop-shadow-sm">
                    Welcome, {name}! 👋
                  </h3>
                  <p className="text-white/80 text-sm drop-shadow-sm">
                    Enter the passcode to access our photo collection
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="passcode"
                    className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm"
                  >
                    Passcode
                  </label>
                  <input
                    type="password"
                    id="passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode"
                    className="w-full px-3 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-400/50 focus:border-white/50 outline-none transition-all text-base bg-white/20 backdrop-blur-sm text-center tracking-widest text-white placeholder-white/70"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-100 text-sm text-center bg-red-500/20 backdrop-blur-sm p-2 rounded-xl border border-red-300/30">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError("");
                      setPasscode("");
                    }}
                    className="flex-1 bg-white/20 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-2 text-sm border border-white/30"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-pink-500/80 to-rose-600/80 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-semibold hover:from-pink-600/80 hover:to-rose-700/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-white/20"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Enter
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
