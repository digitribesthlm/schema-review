import { connectToDatabase } from '../../../lib/mongodb'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    const { db } = await connectToDatabase()
    const { status = 'pending_ai_review' } = req.query

    // Build aggregation pipeline to get schemas needing AI review
    const pipeline = [
      {
        $match: {
          ai_status: status
        }
      },
      {
        $lookup: {
          from: 'schema_pages',
          localField: 'page_id',
          foreignField: '_id',
          as: 'page_info'
        }
      },
      {
        $unwind: {
          path: '$page_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          client_id: 1,
          page_id: 1,
          url: 1,
          schema_type: 1,
          schema_priority: 1,
          schema_data: 1,
          editable_fields: 1,
          ai_status: 1,
          ai_reviewer_notes: 1,
          ai_corrections: 1,
          version: 1,
          status: 1,
          created_at: 1,
          updated_at: 1,
          page_title: '$page_info.page_title',
          page_type: '$page_info.page_type',
          primary_schema: '$page_info.primary_schema',
          secondary_schemas: '$page_info.secondary_schemas',
          content_summary: '$page_info.content_summary'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ]

    const schemas = await db.collection('schema_definitions').aggregate(pipeline).toArray()

    // Add AI analysis flags for each schema
    const enrichedSchemas = schemas.map(schema => ({
      ...schema,
      needs_analysis: !schema.ai_corrections,
      classification_mismatch: schema.schema_type !== schema.primary_schema,
      has_person_entities: schema.secondary_schemas?.includes('Person'),
      complexity_score: calculateComplexityScore(schema)
    }))

    res.status(200).json({
      schemas: enrichedSchemas,
      total: enrichedSchemas.length,
      status_counts: {
        pending_ai_review: await db.collection('schema_definitions').countDocuments({ ai_status: 'pending_ai_review' }),
        needs_correction: await db.collection('schema_definitions').countDocuments({ ai_status: 'needs_correction' }),
        ai_approved: await db.collection('schema_definitions').countDocuments({ ai_status: 'ai_approved' }),
        rejected: await db.collection('schema_definitions').countDocuments({ ai_status: 'rejected' })
      }
    })

  } catch (error) {
    console.error('AI reviewer schemas fetch error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

function calculateComplexityScore(schema) {
  let score = 0
  
  // Base complexity
  if (schema.schema_data?.['@graph']) {
    score += schema.schema_data['@graph'].length * 2
  } else {
    score += 1
  }
  
  // Person entities add complexity
  if (schema.secondary_schemas?.includes('Person')) {
    score += 3
  }
  
  // Classification mismatch adds complexity
  if (schema.schema_type !== schema.primary_schema) {
    score += 5
  }
  
  // Multiple secondary schemas
  if (schema.secondary_schemas?.length > 1) {
    score += schema.secondary_schemas.length
  }
  
  return Math.min(score, 10) // Cap at 10
}
