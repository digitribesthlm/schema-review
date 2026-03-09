/**
 * /api/agent/ingest
 *
 * Token-secured endpoint for authorised agents (e.g. Manus) to:
 *   - Insert or update a schema (schema_body) on a page document
 *   - Add one or more content flags to a page document
 *   - Do both in a single request
 *
 * Authentication: Bearer token via Authorization header.
 *   Authorization: Bearer <AGENT_API_TOKEN>
 *   The token must match the AGENT_API_TOKEN environment variable.
 *
 * Request body (JSON):
 * {
 *   "page_id": "<MongoDB ObjectId string>",          // required
 *   "schema_body": { ... } | "<json string>",        // optional – inserts/replaces schema
 *   "status": "draft" | "pending" | ...,             // optional – override page status
 *   "content_flags": [                               // optional – appends flags
 *     {
 *       "field": "description",                      // required – which schema field/section
 *       "issue": "The component list uses old ...",  // required – what is wrong
 *       "source": "Live page section: What is ..."   // optional – evidence from live page
 *     }
 *   ]
 * }
 *
 * Responses:
 *   200 { message, schema_updated, flags_added }
 *   400 Missing or invalid fields
 *   401 Missing or invalid token
 *   404 Page not found
 *   405 Method not allowed
 *   500 Internal server error
 */

import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // ── Token authentication ──────────────────────────────────────────────────
  const agentToken = process.env.AGENT_API_TOKEN;
  if (!agentToken) {
    console.error('[agent/ingest] AGENT_API_TOKEN environment variable is not set');
    return res.status(500).json({ message: 'Server misconfiguration: AGENT_API_TOKEN not set' });
  }

  const authHeader = req.headers['authorization'] || '';
  const providedToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!providedToken || providedToken !== agentToken) {
    return res.status(401).json({ message: 'Unauthorized: invalid or missing token' });
  }

  // ── Validate body ─────────────────────────────────────────────────────────
  const { page_id, schema_body, content_flags, status } = req.body;

  if (!page_id) {
    return res.status(400).json({ message: 'Missing required field: page_id' });
  }

  if (!schema_body && (!content_flags || content_flags.length === 0) && !status) {
    return res.status(400).json({ message: 'Nothing to do: provide schema_body, content_flags, and/or status' });
  }

  // Validate content_flags structure if provided
  if (content_flags) {
    for (const flag of content_flags) {
      if (!flag.field || !flag.issue) {
        return res.status(400).json({
          message: 'Each content flag must have "field" and "issue" properties'
        });
      }
    }
  }

  // ── Database operation ────────────────────────────────────────────────────
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection(process.env.DATA_COLLECTION || 'schema_workflow');

    let objectId;
    try {
      objectId = new ObjectId(page_id);
    } catch {
      return res.status(400).json({ message: 'Invalid page_id format' });
    }

    // Check page exists
    const page = await collection.findOne({ _id: objectId });
    if (!page) {
      return res.status(404).json({ message: `Page not found: ${page_id}` });
    }

    const updateOps = { $set: { updated_at: new Date() } };
    let schemaUpdated = false;
    let flagsAdded = 0;

    // ── Schema update ─────────────────────────────────────────────────────
    if (schema_body) {
      // Validate JSON if provided as string
      if (typeof schema_body === 'string') {
        try {
          JSON.parse(schema_body);
        } catch {
          return res.status(400).json({ message: 'schema_body is not valid JSON' });
        }
      }
      updateOps.$set.schema_body = schema_body;
      updateOps.$set.status = status || 'draft';
      updateOps.$set.schema_created_at = new Date();
      schemaUpdated = true;
    }

    // ── Status override (without schema update) ─────────────────────────
    if (status && !schema_body) {
      updateOps.$set.status = status;
    }

    // ── Content flags ─────────────────────────────────────────────────────
    if (content_flags && content_flags.length > 0) {
      const newFlags = content_flags.map(f => ({
        id: new ObjectId().toString(),
        field: f.field,
        issue: f.issue,
        source: f.source || '',
        status: 'open',
        created_at: new Date(),
        resolved_at: null,
        resolved_by: null
      }));

      updateOps.$push = { contentFlags: { $each: newFlags } };
      flagsAdded = newFlags.length;
    }

    await collection.updateOne({ _id: objectId }, updateOps);

    return res.status(200).json({
      message: 'Ingest successful',
      page_id,
      schema_updated: schemaUpdated,
      flags_added: flagsAdded
    });

  } catch (error) {
    console.error('[agent/ingest] Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb'
    }
  }
};
