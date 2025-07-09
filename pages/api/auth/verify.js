const { checkAuth } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { authenticated, user } = checkAuth(req);

  if (!authenticated) {
    return res.status(401).json({ 
      authenticated: false,
      error: 'Not authenticated' 
    });
  }

  res.status(200).json({
    authenticated: true,
    user: {
      type: user.type,
      loginTime: user.loginTime
    }
  });
}
