import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection(process.env.DATA_COLLECTION || 'schema_workflow');

    // GET: return all content flags for a page
    if (req.method === 'GET') {
      const { page_id } = req.query;
      if (!page_id) {
        return res.status(400).json({ message: 'Missing page_id' });
      }
      const page = await collection.findOne({ _id: new ObjectId(page_id) });
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      return res.status(200).json({ contentFlags: page.contentFlags || [] });
    }

    // POST: add a new content flag
    if (req.method === 'POST') {
      const { page_id, field, issue, source } = req.body;
      if (!page_id || !field || !issue) {
        return res.status(400).json({ message: 'Missing required fields: page_id, field, issue' });
      }

      const flag = {
        id: new ObjectId().toString(),
        field,
        issue,
        source: source || '',
        status: 'open',          // open | resolved
        created_at: new Date(),
        resolved_at: null,
        resolved_by: null
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(page_id) },
        { $push: { contentFlags: flag }, $set: { updated_at: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Page not found' });
      }

      return res.status(200).json({ message: 'Flag added', flag });
    }

    // PATCH: resolve or reopen a flag
    if (req.method === 'PATCH') {
      const { page_id, flag_id, status, resolved_by } = req.body;
      if (!page_id || !flag_id || !status) {
        return res.status(400).json({ message: 'Missing required fields: page_id, flag_id, status' });
      }

      const update = {
        'contentFlags.$.status': status,
        'contentFlags.$.resolved_at': status === 'resolved' ? new Date() : null,
        'contentFlags.$.resolved_by': status === 'resolved' ? (resolved_by || 'expert') : null,
        updated_at: new Date()
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(page_id), 'contentFlags.id': flag_id },
        { $set: update }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Page or flag not found' });
      }

      return res.status(200).json({ message: `Flag ${status}` });
    }

    // DELETE: remove a flag entirely
    if (req.method === 'DELETE') {
      const { page_id, flag_id } = req.body;
      if (!page_id || !flag_id) {
        return res.status(400).json({ message: 'Missing required fields: page_id, flag_id' });
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(page_id) },
        { $pull: { contentFlags: { id: flag_id } }, $set: { updated_at: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Page not found' });
      }

      return res.status(200).json({ message: 'Flag deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in content-flags API:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
