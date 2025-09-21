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

    const { schema_id, url, schema_data, page_content } = req.body

    // Perform AI analysis of the schema
    const analysis = await analyzeSchemaQuality(schema_data, page_content, url)

    // Save analysis to database
    const { db } = await connectToDatabase()
    await db.collection('schema_definitions').updateOne(
      { _id: schema_id },
      {
        $set: {
          ai_analysis: analysis,
          ai_analysis_date: new Date(),
          ai_reviewer_id: decoded.userId
        }
      }
    )

    res.status(200).json(analysis)

  } catch (error) {
    console.error('AI analysis error:', error)
    res.status(500).json({ message: 'Analysis failed' })
  }
}

async function analyzeSchemaQuality(schemaData, pageContent, url) {
  const issues = []
  const recommendations = []
  const warnings = []
  let qualityScore = 100

  try {
    // 1. Schema Structure Analysis
    if (!schemaData['@context']) {
      issues.push('Missing @context property')
      qualityScore -= 10
    }

    if (!schemaData['@type'] && !schemaData['@graph']) {
      issues.push('Missing @type or @graph structure')
      qualityScore -= 20
    }

    // 2. Content Relevance Analysis
    const schemaText = JSON.stringify(schemaData).toLowerCase()
    const contentWords = pageContent.toLowerCase().split(/\s+/)
    
    // Check if schema content matches page content
    const schemaWords = schemaText.match(/\w+/g) || []
    const relevantWords = schemaWords.filter(word => 
      word.length > 3 && contentWords.includes(word)
    )
    
    const relevanceRatio = relevantWords.length / Math.max(schemaWords.length, 1)
    if (relevanceRatio < 0.3) {
      issues.push('Schema content may not be relevant to page content')
      qualityScore -= 15
    }

    // 3. Business Value Analysis
    const businessKeywords = [
      'service', 'product', 'solution', 'consulting', 'business intelligence',
      'infrastructure', 'cloud', 'managed', 'support', 'implementation'
    ]
    
    const hasBusinessContent = businessKeywords.some(keyword => 
      schemaText.includes(keyword)
    )
    
    if (!hasBusinessContent) {
      warnings.push('Schema may lack business-focused content')
      qualityScore -= 5
    }

    // 4. Person Entity Analysis
    if (schemaData['@graph']) {
      const personEntities = schemaData['@graph'].filter(entity => 
        entity['@type'] === 'Person'
      )
      
      if (personEntities.length > 0) {
        personEntities.forEach((person, index) => {
          if (!person.name) {
            issues.push(`Person entity ${index + 1} missing name`)
            qualityScore -= 5
          }
          if (!person.jobTitle) {
            warnings.push(`Person entity ${index + 1} missing job title`)
            qualityScore -= 2
          }
          if (!person.email && !person.telephone) {
            warnings.push(`Person entity ${index + 1} missing contact information`)
            qualityScore -= 3
          }
        })
      }
    }

    // 5. Schema Type Appropriateness
    const mainType = schemaData['@type'] || 
      (schemaData['@graph'] && schemaData['@graph'][0]?.['@type'])
    
    if (mainType === 'Organization' && url.includes('/services/')) {
      warnings.push('Organization schema on services page - consider Service schema')
      qualityScore -= 10
    }
    
    if (mainType === 'Service' && url.includes('/about')) {
      warnings.push('Service schema on about page - consider Organization schema')
      qualityScore -= 10
    }

    // 6. Required Properties Check
    if (mainType === 'Organization') {
      const org = schemaData['@graph'] ? 
        schemaData['@graph'].find(e => e['@type'] === 'Organization') : 
        schemaData
      
      if (!org?.name) {
        issues.push('Organization missing name property')
        qualityScore -= 10
      }
      if (!org?.description) {
        warnings.push('Organization missing description')
        qualityScore -= 5
      }
    }

    if (mainType === 'Service') {
      const service = schemaData['@graph'] ? 
        schemaData['@graph'].find(e => e['@type'] === 'Service') : 
        schemaData
      
      if (!service?.name) {
        issues.push('Service missing name property')
        qualityScore -= 10
      }
      if (!service?.description) {
        warnings.push('Service missing description')
        qualityScore -= 5
      }
      if (!service?.provider) {
        warnings.push('Service missing provider information')
        qualityScore -= 5
      }
    }

    // 7. Generate Recommendations
    if (issues.length > 0) {
      recommendations.push('Fix critical schema structure issues before approval')
    }
    
    if (warnings.length > 3) {
      recommendations.push('Consider enhancing schema with more business-relevant content')
    }
    
    if (qualityScore < 70) {
      recommendations.push('Schema needs significant improvements before customer review')
    } else if (qualityScore < 85) {
      recommendations.push('Schema is acceptable but could be enhanced')
    } else {
      recommendations.push('Schema quality is good - ready for customer review')
    }

    // 8. Specific Improvement Suggestions
    if (!schemaText.includes('business') && !schemaText.includes('service')) {
      recommendations.push('Consider adding more company-specific branding and terminology')
    }
    
    if (schemaData['@graph'] && schemaData['@graph'].length === 1) {
      recommendations.push('Consider adding related entities (Person, Service) for richer markup')
    }

    return {
      quality_score: Math.max(qualityScore, 0),
      issues,
      warnings,
      recommendations,
      analysis_summary: `Schema scored ${qualityScore}/100. ${issues.length} critical issues, ${warnings.length} warnings found.`,
      suggested_status: qualityScore >= 85 ? 'ai_approved' : 
                       qualityScore >= 70 ? 'needs_minor_correction' : 
                       'needs_major_correction',
      analyzed_at: new Date().toISOString()
    }

  } catch (error) {
    console.error('Schema analysis error:', error)
    return {
      quality_score: 0,
      issues: ['Analysis failed - manual review required'],
      warnings: [],
      recommendations: ['Perform manual schema review'],
      analysis_summary: 'Automated analysis failed',
      suggested_status: 'needs_manual_review',
      analyzed_at: new Date().toISOString()
    }
  }
}
