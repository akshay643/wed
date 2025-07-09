import { useState, useEffect } from 'react'

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isInstalled && isOnline) {
    return null // Don't show status if not installed and online
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {isInstalled && (
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs mb-2 shadow-lg">
          📱 App Installed
        </div>
      )}
      {!isOnline && (
        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs shadow-lg animate-pulse">
          📶 Offline Mode
        </div>
      )}
    </div>
  )
}
