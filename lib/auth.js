import { connectToDatabase } from './mongodb'

export async function authenticateUser(email, password) {
  try {
    // Validate MONGODB_DB first — must be set before we even attempt a collection lookup
    const dbName = process.env.MONGODB_DB
    if (!dbName) {
      throw new Error('MONGODB_DB environment variable is not set')
    }
    console.log('[auth] Using database:', dbName)

    // Validate LOGGIN_COLLECTION second
    const collectionName = process.env.LOGGIN_COLLECTION
    if (!collectionName) {
      throw new Error('LOGGIN_COLLECTION environment variable is not set')
    }
    console.log('[auth] Using collection:', collectionName)

    const { db } = await connectToDatabase()

    const client = await db.collection(collectionName).findOne({
      email: email
    }) || await db.collection(collectionName).findOne({ contact_email: email });

    if (!client) {
      console.log('[auth] No user found for email:', email)
      return { success: false, message: 'Invalid credentials' }
    }

    // Simple plain text password comparison
    if (client.password !== password) {
      console.log('[auth] Password mismatch for email:', email)
      return { success: false, message: 'Invalid credentials' }
    }

    return {
      success: true,
      user: {
        id: (client._id || '').toString(),
        email: client.email || client.contact_email || '',
        name: client.name || client.contact_name || 'User',
        clientId: (client.clientId || client._id || '').toString(),
        clientName: client.clientName || client.client_name || 'Client',
        domain: client.domain || ''
      }
    }
  } catch (error) {
    console.error('[auth] Authentication error:', error.message)
    return { success: false, message: 'Authentication failed' }
  }
}
