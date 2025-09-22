import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Read user from cookie (HttpOnly session)
    let userInfo = null
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {})
      if (cookies.user) {
        try {
          userInfo = JSON.parse(decodeURIComponent(cookies.user))
        } catch {}
      }
    }

    if (!userInfo?.clientId) {
      return res.status(401).json({ message: 'Unauthorized: no user session' })
    }

    const { id } = req.query
    if (!id) {
      return res.status(400).json({ message: 'Missing id parameter' })
    }

    await client.connect()
    const db = client.db('agency')
    const collection = db.collection(process.env.DATA_COLLECTION || 'schema_workflow')

    const page = await collection.findOne({
      _id: new ObjectId(id),
      client_id: userInfo.clientId,
    })

    if (!page) {
      return res.status(404).json({ message: 'Page not found' })
    }

    res.status(200).json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    await client.close()
  }
}


