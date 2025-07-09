import { useState, useEffect } from 'react'

export default function NgrokPWAFix() {
  const [isNgrok, setIsNgrok] = useState(false)
  const [ngrokUrl, setNgrokUrl] = useState('')
  const [swStatus, setSwStatus] = useState('checking')
  const [manifestStatus, setManifestStatus] = useState('checking')

  useEffect(() => {
    // Detect if running on ngrok
    const hostname = window.location.hostname
    const isNgrokTunnel = hostname.includes('.ngrok.io') || hostname.includes('.ngrok-free.app')
    setIsNgrok(isNgrokTunnel)
    setNgrokUrl(window.location.origin)

    if (isNgrokTunnel) {
      console.log('🔗 Ngrok tunnel detected:', window.location.origin)
      fixNgrokPWA()
    }
  }, [])

  const fixNgrokPWA = async () => {
    try {
      // 1. Check and fix manifest
      await checkManifest()
      
      // 2. Re-register service worker with correct scope
      await registerServiceWorkerForNgrok()
      
      // 3. Update PWA install prompt
      await triggerInstallPrompt()
    } catch (error) {
      console.error('Error fixing ngrok PWA:', error)
    }
  }

  const checkManifest = async () => {
    try {
      const response = await fetch('/manifest.json')
      if (response.ok) {
        const manifest = await response.json()
        console.log('✅ Manifest loaded for ngrok:', manifest)
        setManifestStatus('loaded')
      } else {
        setManifestStatus('failed')
      }
    } catch (error) {
      console.error('Manifest error:', error)
      setManifestStatus('failed')
    }
  }

  const registerServiceWorkerForNgrok = async () => {
    if ('serviceWorker' in navigator) {
      try {
        // Unregister existing service workers
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (let registration of registrations) {
          await registration.unregister()
        }

        // Register with ngrok-specific options
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        })

        console.log('✅ Service Worker registered for ngrok:', registration)
        setSwStatus('registered')

        // Wait for SW to be ready
        await navigator.serviceWorker.ready
        console.log('✅ Service Worker ready for ngrok')

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error)
        setSwStatus('failed')
      }
    } else {
      setSwStatus('unsupported')
    }
  }

  const triggerInstallPrompt = () => {
    // Force trigger beforeinstallprompt event check
    setTimeout(() => {
      console.log('🔄 Checking for install prompt on ngrok...')
      
      // Dispatch a custom event to force PWA components to re-check
      window.dispatchEvent(new Event('pwa-check-install'))
    }, 2000)
  }

  const testNgrokPWA = () => {
    const tests = [
      {
        name: 'HTTPS',
        check: () => window.location.protocol === 'https:',
        result: window.location.protocol === 'https:' ? '✅' : '❌'
      },
      {
        name: 'Service Worker',
        check: () => 'serviceWorker' in navigator,
        result: 'serviceWorker' in navigator ? '✅' : '❌'
      },
      {
        name: 'Manifest',
        check: () => document.querySelector('link[rel="manifest"]'),
        result: document.querySelector('link[rel="manifest"]') ? '✅' : '❌'
      },
      {
        name: 'Ngrok Tunnel',
        check: () => isNgrok,
        result: isNgrok ? '✅' : '❌'
      }
    ]

    const results = tests.map(test => `${test.result} ${test.name}`).join('\n')
    alert(`Ngrok PWA Test Results:\n\n${results}\n\nURL: ${ngrokUrl}`)
  }

  const copyNgrokUrl = () => {
    navigator.clipboard.writeText(ngrokUrl)
    alert(`📋 Ngrok URL copied to clipboard:\n${ngrokUrl}`)
  }

  if (!isNgrok) {
    return null // Only show for ngrok tunnels
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-center mb-2">
        <span className="text-lg mr-2">🔗</span>
        <div>
          <div className="font-bold text-blue-800">Ngrok PWA Mode</div>
          <div className="text-xs text-blue-600">PWA optimized for tunnel</div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <strong>Tunnel:</strong> {ngrokUrl.replace('https://', '')}
        </div>
        <div>
          <strong>SW Status:</strong> 
          {swStatus === 'checking' && ' 🔄 Checking...'}
          {swStatus === 'registered' && ' ✅ Registered'}
          {swStatus === 'failed' && ' ❌ Failed'}
          {swStatus === 'unsupported' && ' ❌ Unsupported'}
        </div>
        <div>
          <strong>Manifest:</strong> 
          {manifestStatus === 'checking' && ' 🔄 Checking...'}
          {manifestStatus === 'loaded' && ' ✅ Loaded'}
          {manifestStatus === 'failed' && ' ❌ Failed'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          onClick={testNgrokPWA}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
        >
          Test PWA
        </button>
        <button
          onClick={copyNgrokUrl}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
        >
          Copy URL
        </button>
        <button
          onClick={fixNgrokPWA}
          className="col-span-2 bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
        >
          🔧 Re-initialize PWA
        </button>
      </div>

      <div className="mt-2 text-xs text-blue-600">
        <strong>Mobile Testing:</strong><br/>
        Share this URL with mobile devices for PWA testing
      </div>
    </div>
  )
}
