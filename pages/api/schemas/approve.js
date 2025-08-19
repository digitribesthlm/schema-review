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
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].description !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].description = value
                }
              } else if (updatedSchemaData.description) {
                updatedSchemaData.description = value
              }
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
            // Service schema specific fields
            case 'providerName':
              if (updatedSchemaData.provider && updatedSchemaData.provider.name !== undefined) {
                updatedSchemaData.provider.name = value
              }
              break
            case 'providerUrl':
              if (updatedSchemaData.provider && updatedSchemaData.provider.url !== undefined) {
                updatedSchemaData.provider.url = value
              }
              break
            case 'providerLogo':
              if (updatedSchemaData.provider && updatedSchemaData.provider.logo !== undefined) {
                updatedSchemaData.provider.logo = value
              }
              break
            case 'offersDescription':
              if (updatedSchemaData.offers && updatedSchemaData.offers.description !== undefined) {
                updatedSchemaData.offers.description = value
              }
              break
            case 'areaServed':
              if (updatedSchemaData.areaServed !== undefined) {
                updatedSchemaData.areaServed = Array.isArray(value) ? value : value.split(', ').filter(Boolean)
              }
              break
            case 'serviceType':
              if (updatedSchemaData.serviceType !== undefined) {
                updatedSchemaData.serviceType = Array.isArray(value) ? value : value.split(', ').filter(Boolean)
              }
              break
            case 'image':
              if (updatedSchemaData.image !== undefined) {
                updatedSchemaData.image = value
              }
              break
            case 'url':
              if (updatedSchemaData.url !== undefined) {
                updatedSchemaData.url = value
              }
              break
            // Organization schema specific fields - Address
            case 'streetAddress':
              if (updatedSchemaData.address && updatedSchemaData.address.streetAddress !== undefined) {
                updatedSchemaData.address.streetAddress = value
              }
              break
            case 'addressLocality':
              if (updatedSchemaData.address && updatedSchemaData.address.addressLocality !== undefined) {
                updatedSchemaData.address.addressLocality = value
              }
              break
            case 'addressRegion':
              if (updatedSchemaData.address && updatedSchemaData.address.addressRegion !== undefined) {
                updatedSchemaData.address.addressRegion = value
              }
              break
            case 'postalCode':
              if (updatedSchemaData.address && updatedSchemaData.address.postalCode !== undefined) {
                updatedSchemaData.address.postalCode = value
              }
              break
            case 'addressCountry':
              if (updatedSchemaData.address && updatedSchemaData.address.addressCountry !== undefined) {
                updatedSchemaData.address.addressCountry = value
              }
              break
            // Organization schema specific fields - Contact (single contact point)
            case 'telephone':
              if (updatedSchemaData.contactPoint && !Array.isArray(updatedSchemaData.contactPoint)) {
                updatedSchemaData.contactPoint.telephone = value
              }
              break
            case 'email':
              if (updatedSchemaData.contactPoint && !Array.isArray(updatedSchemaData.contactPoint)) {
                updatedSchemaData.contactPoint.email = value
              }
              break
            case 'contactType':
              if (updatedSchemaData.contactPoint && !Array.isArray(updatedSchemaData.contactPoint)) {
                updatedSchemaData.contactPoint.contactType = value
              }
              break
            // Organization additional fields
            case 'logo':
              if (updatedSchemaData.logo !== undefined) {
                updatedSchemaData.logo = value
              }
              break
            case 'foundingDate':
              if (updatedSchemaData.foundingDate !== undefined) {
                updatedSchemaData.foundingDate = value
              }
              break
            case 'numberOfEmployees':
              if (updatedSchemaData.numberOfEmployees !== undefined) {
                updatedSchemaData.numberOfEmployees = parseInt(value) || value
              }
              break
            case 'sameAs':
              if (updatedSchemaData.sameAs !== undefined) {
                updatedSchemaData.sameAs = Array.isArray(value) ? value : value.split(',').map(url => url.trim()).filter(Boolean)
              }
              break
            // Product schema specific fields
            case 'brandName':
              if (updatedSchemaData.brand && updatedSchemaData.brand.name !== undefined) {
                updatedSchemaData.brand.name = value
              }
              break
            case 'brand':
              if (updatedSchemaData.brand !== undefined) {
                if (typeof updatedSchemaData.brand === 'string') {
                  updatedSchemaData.brand = value
                } else {
                  updatedSchemaData.brand.name = value
                }
              }
              break
            case 'category':
              if (updatedSchemaData.category !== undefined) {
                updatedSchemaData.category = value
              }
              break
            case 'sku':
              if (updatedSchemaData.sku !== undefined) {
                updatedSchemaData.sku = value
              }
              break
            case 'mpn':
              if (updatedSchemaData.mpn !== undefined) {
                updatedSchemaData.mpn = value
              }
              break
            case 'gtin':
              if (updatedSchemaData.gtin !== undefined) {
                updatedSchemaData.gtin = value
              } else if (updatedSchemaData.gtin13 !== undefined) {
                updatedSchemaData.gtin13 = value
              } else if (updatedSchemaData.gtin12 !== undefined) {
                updatedSchemaData.gtin12 = value
              } else if (updatedSchemaData.gtin8 !== undefined) {
                updatedSchemaData.gtin8 = value
              }
              break
            case 'price':
              if (updatedSchemaData.offers && updatedSchemaData.offers.price !== undefined) {
                updatedSchemaData.offers.price = value
              }
              break
            case 'priceCurrency':
              if (updatedSchemaData.offers && updatedSchemaData.offers.priceCurrency !== undefined) {
                updatedSchemaData.offers.priceCurrency = value
              }
              break
            case 'availability':
              if (updatedSchemaData.offers && updatedSchemaData.offers.availability !== undefined) {
                updatedSchemaData.offers.availability = value.includes('schema.org') ? value : `https://schema.org/${value}`
              }
              break
            case 'offerUrl':
              if (updatedSchemaData.offers && updatedSchemaData.offers.url !== undefined) {
                updatedSchemaData.offers.url = value
              }
              break
            case 'color':
              if (updatedSchemaData.color !== undefined) {
                updatedSchemaData.color = value.includes(',') ? value.split(',').map(c => c.trim()).filter(Boolean) : value
              }
              break
            case 'size':
              if (updatedSchemaData.size !== undefined) {
                updatedSchemaData.size = value
              }
              break
            case 'weight':
              if (updatedSchemaData.weight !== undefined) {
                updatedSchemaData.weight = value
              }
              break
            case 'manufacturerName':
              if (updatedSchemaData.manufacturer && updatedSchemaData.manufacturer.name !== undefined) {
                updatedSchemaData.manufacturer.name = value
              }
              break
            case 'manufacturer':
              if (updatedSchemaData.manufacturer !== undefined) {
                if (typeof updatedSchemaData.manufacturer === 'string') {
                  updatedSchemaData.manufacturer = value
                } else {
                  updatedSchemaData.manufacturer.name = value
                }
              }
              break
            case 'model':
              if (updatedSchemaData.model !== undefined) {
                updatedSchemaData.model = value
              }
              break
            case 'ratingValue':
              if (updatedSchemaData.aggregateRating && updatedSchemaData.aggregateRating.ratingValue !== undefined) {
                updatedSchemaData.aggregateRating.ratingValue = parseFloat(value) || value
              }
              break
            case 'bestRating':
              if (updatedSchemaData.aggregateRating && updatedSchemaData.aggregateRating.bestRating !== undefined) {
                updatedSchemaData.aggregateRating.bestRating = parseFloat(value) || value
              }
              break
            case 'reviewCount':
              if (updatedSchemaData.aggregateRating) {
                if (updatedSchemaData.aggregateRating.reviewCount !== undefined) {
                  updatedSchemaData.aggregateRating.reviewCount = parseInt(value) || value
                } else if (updatedSchemaData.aggregateRating.ratingCount !== undefined) {
                  updatedSchemaData.aggregateRating.ratingCount = parseInt(value) || value
                }
              }
              break
            // Article schema specific fields
            case 'headline':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].headline !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].headline = value
                }
              } else if (updatedSchemaData.headline !== undefined) {
                updatedSchemaData.headline = value
              }
              break
            case 'datePublished':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].datePublished !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].datePublished = value
                }
              } else if (updatedSchemaData.datePublished !== undefined) {
                updatedSchemaData.datePublished = value
              }
              break
            case 'mainEntityOfPage':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].mainEntityOfPage !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].mainEntityOfPage = value
                }
              } else if (updatedSchemaData.mainEntityOfPage !== undefined) {
                updatedSchemaData.mainEntityOfPage = value
              }
              break
            case 'keywords':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].keywords !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].keywords = value
                }
              } else if (updatedSchemaData.keywords !== undefined) {
                updatedSchemaData.keywords = value
              }
              break
            // Article author fields
            case 'authorName':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].author?.name !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].author.name = value
                }
              } else if (updatedSchemaData.author?.name !== undefined) {
                updatedSchemaData.author.name = value
              }
              break
            case 'authorJobTitle':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].author?.jobTitle !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].author.jobTitle = value
                }
              } else if (updatedSchemaData.author?.jobTitle !== undefined) {
                updatedSchemaData.author.jobTitle = value
              }
              break
            case 'authorSameAs':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].author?.sameAs !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].author.sameAs = value
                }
              } else if (updatedSchemaData.author?.sameAs !== undefined) {
                updatedSchemaData.author.sameAs = value
              }
              break
            case 'authorImage':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].author?.image !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].author.image = value
                }
              } else if (updatedSchemaData.author?.image !== undefined) {
                updatedSchemaData.author.image = value
              }
              break
            // Article publisher fields
            case 'publisherName':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].publisher?.name !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].publisher.name = value
                }
              } else if (updatedSchemaData.publisher?.name !== undefined) {
                updatedSchemaData.publisher.name = value
              }
              break
            case 'publisherLogoUrl':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].publisher?.logo?.url !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].publisher.logo.url = value
                }
              } else if (updatedSchemaData.publisher?.logo?.url !== undefined) {
                updatedSchemaData.publisher.logo.url = value
              }
              break
            case 'publisherTelephone':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].publisher?.contactPoint?.telephone !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].publisher.contactPoint.telephone = value
                }
              } else if (updatedSchemaData.publisher?.contactPoint?.telephone !== undefined) {
                updatedSchemaData.publisher.contactPoint.telephone = value
              }
              break
            case 'publisherContactType':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].publisher?.contactPoint?.contactType !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].publisher.contactPoint.contactType = value
                }
              } else if (updatedSchemaData.publisher?.contactPoint?.contactType !== undefined) {
                updatedSchemaData.publisher.contactPoint.contactType = value
              }
              break
            case 'publisherAreaServed':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].publisher?.contactPoint?.areaServed !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].publisher.contactPoint.areaServed = value
                }
              } else if (updatedSchemaData.publisher?.contactPoint?.areaServed !== undefined) {
                updatedSchemaData.publisher.contactPoint.areaServed = value
              }
              break
            case 'publisherStreetAddress':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].publisher?.address?.streetAddress !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].publisher.address.streetAddress = value
                }
              } else if (updatedSchemaData.publisher?.address?.streetAddress !== undefined) {
                updatedSchemaData.publisher.address.streetAddress = value
              }
              break
            case 'publisherAddressLocality':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].publisher?.address?.addressLocality !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].publisher.address.addressLocality = value
                }
              } else if (updatedSchemaData.publisher?.address?.addressLocality !== undefined) {
                updatedSchemaData.publisher.address.addressLocality = value
              }
              break
            case 'publisherAddressRegion':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].publisher?.address?.addressRegion !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].publisher.address.addressRegion = value
                }
              } else if (updatedSchemaData.publisher?.address?.addressRegion !== undefined) {
                updatedSchemaData.publisher.address.addressRegion = value
              }
              break
            case 'publisherPostalCode':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].publisher?.address?.postalCode !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].publisher.address.postalCode = value
                }
              } else if (updatedSchemaData.publisher?.address?.postalCode !== undefined) {
                updatedSchemaData.publisher.address.postalCode = value
              }
              break
            case 'publisherAddressCountry':
              if (updatedSchemaData['@graph'] && Array.isArray(updatedSchemaData['@graph'])) {
                const articleIndex = updatedSchemaData['@graph'].findIndex(item => item['@type'] === 'Article')
                if (articleIndex !== -1 && updatedSchemaData['@graph'][articleIndex].publisher?.address?.addressCountry !== undefined) {
                  updatedSchemaData['@graph'][articleIndex].publisher.address.addressCountry = value
                }
              } else if (updatedSchemaData.publisher?.address?.addressCountry !== undefined) {
                updatedSchemaData.publisher.address.addressCountry = value
              }
              break
            default:
              // Handle dynamic contact fields (multiple contact points or Service provider contacts)
              if (fieldName.startsWith('contactPhone_')) {
                const contactIndex = parseInt(fieldName.split('_')[1])
                // Check if it's Organization contactPoint array
                if (updatedSchemaData.contactPoint && Array.isArray(updatedSchemaData.contactPoint) && updatedSchemaData.contactPoint[contactIndex]) {
                  updatedSchemaData.contactPoint[contactIndex].telephone = value
                }
                // Check if it's Service provider contactPoint array
                else if (updatedSchemaData.provider?.contactPoint && updatedSchemaData.provider.contactPoint[contactIndex]) {
                  updatedSchemaData.provider.contactPoint[contactIndex].telephone = value
                }
              } else if (fieldName.startsWith('contactEmail_')) {
                const contactIndex = parseInt(fieldName.split('_')[1])
                // Check if it's Organization contactPoint array
                if (updatedSchemaData.contactPoint && Array.isArray(updatedSchemaData.contactPoint) && updatedSchemaData.contactPoint[contactIndex]) {
                  updatedSchemaData.contactPoint[contactIndex].email = value
                }
                // Check if it's Service provider contactPoint array
                else if (updatedSchemaData.provider?.contactPoint && updatedSchemaData.provider.contactPoint[contactIndex]) {
                  updatedSchemaData.provider.contactPoint[contactIndex].email = value
                }
              } else if (fieldName.startsWith('contactType_')) {
                const contactIndex = parseInt(fieldName.split('_')[1])
                // Check if it's Organization contactPoint array
                if (updatedSchemaData.contactPoint && Array.isArray(updatedSchemaData.contactPoint) && updatedSchemaData.contactPoint[contactIndex]) {
                  updatedSchemaData.contactPoint[contactIndex].contactType = value
                }
                // Check if it's Service provider contactPoint array
                else if (updatedSchemaData.provider?.contactPoint && updatedSchemaData.provider.contactPoint[contactIndex]) {
                  updatedSchemaData.provider.contactPoint[contactIndex].contactType = value
                }
              } else {
                // For other fields, try to find and update them in the schema
                if (updatedSchemaData[fieldName] !== undefined) {
                  updatedSchemaData[fieldName] = value
                }
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

