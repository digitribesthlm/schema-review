export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get user data from cookie instead of JWT
    const userCookie = req.headers.cookie
      ?.split(';')
      .find(c => c.trim().startsWith('user='))
      ?.split('=')[1]

    if (!userCookie) {
      return res.status(401).json({ 
        success: false, 
        message: 'No user session found' 
      })
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie))
      res.status(200).json({ 
        success: true, 
        user 
      })
    } catch (parseError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid user session' 
      })
    }
  } catch (error) {
    console.error('Session verification error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

