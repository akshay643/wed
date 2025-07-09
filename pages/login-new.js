import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Heart, ArrowRight, ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1: Name, 2: Passcode
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("/wedding-couple.png");
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [fadeState, setFadeState] = useState("fade-in");
  const router = useRouter();

  // Wedding quotes to display during image loading
  const weddingQuotes = [
    "A successful marriage requires falling in love many times, always with the same person.",
    "A great marriage is not when the perfect couple comes together. It is when an imperfect couple learns to enjoy their differences.",
    "The best thing to hold onto in life is each other.",
    "Love doesn't make the world go 'round. Love is what makes the ride worthwhile.",
    "To love and be loved is to feel the sun from both sides.",
    "A wedding is a celebration of love, commitment, shared joy, and a promise for the future.",
    "True love stories never have endings.",
    "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
    "Once in a while, right in the middle of an ordinary life, love gives us a fairy tale.",
    "When you realize you want to spend the rest of your life with somebody, you want the rest of your life to start as soon as possible.",
  ];

  // Quote rotation effect
  useEffect(() => {
    if (isImageLoading) {
      const fadeInterval = setInterval(() => {
        if (fadeState === "fade-in") {
          setFadeState("fade-out");
        } else {
          setFadeState("fade-in");
          setCurrentQuoteIndex(
            (prevIndex) => (prevIndex + 1) % weddingQuotes.length
          );
        }
      }, 4000);

      return () => clearInterval(fadeInterval);
    }
  }, [isImageLoading, fadeState, weddingQuotes.length]);

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
      // It's normal to get a 401 if not authenticated, no need for error handling
    } catch (error) {
      // Network error or other issue, just stay on login page
      console.log("Auth check failed, staying on login page");
    }
  };

  const loadBackgroundImage = async () => {
    try {
      const response = await fetch("/api/admin/login-background");
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          // We have several options to try for Google Drive images
          let urlsToTry = [];
          let fileId = null;
          
          // Extract file ID from various URL formats
          if (data.fileId) {
            // If we have a direct fileId, use it
            fileId = data.fileId;
          } else if (data.imageUrl.includes("drive.google.com")) {
            // Try to extract from URL
            fileId =
              data.imageUrl.match(/id=([^&]+)/)?.[1] ||
              data.imageUrl.match(/\/d\/([^/]+)/)?.[1];
          }

          if (fileId) {
            // Add different URL formats to try in order
            urlsToTry = [
              // Format 1: Direct access through content server (often most reliable)
              `https://lh3.googleusercontent.com/d/${fileId}`,
              // Format 2: Export with download param (reliable for images)
              `https://drive.google.com/uc?export=download&id=${fileId}`,
              // Format 3: Standard thumbnail (works for many images)
              `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,
              // Format 4: Standard export view (another option)
              `https://drive.google.com/uc?export=view&id=${fileId}`,
              // Use data.thumbnailUrl if available as another option
              data.thumbnailUrl,
              // Use data.viewUrl if available as another option
              data.viewUrl,
              // Use data.directUrl if available as another option  
              data.directUrl,
              // Original URL as fallback
              data.imageUrl,
              // Default fallback
              "/wedding-couple.png"
            ].filter(Boolean); // Remove any undefined URLs
          } else {
            // Just try the original URL
            urlsToTry = [data.imageUrl];
          }

          // Add cache busting to first URL
          const firstUrlWithCache = `${urlsToTry[0]}${
            urlsToTry[0].includes("?") ? "&" : "?"
          }t=${new Date().getTime()}`;
          
          // Try loading the first option
          const tryLoadImage = (urlIndex) => {
            if (urlIndex >= urlsToTry.length) {
              // If we've tried all URLs, fall back to default
              console.log("All background image URLs failed, using default");
              setBackgroundImage("/wedding-couple.png");
              setIsImageLoading(false);
              return;
            }
            
            const currentUrl = urlIndex === 0 
              ? firstUrlWithCache 
              : urlsToTry[urlIndex];
              
            console.log(`Trying URL format ${urlIndex + 1}:`, currentUrl);
            
            const img = new Image();
            img.crossOrigin = "anonymous"; // Try to avoid CORS issues
            
            img.onload = () => {
              console.log(`Background image loaded successfully with format ${urlIndex + 1}`);
              setBackgroundImage(currentUrl);
              setIsImageLoading(false);
            };
            
            img.onerror = () => {
              console.log(`Format ${urlIndex + 1} failed, trying next URL format`);
              // Try the next URL format
              tryLoadImage(urlIndex + 1);
            };
            
            // Set a timeout in case the image load hangs
            const timeout = setTimeout(() => {
              console.log(`Format ${urlIndex + 1} timed out, trying next URL format`);
              img.src = ""; // Cancel current loading
              tryLoadImage(urlIndex + 1);
            }, 5000); // 5 second timeout
            
            img.onload = () => {
              clearTimeout(timeout);
              console.log(`Background image loaded successfully with format ${urlIndex + 1}`);
              setBackgroundImage(currentUrl);
              setIsImageLoading(false);
            };
            
            img.onerror = () => {
              clearTimeout(timeout);
              console.log(`Format ${urlIndex + 1} failed, trying next URL format`);
              tryLoadImage(urlIndex + 1);
            };
            
            img.src = currentUrl;
          };
          
          // Start trying URLs
          tryLoadImage(0);
        } else {
          setIsImageLoading(false);
        }
      } else {
        setIsImageLoading(false);
      }
    } catch (error) {
      setIsImageLoading(false);
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
        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
          .fade-in {
            animation: fadeIn 1.5s ease-in-out;
          }
          .fade-out {
            animation: fadeOut 1.5s ease-in-out;
          }
        `}</style>
      </Head>

      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundColor: "#f3f4f6", // Fallback color
        }}
      >
        {/* Wedding Quotes Display (shown during loading) */}
        {isImageLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-r from-pink-300 to-purple-400">
            <div
              className={`max-w-2xl text-center p-8 transition-opacity duration-1000 ${
                fadeState === "fade-in" ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex justify-center mb-4">
                <Heart className="w-8 h-8 text-white" fill="white" />
              </div>
              <p className="text-white text-xl md:text-2xl font-medium italic">
                "{weddingQuotes[currentQuoteIndex]}"
              </p>
            </div>
          </div>
        )}
       
        {/* Dynamic Background Image */}
        {backgroundImage && (
          <>
            {/* CSS Background Image Approach */}
            <div
              className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
                !isImageLoading ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url("${backgroundImage}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundBlendMode: "luminosity" // This helps with display issues
              }}
            />

            {/* Fallback IMG tag approach (in case CSS background doesn't work) */}
            <img
              src={backgroundImage}
              alt="Wedding Background"
              className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
                !isImageLoading ? "opacity-100" : "opacity-0"
              }`}
              style={{ 
                display: "none", // Hidden by default, shown via JS if needed
                objectPosition: "center" // Ensure proper centering
              }}
              onError={(e) => {
                console.log("Fallback IMG tag failed, using default image");
                e.target.src = "/wedding-couple.png";
                e.target.style.display = "block"; // Show the fallback
              }}
              onLoad={(e) => {
                // After a slight delay to allow CSS to apply
                setTimeout(() => {
                  // Check if the CSS background is working
                  const computedStyle = window.getComputedStyle(e.target.previousSibling);
                  const hasBgImage = computedStyle.backgroundImage && 
                                     computedStyle.backgroundImage !== 'none' &&
                                     !computedStyle.backgroundImage.includes('wedding-couple.png');
                  
                  if (!hasBgImage) {
                    console.log("CSS background not detected, showing IMG tag fallback");
                    e.target.style.display = "block";
                  } else {
                    console.log("CSS background working, keeping IMG tag hidden");
                  }
                }, 300);
              }}
            />
          </>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-md">

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
              Akshay & Tripti Wedding
            </h1>
            <p className="text-white/90 text-lg mb-6 drop-shadow-md">
              Please Share your photos & videos with us for this special day! ❤️
            </p>
          </div>

          {/* Login Form Card - Moved to the bottom */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20 mt-auto">
            {step === 1 ? (
              /* Step 1: Name Form */
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
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
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-base bg-white/80"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 px-4 rounded-xl font-semibold text-base hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg"
                >
                  Let's Go!
                </button>
              </form>
            ) : (
              /* Step 2: Passcode Form */
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    Welcome, {name}! 👋
                  </h3>
                  <p className="text-gray-600 text-sm">
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
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-base bg-white/80 text-center tracking-widest"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-xl">
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
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
    </>
  );
};

export default LoginPage;
