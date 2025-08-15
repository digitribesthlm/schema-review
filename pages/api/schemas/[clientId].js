import { connectToDatabase } from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { clientId } = req.query

    const { db } = await connectToDatabase()

    // Start from schema_pages to get ALL pages, then left join with schemas and approvals
    const pipeline = [
      // Start with all pages for this client
      { $match: { client_id: new ObjectId(clientId) } },
      
      // Left join with schema_definitions to get schemas (if any)
      {
        $lookup: {
          from: 'schema_definitions',
          localField: '_id',
          foreignField: 'page_id',
          as: 'schemas'
        }
      },
      
      // For each schema, get its approval info
      {
        $addFields: {
          schemas: {
            $map: {
              input: '$schemas',
              as: 'schema',
              in: {
                $mergeObjects: [
                  '$$schema',
                  {
                    approval_info: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: { $ifNull: [[], []] }, // Will be populated in next stage
                            cond: { $eq: ['$$this.schema_id', '$$schema._id'] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      
      // Get approval information for all schemas
      {
        $lookup: {
          from: 'schema_approvals',
          let: { schema_ids: '$schemas._id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$schema_id', '$$schema_ids'] }
              }
            }
          ],
          as: 'all_approvals'
        }
      },
      
      // Merge approval info with schemas
      {
        $addFields: {
          schemas: {
            $map: {
              input: '$schemas',
              as: 'schema',
              in: {
                $mergeObjects: [
                  '$$schema',
                  {
                    approval_info: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$all_approvals',
                            cond: { $eq: ['$$this.schema_id', '$$schema._id'] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      
      // Format the final output
      {
        $project: {
          _id: '$url', // Use URL as the ID for grouping
          page_title: 1,
          page_type: 1,
          content_summary: 1,
          last_crawled: 1,
          url: 1,
          schemas: {
            $map: {
              input: '$schemas',
              as: 'schema',
              in: {
                schema_id: '$$schema._id',
                schema_type: '$$schema.schema_type',
                schema_priority: '$$schema.schema_priority',
                schema_data: '$$schema.schema_data',
                editable_fields: '$$schema.editable_fields',
                approval_status: { 
                  $ifNull: ['$$schema.approval_info.approval_status', 'pending'] 
                },
                approval_id: '$$schema.approval_info._id',
                feedback: '$$schema.approval_info.feedback',
                updated_at: '$$schema.updated_at',
                version: { $ifNull: ['$$schema.version', 1] }
              }
            }
          }
        }
      },
      
      // Sort by URL
      { $sort: { _id: 1 } }
    ]

    const pages = await db.collection('schema_pages').aggregate(pipeline).toArray()

    // Calculate statistics
    const totalSchemas = pages.reduce((acc, page) => acc + (page.schemas?.length || 0), 0)
    const pendingSchemas = pages.reduce((acc, page) => 
      acc + (page.schemas?.filter(s => s.approval_status === 'pending').length || 0), 0
    )
    const approvedSchemas = pages.reduce((acc, page) => 
      acc + (page.schemas?.filter(s => s.approval_status === 'approved').length || 0), 0
    )

    res.status(200).json({ 
      pages,
      stats: {
        total_pages: pages.length,
        total_schemas: totalSchemas,
        pending_schemas: pendingSchemas,
        approved_schemas: approvedSchemas
      }
    })
  } catch (error) {
    console.error('Error fetching schemas:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

