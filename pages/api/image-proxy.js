export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Image ID is required' });
  }

  try {
    // Google Drive direct download URL
    const driveUrl = `https://drive.google.com/uc?export=view&id=${id}`;

    console.log(`Proxying image request for ID: ${id}`);

    // Get the actual user's User-Agent from the request, with fallbacks
    const userAgent = req.headers['user-agent'] ||
      'Mozilla/5.0 (compatible; WeddingApp/1.0)';

    // Get other relevant headers from the original request
    const acceptHeader = req.headers['accept'] || 'image/*,*/*;q=0.8';
    const acceptLanguage = req.headers['accept-language'] || 'en-US,en;q=0.9';

    // Fetch the image from Google Drive using the actual user's headers
    const response = await fetch(driveUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': acceptHeader,
        'Accept-Language': acceptLanguage,
        'Referer': 'https://drive.google.com/',
        'DNT': '1', // Do Not Track
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch image from Drive: ${response.status} ${response.statusText}`);
      console.error(`User-Agent used: ${userAgent}`);
      return res.status(response.status).json({
        error: 'Failed to fetch image from Google Drive',
        status: response.status,
        statusText: response.statusText,
        userAgent: userAgent
      });
    }

    // Get the image content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Set appropriate headers for caching and content type
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Stream the image data directly to the response
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Successfully proxied image for ${userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} device`);
    res.status(200).send(buffer);

  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
