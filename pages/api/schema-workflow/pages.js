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
    
    const { filter, client_id } = req.query;
    
    // Base query with client_id filter
    let query = { 
      client_id: client_id || "673381e25e38ffb2f5d5216b" 
    };
    
    // Add additional filters
    switch (filter) {
      case 'no_schema':
        query.schema_body = { $exists: false };
        break;
      case 'pending':
        query.status = 'pending';
        break;
      case 'approved':
        query.status = 'approved';
        break;
      default:
        // All pages for this client
        break;
    }

    console.log('Query:', JSON.stringify(query));
    const pages = await collection.find(query).sort({ _id: -1 }).toArray();
    console.log('Found pages:', pages.length);
    
    res.status(200).json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
