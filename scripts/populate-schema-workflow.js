const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function populateSchemaWorkflow() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('agency');
    
    // Get data from schema_pages (topical analysis)
    const schemaPagesCollection = db.collection('schema_pages');
    const schemaDefinitionsCollection = db.collection('schema_definitions');
    const workflowCollection = db.collection(process.env.DATA_COLLECTION || 'schema_workflow');
    
    // Clear existing workflow data
    await workflowCollection.deleteMany({});
    console.log('Cleared existing workflow data');
    
    // Get all schema pages with topical data
    const schemaPages = await schemaPagesCollection.find({
      client_id: "673381e25e38ffb2f5d5216b"
    }).toArray();
    
    console.log(`Found ${schemaPages.length} schema pages`);
    
    // Process each page
    for (const page of schemaPages) {
      // Check if there's a corresponding schema definition
      const schemaDefinition = await schemaDefinitionsCollection.findOne({
        client_id: page.client_id,
        url: page.url
      });
      
      // Create workflow document
      const workflowDoc = {
        page_id: page.bq_page_id || `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client_id: page.client_id,
        url: page.url,
        page_title: page.page_title,
        main_topic: page.bq_main_topic || page.content_summary,
        keywords: page.bq_keywords || [],
        entities: page.bq_entities || [],
        status: schemaDefinition ? 'pending' : 'next',
        created_at: page.created_at || new Date(),
        updated_at: page.updated_at || new Date(),
        last_crawled: page.last_crawled
      };
      
      // Add schema if it exists
      if (schemaDefinition && schemaDefinition.schema_data) {
        workflowDoc.schema_body = schemaDefinition.schema_data;
        workflowDoc.schema_created_at = schemaDefinition.created_at;
        workflowDoc.editable_fields = schemaDefinition.editable_fields;
      }
      
      // Insert into workflow collection
      await workflowCollection.insertOne(workflowDoc);
      console.log(`Processed: ${page.url}`);
    }
    
    // Get final count
    const finalCount = await workflowCollection.countDocuments({
      client_id: "673381e25e38ffb2f5d5216b"
    });
    
    console.log(`\n✅ Successfully populated schema_workflow collection!`);
    console.log(`📊 Total pages: ${finalCount}`);
    
    // Show status breakdown
    const statusCounts = await workflowCollection.aggregate([
      { $match: { client_id: "673381e25e38ffb2f5d5216b" } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('\n📈 Status breakdown:');
    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count} pages`);
    });
    
    // Show pages with schemas
    const withSchemas = await workflowCollection.countDocuments({
      client_id: "673381e25e38ffb2f5d5216b",
      schema_body: { $exists: true }
    });
    
    console.log(`\n🎯 Pages with schemas: ${withSchemas}`);
    console.log(`🔧 Pages needing schemas: ${finalCount - withSchemas}`);
    
  } catch (error) {
    console.error('Error populating schema workflow:', error);
  } finally {
    await client.close();
  }
}

// Run the script
populateSchemaWorkflow();
