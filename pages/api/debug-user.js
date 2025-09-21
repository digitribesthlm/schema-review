import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get user info from JWT token
    const token = req.headers.authorization?.replace('Bearer ', '')
    let userInfo = null
    
    if (token) {
      try {
        userInfo = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production')
        console.log('DEBUG: User info from token:', userInfo)
      } catch (error) {
        console.log('DEBUG: JWT verification failed:', error.message)
      }
    } else {
      console.log('DEBUG: No token provided')
    }

    // Also check cookies
    const cookieToken = req.headers.cookie?.split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1]

    let cookieUserInfo = null
    if (cookieToken) {
      try {
        cookieUserInfo = jwt.verify(cookieToken, process.env.JWT_SECRET || 'your-secret-key-change-in-production')
        console.log('DEBUG: User info from cookie:', cookieUserInfo)
      } catch (error) {
        console.log('DEBUG: Cookie JWT verification failed:', error.message)
      }
    }

    res.status(200).json({
      hasAuthHeader: !!token,
      hasCookie: !!cookieToken,
      userFromHeader: userInfo,
      userFromCookie: cookieUserInfo,
      headers: req.headers,
      cookies: req.headers.cookie
    })
  } catch (error) {
    console.error('Debug error:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}
