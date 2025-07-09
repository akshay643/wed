import { useState } from 'react';

export default function WishesTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testGet = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wishes');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error.message);
    }
    setLoading(false);
  };

  const testPost = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: 'Test Guest',
          wish: 'Wishing you both a lifetime of happiness!',
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wishes API Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testGet}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test GET /api/wishes
          </button>
          
          <button
            onClick={testPost}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test POST /api/wishes
          </button>
        </div>

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {result && (
          <div className="bg-white p-4 rounded-lg shadow border">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
