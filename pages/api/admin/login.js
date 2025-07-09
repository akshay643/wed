const { verifyAdminPasscode, generateToken } = require('../../../lib/auth');
const { serialize } = require('cookie');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminPasscode } = req.body;

  if (!adminPasscode) {
    return res.status(400).json({ error: 'Admin passcode is required' });
  }

  if (!verifyAdminPasscode(adminPasscode)) {
    return res.status(401).json({ error: 'Invalid admin passcode' });
  }

  // Generate admin JWT token
  const token = generateToken({
    type: 'admin',
    loginTime: Date.now()
  });

  // Set HTTP-only cookie
  const cookie = serialize('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours for admin
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);

  res.status(200).json({
    success: true,
    message: 'Admin authentication successful',
    token
  });
}
