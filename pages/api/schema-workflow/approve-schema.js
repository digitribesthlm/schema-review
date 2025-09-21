import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user info from JWT token
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userInfo = null;
    
    if (token) {
      try {
        userInfo = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      } catch (error) {
        console.log('JWT verification failed:', error.message);
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
      reviewer_name: userInfo?.name || 'Unknown User',
      review_decision: status,
      review_notes: notes || '',
      reviewed_at: new Date(),
      updated_at: new Date()
    };

    // Add client_id filter for data isolation if available
    const filter = { _id: page_id };
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
