import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user info from cookie (no more JWT)
    let userInfo = null;
    
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      
      if (cookies.user) {
        try {
          userInfo = JSON.parse(decodeURIComponent(cookies.user));
        } catch (error) {
          console.log('Cookie parsing failed:', error.message);
        }
      }
    }

    await client.connect();
    const db = client.db('agency');
    const collection = db.collection('schema_workflow');
    
    const { page_id, status, notes } = req.body;
    
    if (!page_id || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const updateData = {
      status: status,
      reviewed_by: userInfo?.email || 'unknown',
      reviewer_name: userInfo?.full_name || userInfo?.name || userInfo?.email || 'Unknown User',
      review_decision: status,
      review_notes: notes || '',
      reviewed_at: new Date(),
      updated_at: new Date()
    };

    // Add client_id filter for data isolation if available
    const filter = { _id: new ObjectId(page_id) };
    if (userInfo?.client_id) {
      filter.client_id = userInfo.client_id;
    }

    const result = await collection.updateOne(filter, { $set: updateData });
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Page not found or access denied' });
    }
    
    res.status(200).json({ 
      message: `Schema ${status} successfully`,
      result: result
    });
  } catch (error) {
    console.error('Error reviewing schema:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
