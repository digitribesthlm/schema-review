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
    
    const { page_id, status } = req.body;
    
    if (!page_id || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updateData = {
      status: status,
      approved_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.updateOne(
      { page_id: page_id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.status(200).json({ 
      message: 'Schema approved successfully',
      result: result
    });
  } catch (error) {
    console.error('Error approving schema:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
