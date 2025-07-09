const { serialize } = require('cookie');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear the auth cookie
  const cookie = serialize('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}
