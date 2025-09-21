import { authenticateUser } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      })
    }

    const result = await authenticateUser(email, password)
    
    if (result.success) {
      // Set user data in session/cookie instead of JWT
      res.setHeader('Set-Cookie', `user=${JSON.stringify(result.user)}; Path=/; HttpOnly`)
      res.status(200).json(result)
    } else {
      res.status(401).json(result)
    }
  } catch (error) {
    console.error('Login API error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

