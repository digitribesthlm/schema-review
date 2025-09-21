import { connectToDatabase } from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { clientId, page = 1, limit = 10 } = req.query
    
    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))) // Max 50 per page
    const skip = (pageNum - 1) * limitNum

    const { db } = await connectToDatabase()

    // First get total count for pagination - handle both ObjectId and string client_ids
    const totalCountPipeline = [
      { 
        $match: { 
          $or: [
            { client_id: new ObjectId(clientId) },
            { client_id: clientId }
          ]
        } 
      },
      { $count: "total" }
    ]
    
    const totalResult = await db.collection('schema_definitions').aggregate(totalCountPipeline).toArray()
    const totalPages = totalResult[0]?.total || 0

    // Start from schema_definitions as the main collection
    const pipeline = [
      // Start with all schema definitions for this client - handle both ObjectId and string client_ids
      { 
        $match: { 
          $or: [
            { client_id: new ObjectId(clientId) },
            { client_id: clientId }
          ]
        } 
      },
      
      // Sort by URL first for consistent pagination
      { $sort: { url: 1 } },
      
      // Add pagination
      { $skip: skip },
      { $limit: limitNum },
      
      // Left join with schema_pages to get page analysis info (if any) - JOIN BY URL
      {
        $lookup: {
          from: 'schema_pages',
          localField: 'url',
          foreignField: 'url',
          as: 'page_analysis'
        }
      },
      
      // Get approval information for this schema
      {
        $lookup: {
          from: 'schema_approvals',
          localField: '_id',
          foreignField: 'schema_id',
          as: 'approval_info'
        }
      },
      
      // Format the final output
      {
        $project: {
          _id: '$url', // Use URL as the ID for grouping
          page_title: { $ifNull: [{ $arrayElemAt: ['$page_analysis.page_title', 0] }, '$url'] },
          page_type: { $ifNull: [{ $arrayElemAt: ['$page_analysis.page_type', 0] }, 'unknown'] },
          content_summary: { $arrayElemAt: ['$page_analysis.content_summary', 0] },
          last_crawled: { $arrayElemAt: ['$page_analysis.last_crawled', 0] },
          url: 1,
          schemas: [{
            schema_id: '$_id',
            schema_type: '$schema_type',
            schema_priority: '$schema_priority',
            schema_data: '$schema_data',
            editable_fields: '$editable_fields',
            approval_status: { 
              $ifNull: [{ $arrayElemAt: ['$approval_info.approval_status', 0] }, 'pending'] 
            },
            approval_id: { $arrayElemAt: ['$approval_info._id', 0] },
            feedback: { $arrayElemAt: ['$approval_info.feedback', 0] },
            updated_at: '$updated_at',
            version: { $ifNull: ['$version', 1] }
          }]
        }
      }
    ]

    const pages = await db.collection('schema_definitions').aggregate(pipeline).toArray()

    // Calculate statistics for current page
    const totalSchemas = pages.reduce((acc, page) => acc + (page.schemas?.length || 0), 0)
    const pendingSchemas = pages.reduce((acc, page) => 
      acc + (page.schemas?.filter(s => s.approval_status === 'pending').length || 0), 0
    )
    const approvedSchemas = pages.reduce((acc, page) => 
      acc + (page.schemas?.filter(s => s.approval_status === 'approved').length || 0), 0
    )

    // Calculate overall stats for the client (needed for dashboard summary)
    const overallStatsPipeline = [
      { 
        $match: { 
          $or: [
            { client_id: new ObjectId(clientId) },
            { client_id: clientId }
          ]
        } 
      },
      {
        $lookup: {
          from: 'schema_definitions',
          localField: 'url',
          foreignField: 'url',
          as: 'schemas'
        }
      },
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
      }
    ]
    
    const allPagesForStats = await db.collection('schema_pages').aggregate(overallStatsPipeline).toArray()
    
    const overallTotalSchemas = allPagesForStats.reduce((acc, page) => acc + (page.schemas?.length || 0), 0)
    const overallPendingSchemas = allPagesForStats.reduce((acc, page) => {
      return acc + (page.schemas?.filter(schema => {
        const approval = page.all_approvals?.find(a => a.schema_id.equals(schema._id))
        return !approval || approval.approval_status === 'pending'
      }).length || 0)
    }, 0)
    const overallApprovedSchemas = allPagesForStats.reduce((acc, page) => {
      return acc + (page.schemas?.filter(schema => {
        const approval = page.all_approvals?.find(a => a.schema_id.equals(schema._id))
        return approval && approval.approval_status === 'approved'
      }).length || 0)
    }, 0)

    res.status(200).json({ 
      pages,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalPages / limitNum),
        totalRecords: totalPages,
        recordsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalPages / limitNum),
        hasPrevPage: pageNum > 1
      },
      stats: {
        total_pages: totalPages, // Overall total
        total_schemas: overallTotalSchemas, // Overall total
        pending_schemas: overallPendingSchemas, // Overall total
        approved_schemas: overallApprovedSchemas // Overall total
      }
    })
  } catch (error) {
    console.error('Error fetching schemas:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

