import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Save the event so it can be triggered later
      setDeferredPrompt(e)
      // Show the install button
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Remember user dismissed for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if user already dismissed this session
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null
  }

  if (!showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg shadow-lg border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Install Wedding App</h3>
          <p className="text-xs opacity-90">
            Add to your home screen for quick access to wedding photos and memories!
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white text-xs px-2 py-1"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="bg-white text-purple-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
