import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await client.connect();
    const db = client.db('agency');
    const collection = db.collection('schema_workflow');
    
    const { page_id, schema_body, status } = req.body;
    
    if (!page_id || !schema_body) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate JSON schema
    try {
      if (typeof schema_body === 'string') {
        JSON.parse(schema_body);
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid JSON schema' });
    }

    const updateData = {
      schema_body: schema_body,
      status: status || 'pending',
      updated_at: new Date(),
      schema_created_at: new Date()
    };

    const result = await collection.updateOne(
      { _id: page_id },
      { 
        $set: updateData,
        $setOnInsert: { created_at: new Date() }
      },
      { upsert: true }
    );
    
    res.status(200).json({ 
      message: 'Schema saved successfully',
      result: result
    });
  } catch (error) {
    console.error('Error saving schema:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
