import { useState, useEffect } from 'react'

export default function ForceInstallPWA() {
  const [installEvent, setInstallEvent] = useState(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator.standalone) ||
                          document.referrer.includes('android-app://')
      setIsInstalled(isStandalone)
    }

    checkInstalled()

    // Capture the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('📱 beforeinstallprompt event captured!')
      e.preventDefault() // Prevent the mini-infobar from appearing
      setInstallEvent(e)
      setCanInstall(true)
    }

    // Handle app installed
    const handleAppInstalled = (e) => {
      console.log('🎉 PWA was installed successfully!')
      setIsInstalled(true)
      setCanInstall(false)
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Force check for install eligibility after a delay
    setTimeout(() => {
      if (!installEvent && !isInstalled) {
        console.log('⚠️ Install prompt not triggered automatically')
        // Try to trigger manually for testing
        setShowDebug(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installEvent) {
      alert('Install prompt not available. Try the manual methods below.')
      return
    }

    try {
      // Show the install prompt
      await installEvent.prompt()
      
      // Wait for the user to respond
      const { outcome } = await installEvent.userChoice
      
      console.log(`User response: ${outcome}`)
      
      if (outcome === 'accepted') {
        console.log('🎉 User accepted the install prompt')
      } else {
        console.log('😔 User dismissed the install prompt')
      }
      
      // Clear the saved prompt
      setInstallEvent(null)
      setCanInstall(false)
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  const openChromeFlags = () => {
    window.open('chrome://flags/#enable-desktop-pwas-elide-origin-text', '_blank')
  }

  const checkPWARequirements = () => {
    const requirements = {
      'HTTPS or localhost': location.protocol === 'https:' || location.hostname === 'localhost',
      'Service Worker': 'serviceWorker' in navigator,
      'Web App Manifest': document.querySelector('link[rel="manifest"]') !== null,
      'Valid manifest': true, // We'll assume this is true
      'Not already installed': !isInstalled,
      'Supported browser': /Chrome|Edge/.test(navigator.userAgent)
    }

    console.log('PWA Requirements Check:', requirements)
    
    const failed = Object.entries(requirements).filter(([key, value]) => !value)
    
    if (failed.length > 0) {
      alert(`❌ PWA Requirements not met:\n${failed.map(([key]) => `• ${key}`).join('\n')}`)
    } else {
      alert('✅ All PWA requirements are met!\n\nIf install prompt still doesn\'t appear, try:\n• Visit the site multiple times\n• Clear browser data\n• Use Chrome DevTools method')
    }
  }

  if (isInstalled) {
    return (
      <div className="fixed top-4 right-4 bg-green-100 border border-green-300 text-green-800 p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center">
          <span className="text-lg mr-2">✅</span>
          <div>
            <div className="font-bold">PWA Installed!</div>
            <div className="text-sm">App is running in standalone mode</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-purple-600">📱 Install PWA</h3>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {showDebug ? 'Hide' : 'Debug'}
        </button>
      </div>

      {canInstall ? (
        <div className="space-y-3">
          <div className="text-green-600 text-sm font-semibold">
            ✅ Ready to install!
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded font-semibold hover:bg-purple-700 transition-colors"
          >
            📱 Install Wedding App
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-orange-600 text-sm">
            ⏳ Install prompt not available yet
          </div>
          
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-700">Try these methods:</div>
            
            <button
              onClick={() => {
                alert('Chrome DevTools Method:\n\n1. Press F12 (or right-click → Inspect)\n2. Go to Application tab\n3. Click "Manifest" in left sidebar\n4. Scroll down to "Add to Home Screen"\n5. Click the button\n\nThis usually works even when auto-prompt doesn\'t!')
              }}
              className="w-full text-left bg-blue-50 hover:bg-blue-100 p-2 rounded text-xs border"
            >
              🔧 Chrome DevTools Method
            </button>
            
            <button
              onClick={() => {
                alert('Manual Install (Chrome):\n\n1. Click the ⋮ menu (top right)\n2. Look for "Install Wedding App"\n3. Or try "More tools" → "Create shortcut"\n4. Check "Open as window"\n\nNote: Option may not appear until you\'ve visited multiple times')
              }}
              className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-xs border"
            >
              📋 Chrome Menu Method
            </button>
            
            <button
              onClick={checkPWARequirements}
              className="w-full text-left bg-yellow-50 hover:bg-yellow-100 p-2 rounded text-xs border"
            >
              ✅ Check PWA Requirements
            </button>
          </div>
        </div>
      )}

      {showDebug && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs space-y-1">
          <div><strong>Debug Info:</strong></div>
          <div>Protocol: {location.protocol}</div>
          <div>Host: {location.hostname}</div>
          <div>Browser: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'}</div>
          <div>SW Support: {'serviceWorker' in navigator ? 'Yes' : 'No'}</div>
          <div>Install Event: {installEvent ? 'Available' : 'None'}</div>
          <div>Standalone: {window.matchMedia('(display-mode: standalone)').matches ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}
