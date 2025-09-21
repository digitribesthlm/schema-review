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

    const { schema_id, corrections, reviewer_notes } = req.body

    const { db } = await connectToDatabase()

    // Update schema with corrections
    const updateResult = await db.collection('schema_definitions').updateOne(
      { _id: schema_id },
      {
        $set: {
          schema_data: corrections.schema_data,
          editable_fields: corrections.editable_fields,
          ai_corrections: corrections,
          ai_reviewer_notes: reviewer_notes,
          ai_status: 'corrected',
          ai_corrected_at: new Date(),
          ai_corrected_by: decoded.userId,
          version: { $inc: 1 }
        }
      }
    )

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Schema not found' })
    }

    // Log the correction for audit trail
    await db.collection('ai_review_log').insertOne({
      schema_id,
      action: 'corrected',
      reviewer_id: decoded.userId,
      reviewer_name: decoded.name,
      corrections_applied: corrections,
      notes: reviewer_notes,
      timestamp: new Date()
    })

    res.status(200).json({ 
      message: 'Corrections applied successfully',
      schema_id 
    })

  } catch (error) {
    console.error('AI correction error:', error)
    res.status(500).json({ message: 'Failed to apply corrections' })
  }
}
