const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

const sampleData = [
  {
    page_id: "page3509",
    url: "https://www.climberbi.co.uk/data-literacy-and-training/",
    main_topic: "Data Literacy and Business Intelligence Training Services by Climber BI",
    keywords: [
      {"term": "Data Literacy", "importance": 1.0},
      {"term": "Business Intelligence Training", "importance": 0.95},
      {"term": "Climber Academy", "importance": 0.9},
      {"term": "Power BI Training", "importance": 0.85},
      {"term": "Qlik Sense Training", "importance": 0.85},
      {"term": "User Training", "importance": 0.8},
      {"term": "BI Solution", "importance": 0.75},
      {"term": "Employee Empowerment", "importance": 0.7},
      {"term": "Online Training", "importance": 0.65},
      {"term": "User Adoption", "importance": 0.6}
    ],
    entities: [
      {"name": "Climber BI", "type": "organization", "importance": 1.0},
      {"name": "Business Intelligence Training", "type": "concept", "importance": 0.95},
      {"name": "Data Literacy", "type": "concept", "importance": 0.95},
      {"name": "Microsoft Power BI", "type": "product", "importance": 0.85},
      {"name": "Qlik Sense", "type": "product", "importance": 0.85},
      {"name": "Climber Academy", "type": "product", "importance": 0.8},
      {"name": "Qlik", "type": "organization", "importance": 0.75},
      {"name": "BI Solution", "type": "concept", "importance": 0.7},
      {"name": "Microsoft", "type": "organization", "importance": 0.7},
      {"name": "User Adoption", "type": "concept", "importance": 0.65},
      {"name": "Alex Booth", "type": "person", "importance": 0.6},
      {"name": "James Sharp", "type": "person", "importance": 0.6},
      {"name": "United Kingdom", "type": "place", "importance": 0.5},
      {"name": "Benelux", "type": "place", "importance": 0.4},
      {"name": "Denmark", "type": "place", "importance": 0.4},
      {"name": "Finland", "type": "place", "importance": 0.4},
      {"name": "Qlik Cloud", "type": "product", "importance": 0.4},
      {"name": "Sweden", "type": "place", "importance": 0.4},
      {"name": "Data Integration", "type": "concept", "importance": 0.3},
      {"name": "Microsoft Power Platform", "type": "product", "importance": 0.3}
    ],
    status: "next",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    page_id: "page3510",
    url: "https://www.climberbi.co.uk/services/",
    main_topic: "Comprehensive Business Intelligence Services by Climber BI",
    keywords: [
      {"term": "Business Intelligence Services", "importance": 1.0},
      {"term": "BI Consulting", "importance": 0.95},
      {"term": "Data Analytics", "importance": 0.9},
      {"term": "Qlik Services", "importance": 0.85},
      {"term": "Power BI Services", "importance": 0.8},
      {"term": "Data Integration", "importance": 0.75},
      {"term": "Cloud Services", "importance": 0.7},
      {"term": "Managed Services", "importance": 0.65},
      {"term": "BI Implementation", "importance": 0.6},
      {"term": "Data Strategy", "importance": 0.55}
    ],
    entities: [
      {"name": "Climber BI", "type": "organization", "importance": 1.0},
      {"name": "Business Intelligence", "type": "concept", "importance": 0.95},
      {"name": "Qlik Sense", "type": "product", "importance": 0.9},
      {"name": "Microsoft Power BI", "type": "product", "importance": 0.85},
      {"name": "Data Analytics", "type": "concept", "importance": 0.8},
      {"name": "James Sharp", "type": "person", "importance": 0.7},
      {"name": "Alex Booth", "type": "person", "importance": 0.7},
      {"name": "Cloud Services", "type": "concept", "importance": 0.65},
      {"name": "Europe", "type": "place", "importance": 0.6},
      {"name": "United Kingdom", "type": "place", "importance": 0.55}
    ],
    status: "next",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    page_id: "page3511",
    url: "https://www.climberbi.co.uk/timextender/",
    main_topic: "TimeXtender Data Estate Builder Implementation by Climber BI",
    keywords: [
      {"term": "TimeXtender", "importance": 1.0},
      {"term": "Data Estate Builder", "importance": 0.95},
      {"term": "Low-Code Solution", "importance": 0.9},
      {"term": "Data Integration", "importance": 0.85},
      {"term": "Drag-and-Drop", "importance": 0.8},
      {"term": "Data Warehouse", "importance": 0.75},
      {"term": "T-SQL Generation", "importance": 0.7},
      {"term": "BI Integration", "importance": 0.65},
      {"term": "Data Lake", "importance": 0.6},
      {"term": "Free Trial", "importance": 0.55}
    ],
    entities: [
      {"name": "TimeXtender", "type": "product", "importance": 1.0},
      {"name": "Climber BI", "type": "organization", "importance": 0.95},
      {"name": "Data Estate Builder", "type": "concept", "importance": 0.9},
      {"name": "Microsoft Power BI", "type": "product", "importance": 0.8},
      {"name": "Qlik Sense", "type": "product", "importance": 0.8},
      {"name": "UCC Coffee", "type": "organization", "importance": 0.7},
      {"name": "Tom Cotterill", "type": "person", "importance": 0.65},
      {"name": "James Sharp", "type": "person", "importance": 0.6},
      {"name": "Data Warehouse", "type": "concept", "importance": 0.55},
      {"name": "T-SQL", "type": "concept", "importance": 0.5}
    ],
    status: "next",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    page_id: "page3512",
    url: "https://www.climberbi.co.uk/contact-us/",
    main_topic: "Contact Information and Team Directory for Climber BI",
    keywords: [
      {"term": "Contact Information", "importance": 1.0},
      {"term": "Team Directory", "importance": 0.95},
      {"term": "Business Intelligence Consultants", "importance": 0.9},
      {"term": "Expert Services", "importance": 0.85},
      {"term": "Managing Director", "importance": 0.8},
      {"term": "Senior Consultants", "importance": 0.75},
      {"term": "Power Platform", "importance": 0.7},
      {"term": "Data Engineers", "importance": 0.65},
      {"term": "Training Manager", "importance": 0.6},
      {"term": "Marketing Team", "importance": 0.55}
    ],
    entities: [
      {"name": "Climber BI", "type": "organization", "importance": 1.0},
      {"name": "James Sharp", "type": "person", "importance": 0.95},
      {"name": "Alex Booth", "type": "person", "importance": 0.9},
      {"name": "Johan Levander", "type": "person", "importance": 0.85},
      {"name": "Tom Cotterill", "type": "person", "importance": 0.8},
      {"name": "Gareth Wilson", "type": "person", "importance": 0.75},
      {"name": "Yogini Pandya", "type": "person", "importance": 0.7},
      {"name": "Scott Davies", "type": "person", "importance": 0.65},
      {"name": "United Kingdom", "type": "place", "importance": 0.6},
      {"name": "Sweden", "type": "place", "importance": 0.55}
    ],
    status: "next",
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function insertSampleData() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('agency');
    const collection = db.collection('schema_workflow');
    
    // Clear existing data (optional)
    await collection.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert sample data
    const result = await collection.insertMany(sampleData);
    console.log(`Inserted ${result.insertedCount} documents`);
    
    console.log('Sample data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    await client.close();
  }
}

// Run the script
insertSampleData();
