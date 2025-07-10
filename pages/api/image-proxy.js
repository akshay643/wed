// Rate limiting to prevent 429 errors
const requestCounts = new Map();
const RATE_LIMIT = 10; // Max requests per minute per ID
const RATE_WINDOW = 60000; // 1 minute

function isRateLimited(id) {
  const now = Date.now();
  const key = id;
  const requests = requestCounts.get(key) || [];

  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < RATE_WINDOW);

  if (validRequests.length >= RATE_LIMIT) {
    return true;
  }

  // Add current request
  validRequests.push(now);
  requestCounts.set(key, validRequests);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, width, height, quality = 'medium', format } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Image ID is required' });
  }

  // Check rate limiting
  if (isRateLimited(id)) {
    console.log(`Rate limited for image ID: ${id}`);
    // Fallback to the authenticated API
    return res.redirect(307, `/api/image?fileId=${id}`);
  }

  try {
    const userAgent = req.headers['user-agent'] || 'Mozilla/5.0 (compatible; WeddingApp/1.0)';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

    // Try Google Drive public URLs first (faster)
    let driveUrl = `https://drive.google.com/uc?export=view&id=${id}`;

    // Use different approaches based on quality
    if (quality === 'thumbnail') {
      // For thumbnails, try the public thumbnail API first
      driveUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w${isMobile ? '300' : '400'}-h${isMobile ? '300' : '400'}`;
    } else if (quality === 'preview') {
      driveUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w${isMobile ? '600' : '800'}-h${isMobile ? '600' : '800'}`;
    } else if (quality === 'background') {
      driveUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w${isMobile ? '800' : '1200'}-h${isMobile ? '600' : '900'}`;
    }

    // Simplified headers to avoid detection
    const fetchOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://drive.google.com/',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    };

    console.log(`Attempting to fetch image from: ${driveUrl}`);
    const response = await fetch(driveUrl, fetchOptions);

    if (!response.ok) {
      console.log(`Direct Drive URL failed (${response.status}), falling back to authenticated API`);
      // Fallback to the authenticated API endpoint
      return res.redirect(307, `/api/image?fileId=${id}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Check if this is actually an image
    if (!contentType.startsWith('image/')) {
      console.log(`Not an image content type (${contentType}), falling back to authenticated API`);
      return res.redirect(307, `/api/image?fileId=${id}`);
    }

    // Conservative caching to avoid rate limits
    let cacheControl;
    if (quality === 'thumbnail') {
      cacheControl = 'public, max-age=86400, s-maxage=86400'; // 1 day for thumbnails
    } else if (quality === 'preview') {
      cacheControl = 'public, max-age=43200, s-maxage=43200'; // 12 hours for previews
    } else {
      cacheControl = 'public, max-age=3600, s-maxage=3600'; // 1 hour for others
    }

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Vary', 'Accept-Encoding, User-Agent');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Image-Quality', quality);
    res.setHeader('X-Mobile-Optimized', isMobile ? 'true' : 'false');

    // Stream the response
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Successfully proxied ${quality} image (${buffer.length} bytes) for ${isMobile ? 'Mobile' : 'Desktop'} device`);
    res.status(200).send(buffer);

  } catch (error) {
    console.error('Error proxying image:', error);

    // If anything goes wrong, fallback to the authenticated API
    console.log(`Falling back to authenticated API for image: ${id}`);
    return res.redirect(307, `/api/image?fileId=${id}`);
  }
}
