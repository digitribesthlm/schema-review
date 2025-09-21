import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await client.connect()
    const db = client.db('agency')
    const collection = db.collection('schema_definitions')

    // Get all schema definitions with basic sorting
    const schemas = await collection
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000) // Limit to prevent overwhelming the UI
      .toArray()

    // Convert MongoDB ObjectIds to strings for JSON serialization
    const serializedSchemas = schemas.map(schema => ({
      ...schema,
      _id: schema._id.toString()
    }))

    res.status(200).json({
      success: true,
      schemas: serializedSchemas,
      count: serializedSchemas.length
    })

  } catch (error) {
    console.error('Data explorer API error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schema data',
      error: error.message
    })
  } finally {
    await client.close()
  }
}
