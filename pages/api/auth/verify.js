import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      })
    }

    const token = authHeader.substring(7)
    const result = verifyToken(token)
    
    if (result.success) {
      res.status(200).json(result)
    } else {
      res.status(401).json(result)
    }
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

