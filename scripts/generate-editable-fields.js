#!/usr/bin/env node

/**
 * Database Migration Script: Generate Missing editable_fields
 * 
 * This script fixes the issue where schemas have perfect schema_data 
 * but missing editable_fields, causing Person entities to not display in the UI.
 */

const { MongoClient } = require('mongodb')

// Import the schema handlers
const { getSchemaHandler } = require('../components/schema-handlers/index.js')

async function generateEditableFields() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const dbName = process.env.MONGODB_DB || 'agency'
  
  console.log('🔄 Connecting to MongoDB...')
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection('schema_definitions')
    
    console.log('📊 Finding schemas without editable_fields...')
    
    // Find all schemas that don't have editable_fields or have empty editable_fields
    const schemasToUpdate = await collection.find({
      $or: [
        { editable_fields: { $exists: false } },
        { editable_fields: null },
        { editable_fields: {} }
      ]
    }).toArray()
    
    console.log(`📋 Found ${schemasToUpdate.length} schemas to update`)
    
    let updatedCount = 0
    let errorCount = 0
    
    for (const schema of schemasToUpdate) {
      try {
        console.log(`\n🔧 Processing schema: ${schema.url} (${schema.schema_type})`)
        
        // Get the appropriate handler for this schema type
        const handler = getSchemaHandler(schema.schema_type)
        
        // Generate editable fields from schema_data
        const editableFields = handler.getFields(schema.schema_data)
        
        console.log(`   📝 Generated ${Object.keys(editableFields).length} editable fields`)
        
        // Log Person fields if found
        const personFields = Object.keys(editableFields).filter(key => key.includes('person_'))
        if (personFields.length > 0) {
          console.log(`   👥 Person fields found: ${personFields.join(', ')}`)
        }
        
        // Update the schema with editable_fields
        await collection.updateOne(
          { _id: schema._id },
          { 
            $set: { 
              editable_fields: editableFields,
              updated_at: new Date()
            } 
          }
        )
        
        updatedCount++
        console.log(`   ✅ Updated successfully`)
        
      } catch (error) {
        console.error(`   ❌ Error processing schema ${schema._id}:`, error.message)
        errorCount++
      }
    }
    
    console.log(`\n🎉 Migration completed!`)
    console.log(`   ✅ Successfully updated: ${updatedCount} schemas`)
    console.log(`   ❌ Errors: ${errorCount} schemas`)
    
    if (updatedCount > 0) {
      console.log(`\n💡 The Person entities should now be visible in the UI!`)
      console.log(`   🔍 Check the Organization schemas for James Sharp, Alex Booth, and Johan Levander`)
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('🔌 Database connection closed')
  }
}

// Run the migration
if (require.main === module) {
  generateEditableFields()
    .then(() => {
      console.log('✨ Migration script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { generateEditableFields }
