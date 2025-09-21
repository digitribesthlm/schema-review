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
    
    const { page_id, comment } = req.body;
    
    if (!page_id || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const commentData = {
      text: comment,
      date: new Date(),
      user: req.user?.email || 'Anonymous' // Add user context if available
    };

    const result = await collection.updateOne(
      { page_id: page_id },
      { 
        $push: { comments: commentData },
        $set: { updated_at: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.status(200).json({ 
      message: 'Comment added successfully',
      result: result
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
