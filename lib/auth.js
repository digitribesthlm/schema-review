import jwt from 'jsonwebtoken'
import { connectToDatabase } from './mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function authenticateUser(email, password) {
  try {
    const { db } = await connectToDatabase()
    
    const client = await db.collection('schema_clients').findOne({
      contact_email: email
    })

    if (!client) {
      return { success: false, message: 'Invalid credentials' }
    }

    // Simple plain text password comparison
    if (client.password !== password) {
      return { success: false, message: 'Invalid credentials' }
    }

    const token = jwt.sign(
      {
        userId: client._id.toString(),
        email: client.contact_email,
        name: client.contact_name,
        clientId: client._id.toString(),
        clientName: client.client_name,
        domain: client.domain
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      success: true,
      token,
      user: {
        id: client._id.toString(),
        email: client.contact_email,
        name: client.contact_name,
        clientId: client._id.toString(),
        clientName: client.client_name,
        domain: client.domain
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, message: 'Authentication failed' }
  }
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return { success: true, user: decoded }
  } catch (error) {
    return { success: false, message: 'Invalid token' }
  }
}

