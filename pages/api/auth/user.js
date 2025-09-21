export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // For demo purposes, we'll determine role based on email
    // In production, this should check JWT tokens or session data
    const userEmail = req.headers['user-email'] || 'manus@manus.com';
    
    let role = 'client';
    
    // Admin users (you can expand this list)
    const adminEmails = [
      'manus@manus.com',
      'admin@digitribe.se',
      'james.sharp@climberbi.co.uk'
    ];
    
    if (adminEmails.includes(userEmail)) {
      role = 'admin';
    }
    
    res.status(200).json({
      email: userEmail,
      role: role,
      authenticated: true
    });
  } catch (error) {
    console.error('Error checking user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
