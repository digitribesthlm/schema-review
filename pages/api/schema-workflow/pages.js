import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user info from JWT token for data isolation
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userInfo = null;
    
    if (token) {
      try {
        userInfo = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      } catch (error) {
        console.log('JWT verification failed:', error.message);
      }
    }

    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection(process.env.DATA_COLLECTION || 'schema_workflow');
    
    const { filter, lang } = req.query;

    // Organization isolation: Users only see their organization's data
    let query = {};

    // Filter by client_id for organization separation
    // JWT token uses 'clientId' (camelCase), but database uses 'client_id' (snake_case)
    console.log('[schema-workflow] User info from JWT:', userInfo);
    if (userInfo?.clientId) {
      query.client_id = userInfo.clientId;
      console.log('[schema-workflow] Filtering by client_id:', userInfo.clientId);
    } else {
      console.log('[schema-workflow] No clientId in JWT token - no data isolation');
    }

    // Add status filters
    switch (filter) {
      case 'no_schema':
        query.status = 'next';
        break;
      case 'pending':
        query.status = 'pending';
        break;
      case 'approved':
        query.status = 'approved';
        break;
      case 'rejected':
        query.status = 'rejected';
        break;
      default:
        // All pages for this client
        break;
    }

    console.log('[schema-workflow] Final query:', JSON.stringify(query, null, 2));
    const pages = await collection.find(query).sort({ _id: -1 }).toArray();
    console.log('[schema-workflow] Found pages:', pages.length);

    // Extract inLanguage from schema_body and compute page_language for each page
    const pagesWithLang = pages.map(page => {
      const doc = { ...page };
      doc.page_language = null;
      if (doc.schema_body) {
        try {
          const schema = typeof doc.schema_body === 'string' ? JSON.parse(doc.schema_body) : doc.schema_body;
          let inLanguage = schema.inLanguage;
          // Handle @graph structure — find WebPage or the first node with inLanguage
          if (!inLanguage && schema['@graph'] && Array.isArray(schema['@graph'])) {
            for (const node of schema['@graph']) {
              if (node.inLanguage) {
                inLanguage = node.inLanguage;
                break;
              }
            }
          }
          if (inLanguage) {
            doc.page_language = Array.isArray(inLanguage) ? inLanguage : [inLanguage];
          }
        } catch {
          // schema_body couldn't be parsed — leave page_language as null
        }
      }
      return doc;
    });

    // Apply language filter if provided (post-query, since it's computed)
    let result = pagesWithLang;
    if (lang && lang !== 'all') {
      result = pagesWithLang.filter(p =>
        p.page_language && p.page_language.includes(lang)
      );
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
