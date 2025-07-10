import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);

    // Filter files that start with 'wedding-' and are image files
    const weddingImages = files
      .filter(file => {
        const fileName = file.toLowerCase();
        return (
          fileName.startsWith('wedding-') &&
          (fileName.endsWith('.jpg') ||
           fileName.endsWith('.jpeg') ||
           fileName.endsWith('.png') ||
           fileName.endsWith('.webp'))
        );
      })
      .map(file => `/${file}`)
      .sort(); // Sort alphabetically for consistent order

    // If no wedding images found, return defaults
    if (weddingImages.length === 0) {
      weddingImages.push('/wedding-couple.jpeg', '/wedding-souple-2.jpg');
    }

    res.status(200).json(weddingImages);
  } catch (error) {
    console.error('Error reading wedding images:', error);
    res.status(500).json({
      error: 'Failed to load images',
      fallback: ['/wedding-couple.jpeg', '/wedding-souple-2.jpg']
    });
  }
}
