import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await client.connect();
    const db = client.db('agency');
    const collection = db.collection(process.env.DATA_COLLECTION || 'schema_workflow');
    
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

    // Update existing document only - no upsert to prevent creating new documents
    const result = await collection.updateOne(
      { _id: new ObjectId(page_id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
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

// Increase request body limit to handle large JSON-LD payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb'
    }
  }
}
