import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user info from JWT token for data isolation
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
    
    const { filter } = req.query;
    
    // Base query with role-based data access
    let query = {};
    
    // Data isolation: Admin sees all, Client sees only their organization's data
    if (userInfo?.role === 'client' && userInfo?.client_id) {
      query.client_id = userInfo.client_id;
    }
    // Admin users see all data (no client_id filter)
    
    // Add status filters
    switch (filter) {
      case 'no_schema':
        query.status = 'next';
        break;
      case 'pending':
        query.status = 'pending';
        break;
      case 'approved':
        query.status = 'approved';
        break;
      case 'rejected':
        query.status = 'rejected';
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
