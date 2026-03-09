export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userEmail = req.headers['user-email'] || '';

    let role = 'client';

    // Admin users defined in environment variables
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];

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
