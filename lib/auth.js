import { connectToDatabase } from './mongodb'

export async function authenticateUser(email, password) {
  try {
    const { db } = await connectToDatabase()

    const collectionName = process.env.LOGGIN_COLLECTION
    if (!collectionName) {
      throw new Error('LOGGIN_COLLECTION environment variable is not set')
    }
    const client = await db.collection(collectionName).findOne({
      email: email
    }) || await db.collection(collectionName).findOne({ contact_email: email });

    if (!client) {
      return { success: false, message: 'Invalid credentials' }
    }

    // Simple plain text password comparison
    if (client.password !== password) {
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
    console.error('Authentication error:', error)
    return { success: false, message: 'Authentication failed' }
  }
}

