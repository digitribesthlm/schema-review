import { connectToDatabase } from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { schemaId, editedFields, feedback, action } = req.body

    if (!schemaId || !action) {
      return res.status(400).json({ 
        success: false, 
        message: 'Schema ID and action are required' 
      })
    }

    const { db } = await connectToDatabase()

    // Update schema with edited fields if provided
    if (editedFields && Object.keys(editedFields).length > 0) {
      const updateFields = {}
      
      // Update editable fields
      Object.entries(editedFields).forEach(([fieldName, value]) => {
        updateFields[`editable_fields.${fieldName}.value`] = value
      })

      // Update the schema data with new values
      const schema = await db.collection('schema_definitions').findOne({
        _id: new ObjectId(schemaId)
      })

      if (schema && schema.schema_data) {
        const updatedSchemaData = { ...schema.schema_data }
        
        // Update the actual JSON-LD data with edited values
        Object.entries(editedFields).forEach(([fieldName, value]) => {
          // Map field names to JSON-LD properties
          switch (fieldName) {
            case 'companyName':
              if (updatedSchemaData.name) updatedSchemaData.name = value
              break
            case 'description':
              if (updatedSchemaData.description) updatedSchemaData.description = value
              break
            case 'email':
              if (updatedSchemaData.contactPoint && updatedSchemaData.contactPoint.email) {
                updatedSchemaData.contactPoint.email = value
              }
              break
            case 'telephone':
              if (updatedSchemaData.contactPoint && updatedSchemaData.contactPoint.telephone) {
                updatedSchemaData.contactPoint.telephone = value
              }
              break
            case 'streetAddress':
              if (updatedSchemaData.address && updatedSchemaData.address.streetAddress) {
                updatedSchemaData.address.streetAddress = value
              }
              break
            case 'addressLocality':
              if (updatedSchemaData.address && updatedSchemaData.address.addressLocality) {
                updatedSchemaData.address.addressLocality = value
              }
              break
            case 'postalCode':
              if (updatedSchemaData.address && updatedSchemaData.address.postalCode) {
                updatedSchemaData.address.postalCode = value
              }
              break
            case 'serviceArea':
              if (updatedSchemaData.areaServed) {
                updatedSchemaData.areaServed = Array.isArray(value) ? value : [value]
              }
              break
            case 'keywords':
              if (updatedSchemaData.keywords) {
                updatedSchemaData.keywords = Array.isArray(value) ? value.join(', ') : value
              }
              break
            default:
              // For other fields, try to find and update them in the schema
              if (updatedSchemaData[fieldName] !== undefined) {
                updatedSchemaData[fieldName] = value
              }
          }
        })

        updateFields.schema_data = updatedSchemaData
      }

      updateFields.updated_at = new Date()
      updateFields.version = (schema?.version || 1) + 1

      await db.collection('schema_definitions').updateOne(
        { _id: new ObjectId(schemaId) },
        { $set: updateFields }
      )
    }

    // Update or create approval record
    const approvalData = {
      schema_id: new ObjectId(schemaId),
      approval_status: action,
      feedback: feedback || null,
      approved_at: new Date(),
      approved_by: 'system' // You can replace this with actual user ID
    }

    await db.collection('schema_approvals').updateOne(
      { schema_id: new ObjectId(schemaId) },
      { $set: approvalData },
      { upsert: true }
    )

    res.status(200).json({ 
      success: true, 
      message: `Schema ${action} successfully` 
    })

  } catch (error) {
    console.error('Error updating schema:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    })
  }
}

