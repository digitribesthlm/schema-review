import jwt from 'jsonwebtoken'
import { connectToDatabase } from './mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function authenticateUser(email, password) {
  try {
    const { db } = await connectToDatabase()
    // Connectivity diagnostics
    try {
      await db.command({ ping: 1 })
      console.log('[auth] MongoDB ping successful. Database:', db.databaseName)
    } catch (pingError) {
      console.error('[auth] MongoDB ping failed:', pingError)
    }
    
    const collectionName = 'schema_clients'
    console.log('[auth] Using collection:', collectionName)
    console.log('[auth] Searching for email:', email)
    
    const client = await db.collection(collectionName).findOne({
      contact_email: email
    })
    
    console.log('[auth] Client found:', client ? 'YES' : 'NO')
    if (client) {
      console.log('[auth] Client ID:', client._id)
      console.log('[auth] Available fields:', Object.keys(client))
      console.log('[auth] Email field value:', client.email || client.contact_email || client.user_email)
      console.log('[auth] Client has password field:', !!client.password)
      console.log('[auth] Password type:', typeof client.password)
    }

    if (!client) {
      return { success: false, message: 'Invalid credentials' }
    }

    // Simple plain text password comparison (ensure string comparison)
    const storedPassword = String(client.password)
    const providedPassword = String(password)
    console.log('[auth] Password comparison:')
    console.log('[auth] - Stored password:', storedPassword)
    console.log('[auth] - Provided password:', providedPassword)
    console.log('[auth] - Passwords match:', storedPassword === providedPassword)
    
    if (storedPassword !== providedPassword) {
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

