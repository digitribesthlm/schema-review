import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await client.connect();
    const db = client.db('agency');
    const collection = db.collection('schema_workflow');
    
    const { filter } = req.query;
    
    let query = {};
    
    switch (filter) {
      case 'no_schema':
        query = { schema_body: { $exists: false } };
        break;
      case 'pending':
        query = { status: 'pending' };
        break;
      case 'approved':
        query = { status: 'approved' };
        break;
      default:
        // All pages
        break;
    }

    const pages = await collection.find(query).sort({ _id: -1 }).toArray();
    
    res.status(200).json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
