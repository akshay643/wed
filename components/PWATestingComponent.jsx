import { useState, useEffect } from 'react';

export default function PWATestingComponent() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [manifestData, setManifestData] = useState(null);

  useEffect(() => {
    // Check if app is running in standalone mode
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || 
                    window.navigator.standalone === true);

    // Check if PWA is already installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        setSwRegistration(registration);
      });
    }

    // Fetch manifest data
    fetch('/manifest.json')
      .then(response => response.json())
      .then(data => setManifestData(data))
      .catch(error => console.error('Error loading manifest:', error));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    console.log('Install prompt result:', result);
    
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const getInstallationStatus = () => {
    if (isStandalone || isInstalled) {
      return 'App is installed and running in standalone mode';
    }
    if (installPrompt) {
      return 'Installation prompt is available';
    }
    return 'Installation not available yet';
  };

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    } else if (userAgent.includes('Edg')) {
      return 'Edge';
    }
    return 'Unknown';
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-bold text-lg mb-2">PWA Testing Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Browser:</strong> {getBrowserInfo()}
        </div>
        
        <div>
          <strong>Status:</strong> {getInstallationStatus()}
        </div>
        
        <div>
          <strong>Standalone Mode:</strong> {isStandalone ? '✅ Yes' : '❌ No'}
        </div>
        
        <div>
          <strong>Service Worker:</strong> {swRegistration ? '✅ Registered' : '❌ Not registered'}
        </div>
        
        <div>
          <strong>Manifest:</strong> {manifestData ? '✅ Loaded' : '❌ Not loaded'}
        </div>
        
        <div>
          <strong>Install Prompt:</strong> {installPrompt ? '✅ Available' : '❌ Not available'}
        </div>
      </div>

      {installPrompt && (
        <button
          onClick={handleInstallClick}
          className="mt-3 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          📱 Install App Now!
        </button>
      )}

      {!installPrompt && !isInstalled && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <strong>⚠️ Install prompt not ready yet.</strong><br/>
          Try: DevTools → Application → Manifest → "Add to Home Screen"
        </div>
      )}

      <div className="mt-3 text-xs text-gray-600">
        <p><strong>Tips for testing:</strong></p>
        <ul className="list-disc list-inside">
          <li>Use production build (current: production)</li>
          <li>Visit site multiple times</li>
          <li>Check Chrome DevTools &gt; Application &gt; Manifest</li>
          <li>Force refresh (Cmd+Shift+R)</li>
          <li>Mobile: http://192.168.1.5:3000</li>
        </ul>
      </div>
    </div>
  );
}
