const { verifyPasscode, generateToken } = require('../../../lib/auth');
const { serialize } = require('cookie');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, passcode } = req.body;

  if (!name || !passcode) {
    return res.status(400).json({ error: 'Name and passcode are required' });
  }

  if (!verifyPasscode(passcode)) {
    return res.status(401).json({ error: 'Invalid passcode' });
  }

  // Generate JWT token with user name
  const token = generateToken({
    type: 'guest',
    name: name.trim(),
    loginTime: Date.now()
  });

  // Set HTTP-only cookie
  const cookie = serialize('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);

  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    name: name.trim(),
    token // Also return token for client-side storage if needed
  });
}
