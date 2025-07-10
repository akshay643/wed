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
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    checkAuth();
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
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: "url('/wedding-couple.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >

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
