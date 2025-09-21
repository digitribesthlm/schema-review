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
    
    // Organization isolation: Users only see their organization's data
    let query = {};
    
    // Filter by client_id for organization separation
    // JWT token uses 'clientId' (camelCase), but database uses 'client_id' (snake_case)
    console.log('[schema-workflow] User info from JWT:', userInfo);
    if (userInfo?.clientId) {
      query.client_id = userInfo.clientId;
      console.log('[schema-workflow] Filtering by client_id:', userInfo.clientId);
    } else {
      console.log('[schema-workflow] No clientId in JWT token - no data isolation');
    }
    
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

    console.log('[schema-workflow] Final query:', JSON.stringify(query, null, 2));
    const pages = await collection.find(query).sort({ _id: -1 }).toArray();
    console.log('[schema-workflow] Found pages:', pages.length);
    
    res.status(200).json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
