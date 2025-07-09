export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Log the attempt
    console.log('Testing image URL:', url);
    
    // Fetch the image
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch image. Status: ${response.status}`,
        statusText: response.statusText
      });
    }
    
    // Get the content type
    const contentType = response.headers.get('content-type');
    
    // Check if it's an image
    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({ 
        error: 'URL does not point to an image',
        contentType
      });
    }
    
    // Return success
    return res.status(200).json({
      success: true,
      contentType,
      message: 'Image is accessible'
    });
    
  } catch (error) {
    console.error('Error testing image:', error);
    return res.status(500).json({ 
      error: 'Failed to test image', 
      message: error.message 
    });
  }
}
