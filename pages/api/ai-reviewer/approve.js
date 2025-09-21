import { connectToDatabase } from '../../../lib/mongodb'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verify AI reviewer authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'ai_reviewer' && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'AI reviewer access required' })
    }

    const { schema_id, status = 'ai_approved', notes } = req.body

    const { db } = await connectToDatabase()

    // Update schema status
    const updateResult = await db.collection('schema_definitions').updateOne(
      { _id: schema_id },
      {
        $set: {
          ai_status: status,
          status: status === 'ai_approved' ? 'pending' : 'needs_revision',
          ai_approved_at: status === 'ai_approved' ? new Date() : null,
          ai_approved_by: status === 'ai_approved' ? decoded.userId : null,
          ai_reviewer_notes: notes || null,
          updated_at: new Date()
        }
      }
    )

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Schema not found' })
    }

    // Log the approval/rejection for audit trail
    await db.collection('ai_review_log').insertOne({
      schema_id,
      action: status,
      reviewer_id: decoded.userId,
      reviewer_name: decoded.name,
      notes: notes || null,
      timestamp: new Date()
    })

    // If approved, potentially notify customer or move to customer review queue
    if (status === 'ai_approved') {
      // Could add notification logic here
      console.log(`Schema ${schema_id} approved by AI reviewer ${decoded.name}`)
    }

    res.status(200).json({ 
      message: `Schema ${status === 'ai_approved' ? 'approved' : 'rejected'} successfully`,
      schema_id,
      new_status: status
    })

  } catch (error) {
    console.error('AI approval error:', error)
    res.status(500).json({ message: 'Failed to update schema status' })
  }
}
