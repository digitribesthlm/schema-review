import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function SchemaEditor({ schema, onSave, onClose }) {
  const [editedFields, setEditedFields] = useState({})
  const [feedback, setFeedback] = useState(schema.feedback || '')
  const [loading, setLoading] = useState(false)

  const generateAdditionalFields = (schemaData) => {
    const additionalFields = {}
    
    // Handle FAQPage specific fields
    if (schemaData['@type'] === 'FAQPage') {
      // Handle service and product arrays that might be nested in FAQPage
      if (schemaData.service && Array.isArray(schemaData.service)) {
        schemaData.service.forEach((service, index) => {
          if (service.name && !schema.editable_fields?.[`serviceName_${index}`]) {
            additionalFields[`serviceName_${index}`] = {
              value: service.name,
              field_type: 'text',
              editable: true,
              description: `Service ${index + 1} name`
            }
          }
          if (service.description && !schema.editable_fields?.[`serviceDescription_${index}`]) {
            additionalFields[`serviceDescription_${index}`] = {
              value: service.description,
              field_type: 'textarea',
              editable: true,
              description: `Service ${index + 1} description`
            }
          }
        })
      }
      
      if (schemaData.product && Array.isArray(schemaData.product)) {
        schemaData.product.forEach((product, index) => {
          if (product.name && !schema.editable_fields?.[`productName_${index}`]) {
            additionalFields[`productName_${index}`] = {
              value: product.name,
              field_type: 'text',
              editable: true,
              description: `Product ${index + 1} name`
            }
          }
          if (product.description && !schema.editable_fields?.[`productDescription_${index}`]) {
            additionalFields[`productDescription_${index}`] = {
              value: product.description,
              field_type: 'textarea',
              editable: true,
              description: `Product ${index + 1} description`
            }
          }
        })
      }
    }
    
    // Handle other schema types - existing logic
    // Extract nested fields that should be editable
    if (schemaData.offers) {
      if (schemaData.offers.description && !schema.editable_fields?.offersDescription) {
        additionalFields.offersDescription = {
          value: schemaData.offers.description,
          field_type: 'textarea',
          editable: true,
          description: 'Product offer description'
        }
      }
    }
    
    if (schemaData.brand?.name && !schema.editable_fields?.brandName) {
      additionalFields.brandName = {
        value: schemaData.brand.name,
        field_type: 'text',
        editable: true,
        description: 'Brand name'
      }
    }
    
    if (schemaData.url && !schema.editable_fields?.url) {
      additionalFields.url = {
        value: schemaData.url,
        field_type: 'url',
        editable: true,
        description: 'Product URL'
      }
    }
    
    return additionalFields
  }

  useEffect(() => {
    // Initialize edited fields with current values
    const initialFields = {}
    
    // Create fields from existing editable_fields or schema_data
    if (schema.editable_fields) {
      Object.entries(schema.editable_fields).forEach(([key, field]) => {
        initialFields[key] = typeof field === 'object' && field !== null ? field.value : field
      })
    } else if (schema.schema_data) {
      // Create basic editable fields from schema_data if editable_fields don't exist
      const schemaData = schema.schema_data
      
      // Handle FAQPage schema type
      if (schemaData['@type'] === 'FAQPage') {
        if (schemaData.url) initialFields.url = schemaData.url
        
        if (schemaData.mainEntity && Array.isArray(schemaData.mainEntity)) {
          schemaData.mainEntity.forEach((qa, index) => {
            if (qa.name) initialFields[`question_${index}`] = qa.name
            if (qa.acceptedAnswer?.text) initialFields[`answer_${index}`] = qa.acceptedAnswer.text
          })
        }
        
        if (schemaData.publisher?.name) initialFields.publisherName = schemaData.publisher.name
        if (schemaData.publisher?.description) initialFields.publisherDescription = schemaData.publisher.description
        if (schemaData.publisher?.url) initialFields.publisherUrl = schemaData.publisher.url
      }
      // Handle Event schema type
      else if (schemaData['@type'] === 'Event') {
        if (schemaData.name) initialFields.name = schemaData.name
        if (schemaData.description) initialFields.description = schemaData.description
        if (schemaData.startDate) initialFields.startDate = schemaData.startDate
        if (schemaData.endDate) initialFields.endDate = schemaData.endDate
        
        // Location details
        if (schemaData.location?.name) initialFields.locationName = schemaData.location.name
        if (schemaData.location?.address?.streetAddress) initialFields.locationAddress = schemaData.location.address.streetAddress
        if (schemaData.location?.address?.addressLocality) initialFields.locationCity = schemaData.location.address.addressLocality
        if (schemaData.location?.address?.addressCountry) initialFields.locationCountry = schemaData.location.address.addressCountry
        
        // Organizer details
        if (schemaData.organizer?.name) initialFields.organizerName = schemaData.organizer.name
        if (schemaData.organizer?.url) initialFields.organizerUrl = schemaData.organizer.url
        
        // Offers details
        if (schemaData.offers?.price) initialFields.offerPrice = schemaData.offers.price
        if (schemaData.offers?.description) initialFields.offerDescription = schemaData.offers.description
        
        // Agenda items
        if (schemaData.agenda && Array.isArray(schemaData.agenda)) {
          schemaData.agenda.forEach((item, index) => {
            if (item.name) initialFields[`agenda_${index}`] = item.name
          })
        }
        
        // Speakers
        if (schemaData.speakers && Array.isArray(schemaData.speakers)) {
          schemaData.speakers.forEach((speaker, index) => {
            if (speaker.name) initialFields[`speaker_${index}_name`] = speaker.name
            if (speaker.worksFor?.name) initialFields[`speaker_${index}_company`] = speaker.worksFor.name
            if (speaker.url) initialFields[`speaker_${index}_url`] = speaker.url
          })
        }
      }
      // Handle Organization schema type
      else if (schemaData['@type'] === 'Organization') {
        if (schemaData.name) initialFields.name = schemaData.name
        if (schemaData.alternateName) initialFields.alternateName = schemaData.alternateName
        if (schemaData.url) initialFields.url = schemaData.url
        
        // Handle logo as both simple URL and ImageObject
        const logoUrl = schemaData.logo?.url || schemaData.logo
        if (logoUrl) initialFields.logoUrl = logoUrl
        if (schemaData.logo?.width) initialFields.logoWidth = schemaData.logo.width
        if (schemaData.logo?.height) initialFields.logoHeight = schemaData.logo.height
        
        if (schemaData.description) initialFields.description = schemaData.description
        if (schemaData.slogan) initialFields.slogan = schemaData.slogan
        if (schemaData.foundingDate) initialFields.foundingDate = schemaData.foundingDate
        
        // Handle numberOfEmployees as both string and QuantitativeValue
        const employeeCount = schemaData.numberOfEmployees?.value || schemaData.numberOfEmployees
        if (employeeCount) initialFields.numberOfEmployees = employeeCount
        if (schemaData.numberOfEmployees?.unitText) initialFields.employeeUnit = schemaData.numberOfEmployees.unitText
        
        // Parent organization
        if (schemaData.parentOrganization?.name) initialFields.parentOrgName = schemaData.parentOrganization.name
        if (schemaData.parentOrganization?.url) initialFields.parentOrgUrl = schemaData.parentOrganization.url
        
        // Address details
        if (schemaData.address?.streetAddress) initialFields.addressStreet = schemaData.address.streetAddress
        if (schemaData.address?.addressLocality) initialFields.addressCity = schemaData.address.addressLocality
        if (schemaData.address?.postalCode) initialFields.addressPostalCode = schemaData.address.postalCode
        if (schemaData.address?.addressCountry) initialFields.addressCountry = schemaData.address.addressCountry
        if (schemaData.address?.addressRegion) initialFields.addressRegion = schemaData.address.addressRegion
        
        // Area served
        if (schemaData.areaServed && Array.isArray(schemaData.areaServed)) {
          schemaData.areaServed.forEach((area, index) => {
            const areaName = area.name || area
            initialFields[`areaServed_${index}`] = areaName
          })
        }
        
        // Contact points
        if (schemaData.contactPoint && Array.isArray(schemaData.contactPoint)) {
          schemaData.contactPoint.forEach((contact, index) => {
            if (contact.telephone) initialFields[`contact_${index}_phone`] = contact.telephone
            if (contact.email) initialFields[`contact_${index}_email`] = contact.email
            if (contact.hoursAvailable?.opens && contact.hoursAvailable?.closes) {
              initialFields[`contact_${index}_hours`] = `${contact.hoursAvailable.opens} - ${contact.hoursAvailable.closes}`
            }
          })
        }
        
        // Departments
        if (schemaData.department && Array.isArray(schemaData.department)) {
          schemaData.department.forEach((dept, index) => {
            if (dept.name) initialFields[`department_${index}_name`] = dept.name
            if (dept.contactPoint?.telephone) initialFields[`department_${index}_phone`] = dept.contactPoint.telephone
            if (dept.contactPoint?.email) initialFields[`department_${index}_email`] = dept.contactPoint.email
          })
        }
        
        // Expertise areas
        if (schemaData.knowsAbout && Array.isArray(schemaData.knowsAbout)) {
          initialFields.knowsAbout = schemaData.knowsAbout.join(', ')
        }
        
        // Partnerships
        if (schemaData.memberOf && Array.isArray(schemaData.memberOf)) {
          schemaData.memberOf.forEach((partnership, index) => {
            if (partnership.name) initialFields[`memberOf_${index}_name`] = partnership.name
            if (partnership.url) initialFields[`memberOf_${index}_url`] = partnership.url
          })
        }
        
        // Awards
        if (schemaData.award && Array.isArray(schemaData.award)) {
          schemaData.award.forEach((award, index) => {
            initialFields[`award_${index}`] = award
          })
        }
        
        // Aggregate rating
        if (schemaData.aggregateRating?.ratingValue) initialFields.ratingValue = schemaData.aggregateRating.ratingValue
        if (schemaData.aggregateRating?.bestRating) initialFields.bestRating = schemaData.aggregateRating.bestRating
        if (schemaData.aggregateRating?.ratingCount) initialFields.ratingCount = schemaData.aggregateRating.ratingCount
        if (schemaData.aggregateRating?.description) initialFields.ratingDescription = schemaData.aggregateRating.description
        
        // Business identifiers
        if (schemaData.taxID) initialFields.taxID = schemaData.taxID
        if (schemaData.vatID) initialFields.vatID = schemaData.vatID
        
        // Social media links
        if (schemaData.sameAs && Array.isArray(schemaData.sameAs)) {
          schemaData.sameAs.forEach((socialUrl, index) => {
            initialFields[`social_${index}`] = socialUrl
          })
        }
      }
      // Handle other schema types
      else {
        if (schemaData.name) initialFields.name = schemaData.name
        if (schemaData.description) initialFields.description = schemaData.description
        if (schemaData.serviceType) initialFields.serviceType = schemaData.serviceType
        if (schemaData.areaServed) initialFields.areaServed = schemaData.areaServed
        if (schemaData.image) initialFields.image = schemaData.image
        if (schemaData.offers?.description) initialFields.offersDescription = schemaData.offers.description
      }
    }
    
    setEditedFields(initialFields)
  }, [schema])

  const handleFieldChange = (fieldName, value) => {
    setEditedFields(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleAction = async (action) => {
    setLoading(true)
    try {
      await onSave(editedFields, feedback, action)
      toast.success(`Schema ${action} successfully!`)
      onClose()
    } catch (error) {
      toast.error(`Failed to ${action} schema`)
    } finally {
      setLoading(false)
    }
  }

  const getAllEditableFields = () => {
    // Start with existing editable_fields or empty object
    const allFields = { ...(schema.editable_fields || {}) }
    
    // If no editable_fields exist, create them from schema_data
    if (!schema.editable_fields && schema.schema_data) {
      const schemaData = schema.schema_data
      
      // Handle FAQPage schema type
      if (schemaData['@type'] === 'FAQPage') {
        if (schemaData.url) {
          allFields.url = {
            value: schemaData.url,
            field_type: 'url',
            editable: true,
            description: 'FAQ page URL'
          }
        }
        
        if (schemaData.mainEntity && Array.isArray(schemaData.mainEntity)) {
          // Create editable fields for each question-answer pair
          schemaData.mainEntity.forEach((qa, index) => {
            if (qa.name) {
              allFields[`question_${index}`] = {
                value: qa.name,
                field_type: 'text',
                editable: true,
                description: `FAQ question #${index + 1}`
              }
            }
            
            if (qa.acceptedAnswer?.text) {
              allFields[`answer_${index}`] = {
                value: qa.acceptedAnswer.text,
                field_type: 'textarea',
                editable: true,
                description: `FAQ answer for question #${index + 1}`
              }
            }
          })
        }
        
        if (schemaData.publisher?.name) {
          allFields.publisherName = {
            value: schemaData.publisher.name,
            field_type: 'text',
            editable: true,
            description: 'Organization publishing the FAQ'
          }
        }
        
        if (schemaData.publisher?.description) {
          allFields.publisherDescription = {
            value: schemaData.publisher.description,
            field_type: 'textarea',
            editable: true,
            description: 'Description of the publishing organization'
          }
        }
        
        if (schemaData.publisher?.url) {
          allFields.publisherUrl = {
            value: schemaData.publisher.url,
            field_type: 'url',
            editable: true,
            description: 'Publisher website URL'
          }
        }
      }
      // Handle Event schema type
      else if (schemaData['@type'] === 'Event') {
        if (schemaData.name) {
          allFields.name = {
            value: schemaData.name,
            field_type: 'text',
            editable: true,
            description: 'Event name'
          }
        }
        
        if (schemaData.description) {
          allFields.description = {
            value: schemaData.description,
            field_type: 'textarea',
            editable: true,
            description: 'Event description'
          }
        }
        
        if (schemaData.startDate) {
          allFields.startDate = {
            value: schemaData.startDate,
            field_type: 'date',
            editable: true,
            description: 'Event start date'
          }
        }
        
        if (schemaData.endDate) {
          allFields.endDate = {
            value: schemaData.endDate,
            field_type: 'date',
            editable: true,
            description: 'Event end date'
          }
        }
        
        // Location details
        if (schemaData.location?.name) {
          allFields.locationName = {
            value: schemaData.location.name,
            field_type: 'text',
            editable: true,
            description: 'Event venue name'
          }
        }
        
        if (schemaData.location?.address?.streetAddress) {
          allFields.locationAddress = {
            value: schemaData.location.address.streetAddress,
            field_type: 'text',
            editable: true,
            description: 'Venue street address'
          }
        }
        
        if (schemaData.location?.address?.addressLocality) {
          allFields.locationCity = {
            value: schemaData.location.address.addressLocality,
            field_type: 'text',
            editable: true,
            description: 'Venue city'
          }
        }
        
        if (schemaData.location?.address?.addressCountry) {
          allFields.locationCountry = {
            value: schemaData.location.address.addressCountry,
            field_type: 'text',
            editable: true,
            description: 'Venue country'
          }
        }
        
        // Organizer details
        if (schemaData.organizer?.name) {
          allFields.organizerName = {
            value: schemaData.organizer.name,
            field_type: 'text',
            editable: true,
            description: 'Event organizer name'
          }
        }
        
        if (schemaData.organizer?.url) {
          allFields.organizerUrl = {
            value: schemaData.organizer.url,
            field_type: 'url',
            editable: true,
            description: 'Organizer website'
          }
        }
        
        // Offers details
        if (schemaData.offers?.price) {
          allFields.offerPrice = {
            value: schemaData.offers.price,
            field_type: 'text',
            editable: true,
            description: 'Ticket price'
          }
        }
        
        if (schemaData.offers?.description) {
          allFields.offerDescription = {
            value: schemaData.offers.description,
            field_type: 'textarea',
            editable: true,
            description: 'Offer details'
          }
        }
        
        // Agenda items
        if (schemaData.agenda && Array.isArray(schemaData.agenda)) {
          schemaData.agenda.forEach((item, index) => {
            if (item.name) {
              allFields[`agenda_${index}`] = {
                value: item.name,
                field_type: 'text',
                editable: true,
                description: `Agenda item #${index + 1}`
              }
            }
          })
        }
        
        // Speakers
        if (schemaData.speakers && Array.isArray(schemaData.speakers)) {
          schemaData.speakers.forEach((speaker, index) => {
            if (speaker.name) {
              allFields[`speaker_${index}_name`] = {
                value: speaker.name,
                field_type: 'text',
                editable: true,
                description: `Speaker #${index + 1} name`
              }
            }
            
            if (speaker.worksFor?.name) {
              allFields[`speaker_${index}_company`] = {
                value: speaker.worksFor.name,
                field_type: 'text',
                editable: true,
                description: `Speaker #${index + 1} company`
              }
            }
            
            if (speaker.url) {
              allFields[`speaker_${index}_url`] = {
                value: speaker.url,
                field_type: 'url',
                editable: true,
                description: `Speaker #${index + 1} profile URL`
              }
            }
          })
        }
      }
      // Handle Organization schema type
      else if (schemaData['@type'] === 'Organization') {
        if (schemaData.name) {
          allFields.name = {
            value: schemaData.name,
            field_type: 'text',
            editable: true,
            description: 'Organization name'
          }
        }
        
        if (schemaData.alternateName) {
          allFields.alternateName = {
            value: schemaData.alternateName,
            field_type: 'text',
            editable: true,
            description: 'Alternate name or trading name'
          }
        }
        
        if (schemaData.url) {
          allFields.url = {
            value: schemaData.url,
            field_type: 'url',
            editable: true,
            description: 'Organization website'
          }
        }
        
        // Handle logo as both simple URL and ImageObject
        const logoUrl = schemaData.logo?.url || schemaData.logo
        if (logoUrl) {
          allFields.logoUrl = {
            value: logoUrl,
            field_type: 'url',
            editable: true,
            description: 'Organization logo URL'
          }
        }
        
        if (schemaData.logo?.width) {
          allFields.logoWidth = {
            value: schemaData.logo.width,
            field_type: 'text',
            editable: true,
            description: 'Logo image width'
          }
        }
        
        if (schemaData.logo?.height) {
          allFields.logoHeight = {
            value: schemaData.logo.height,
            field_type: 'text',
            editable: true,
            description: 'Logo image height'
          }
        }
        
        if (schemaData.description) {
          allFields.description = {
            value: schemaData.description,
            field_type: 'textarea',
            editable: true,
            description: 'Organization description'
          }
        }
        
        if (schemaData.slogan) {
          allFields.slogan = {
            value: schemaData.slogan,
            field_type: 'text',
            editable: true,
            description: 'Organization slogan'
          }
        }
        
        if (schemaData.foundingDate) {
          allFields.foundingDate = {
            value: schemaData.foundingDate,
            field_type: 'text',
            editable: true,
            description: 'Founding date or year'
          }
        }
        
        // Handle numberOfEmployees as both string and QuantitativeValue
        const employeeCount = schemaData.numberOfEmployees?.value || schemaData.numberOfEmployees
        if (employeeCount) {
          allFields.numberOfEmployees = {
            value: employeeCount,
            field_type: 'text',
            editable: true,
            description: 'Number of employees'
          }
        }
        
        if (schemaData.numberOfEmployees?.unitText) {
          allFields.employeeUnit = {
            value: schemaData.numberOfEmployees.unitText,
            field_type: 'text',
            editable: true,
            description: 'Employee count unit'
          }
        }
        
        // Parent organization
        if (schemaData.parentOrganization?.name) {
          allFields.parentOrgName = {
            value: schemaData.parentOrganization.name,
            field_type: 'text',
            editable: true,
            description: 'Parent organization name'
          }
        }
        
        if (schemaData.parentOrganization?.url) {
          allFields.parentOrgUrl = {
            value: schemaData.parentOrganization.url,
            field_type: 'url',
            editable: true,
            description: 'Parent organization website'
          }
        }
        
        // Address details
        if (schemaData.address?.streetAddress) {
          allFields.addressStreet = {
            value: schemaData.address.streetAddress,
            field_type: 'text',
            editable: true,
            description: 'Street address'
          }
        }
        
        if (schemaData.address?.addressLocality) {
          allFields.addressCity = {
            value: schemaData.address.addressLocality,
            field_type: 'text',
            editable: true,
            description: 'City or locality'
          }
        }
        
        if (schemaData.address?.addressRegion) {
          allFields.addressRegion = {
            value: schemaData.address.addressRegion,
            field_type: 'text',
            editable: true,
            description: 'Region or state'
          }
        }
        
        if (schemaData.address?.postalCode) {
          allFields.addressPostalCode = {
            value: schemaData.address.postalCode,
            field_type: 'text',
            editable: true,
            description: 'Postal code'
          }
        }
        
        if (schemaData.address?.addressCountry) {
          allFields.addressCountry = {
            value: schemaData.address.addressCountry,
            field_type: 'text',
            editable: true,
            description: 'Country'
          }
        }
        
        // Area served
        if (schemaData.areaServed && Array.isArray(schemaData.areaServed)) {
          schemaData.areaServed.forEach((area, index) => {
            const areaName = area.name || area
            allFields[`areaServed_${index}`] = {
              value: areaName,
              field_type: 'text',
              editable: true,
              description: `Area served #${index + 1}`
            }
          })
        }
        
        // Contact points
        if (schemaData.contactPoint && Array.isArray(schemaData.contactPoint)) {
          schemaData.contactPoint.forEach((contact, index) => {
            if (contact.telephone) {
              allFields[`contact_${index}_phone`] = {
                value: contact.telephone,
                field_type: 'tel',
                editable: true,
                description: `${contact.contactType || 'Contact'} phone number`
              }
            }
            
            if (contact.email) {
              allFields[`contact_${index}_email`] = {
                value: contact.email,
                field_type: 'email',
                editable: true,
                description: `${contact.contactType || 'Contact'} email`
              }
            }
            
            if (contact.hoursAvailable?.opens && contact.hoursAvailable?.closes) {
              allFields[`contact_${index}_hours`] = {
                value: `${contact.hoursAvailable.opens} - ${contact.hoursAvailable.closes}`,
                field_type: 'text',
                editable: true,
                description: `${contact.contactType || 'Contact'} hours`
              }
            }
          })
        }
        
        // Departments
        if (schemaData.department && Array.isArray(schemaData.department)) {
          schemaData.department.forEach((dept, index) => {
            if (dept.name) {
              allFields[`department_${index}_name`] = {
                value: dept.name,
                field_type: 'text',
                editable: true,
                description: `Department #${index + 1} name`
              }
            }
            
            if (dept.contactPoint?.telephone) {
              allFields[`department_${index}_phone`] = {
                value: dept.contactPoint.telephone,
                field_type: 'tel',
                editable: true,
                description: `Department #${index + 1} phone`
              }
            }
            
            if (dept.contactPoint?.email) {
              allFields[`department_${index}_email`] = {
                value: dept.contactPoint.email,
                field_type: 'email',
                editable: true,
                description: `Department #${index + 1} email`
              }
            }
          })
        }
        
        // Expertise areas
        if (schemaData.knowsAbout && Array.isArray(schemaData.knowsAbout)) {
          allFields.knowsAbout = {
            value: schemaData.knowsAbout.join(', '),
            field_type: 'textarea',
            editable: true,
            description: 'Areas of expertise (comma-separated)'
          }
        }
        
        // Partnerships/memberships
        if (schemaData.memberOf && Array.isArray(schemaData.memberOf)) {
          schemaData.memberOf.forEach((partnership, index) => {
            if (partnership.name) {
              allFields[`memberOf_${index}_name`] = {
                value: partnership.name,
                field_type: 'text',
                editable: true,
                description: `Partnership #${index + 1} name`
              }
            }
            
            if (partnership.url) {
              allFields[`memberOf_${index}_url`] = {
                value: partnership.url,
                field_type: 'url',
                editable: true,
                description: `Partnership #${index + 1} URL`
              }
            }
          })
        }
        
        // Awards
        if (schemaData.award && Array.isArray(schemaData.award)) {
          schemaData.award.forEach((award, index) => {
            allFields[`award_${index}`] = {
              value: award,
              field_type: 'text',
              editable: true,
              description: `Award #${index + 1}`
            }
          })
        }
        
        // Aggregate rating
        if (schemaData.aggregateRating?.ratingValue) {
          allFields.ratingValue = {
            value: schemaData.aggregateRating.ratingValue,
            field_type: 'text',
            editable: true,
            description: 'Rating value'
          }
        }
        
        if (schemaData.aggregateRating?.bestRating) {
          allFields.bestRating = {
            value: schemaData.aggregateRating.bestRating,
            field_type: 'text',
            editable: true,
            description: 'Best possible rating'
          }
        }
        
        if (schemaData.aggregateRating?.ratingCount) {
          allFields.ratingCount = {
            value: schemaData.aggregateRating.ratingCount,
            field_type: 'text',
            editable: true,
            description: 'Number of ratings'
          }
        }
        
        if (schemaData.aggregateRating?.description) {
          allFields.ratingDescription = {
            value: schemaData.aggregateRating.description,
            field_type: 'text',
            editable: true,
            description: 'Rating description'
          }
        }
        
        // Business identifiers
        if (schemaData.taxID) {
          allFields.taxID = {
            value: schemaData.taxID,
            field_type: 'text',
            editable: true,
            description: 'Tax identification number'
          }
        }
        
        if (schemaData.vatID) {
          allFields.vatID = {
            value: schemaData.vatID,
            field_type: 'text',
            editable: true,
            description: 'VAT identification number'
          }
        }
        
        // Social media links
        if (schemaData.sameAs && Array.isArray(schemaData.sameAs)) {
          schemaData.sameAs.forEach((socialUrl, index) => {
            allFields[`social_${index}`] = {
              value: socialUrl,
              field_type: 'url',
              editable: true,
              description: `Social media profile #${index + 1}`
            }
          })
        }
      }
      // Handle other schema types (Service, Product, etc.) - existing code
      else {
        // Create editable fields from common schema properties
        if (schemaData.name) {
          allFields.name = {
            value: schemaData.name,
            field_type: 'text',
            editable: true,
            description: 'Service/Product name'
          }
        }
        
        if (schemaData.description) {
          allFields.description = {
            value: schemaData.description,
            field_type: 'textarea',
            editable: true,
            description: 'Service/Product description'
          }
        }
        
        if (schemaData.serviceType) {
          allFields.serviceType = {
            value: schemaData.serviceType,
            field_type: 'text',
            editable: true,
            description: 'Type of service'
          }
        }
        
        if (schemaData.areaServed) {
          allFields.areaServed = {
            value: Array.isArray(schemaData.areaServed) ? schemaData.areaServed : [schemaData.areaServed.name || schemaData.areaServed],
            field_type: 'array',
            editable: true,
            description: 'Geographic areas served'
          }
        }
        
        if (schemaData.image) {
          allFields.image = {
            value: schemaData.image,
            field_type: 'url',
            editable: true,
            description: 'Service/Product image URL'
          }
        }
        
        if (schemaData.offers?.description) {
          allFields.offersDescription = {
            value: schemaData.offers.description,
            field_type: 'textarea',
            editable: true,
            description: 'Service offering description'
          }
        }
      }
    }
    
    if (schema.schema_data) {
      const additionalFields = generateAdditionalFields(schema.schema_data)
      Object.assign(allFields, additionalFields)
    }
    
    // Force all fields to be editable in the editor - but handle primitive values safely
    Object.keys(allFields).forEach(fieldName => {
      const field = allFields[fieldName]
      
      // If field is a primitive value, convert it to a field object
      if (typeof field !== 'object' || field === null) {
        allFields[fieldName] = {
          value: field,
          field_type: typeof field === 'string' && field.includes('T') && field.includes('Z') ? 'datetime' : 'text',
          editable: true,
          description: fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        }
      } else {
        // Field is already an object, just ensure it's editable
        allFields[fieldName].editable = true
      }
    })
    
    return allFields
  }

  const renderField = (fieldName, fieldConfig) => {
    const value = editedFields[fieldName] || fieldConfig.value
    const fieldId = `field-${fieldName}`

    switch (fieldConfig.field_type) {
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="form-input h-40 resize-y"
            placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
          />
        )
      
      case 'array':
        return (
          <input
            id={fieldId}
            type="text"
            value={Array.isArray(value) ? value.join(', ') : value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value.split(', ').filter(Boolean))}
            className="form-input"
            placeholder="Separate items with commas"
          />
        )
      
      case 'email':
        return (
          <input
            id={fieldId}
            type="email"
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="form-input"
            placeholder="Enter email address"
          />
        )
      
      case 'tel':
        return (
          <input
            id={fieldId}
            type="tel"
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="form-input"
            placeholder="Enter phone number"
          />
        )
      
      case 'url':
        return (
          <input
            id={fieldId}
            type="url"
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="form-input"
            placeholder="Enter URL"
          />
        )
      
      case 'date':
        return (
          <input
            id={fieldId}
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="form-input"
          />
        )
      
      case 'datetime':
        return (
          <input
            id={fieldId}
            type="datetime-local"
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="form-input"
          />
        )
      
      default:
        return (
          <input
            id={fieldId}
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="form-input"
            placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
          />
        )
    }
  }

  const hasChanges = () => {
    const allFields = getAllEditableFields()
    if (!allFields) return false
    return Object.entries(editedFields).some(([key, value]) => {
      const originalValue = allFields[key]?.value
      if (Array.isArray(value) && Array.isArray(originalValue)) {
        return JSON.stringify(value) !== JSON.stringify(originalValue)
      }
      return value !== originalValue
    }) || feedback !== (schema.feedback || '')
  }

  const formatSchemaType = (type) => {
    return type.replace(/([A-Z])/g, ' $1').trim()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-hubspot-light flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-hubspot-dark">
              Review & Edit Schema
            </h3>
            <span className="badge bg-hubspot-orange text-white">
              {formatSchemaType(schema.schema_type)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-hubspot-gray hover:text-hubspot-dark transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left Column - Editable Fields */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-hubspot-dark">Editable Fields</h4>
              
              <div className="space-y-6">
                {Object.entries(getAllEditableFields()).map(([fieldName, fieldConfig]) => (
                  <div key={fieldName}>
                    <label htmlFor={`field-${fieldName}`} className="form-label">
                      {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      {fieldConfig.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </label>
                    {renderField(fieldName, fieldConfig)}
                    {fieldConfig.description && (
                      <p className="text-xs text-hubspot-gray mt-1">{fieldConfig.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Feedback Section */}
              <div className="pt-6 border-t border-gray-200">
                <label htmlFor="feedback" className="form-label">
                  Feedback (Optional)
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="form-input h-24 resize-none"
                  placeholder="Add any comments or feedback about this schema..."
                />
              </div>
            </div>

            {/* Right Column - Schema Preview */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-hubspot-dark">Schema Preview</h4>
              
              <div className="json-preview">
                <pre>{JSON.stringify(schema.schema_data, null, 2)}</pre>
              </div>

              {/* Schema Info */}
              <div className="card">
                <div className="card-body">
                  <h5 className="text-sm font-medium text-hubspot-dark mb-3">Schema Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-hubspot-gray">Type:</span>
                      <span className="font-medium text-hubspot-dark">{schema.schema_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hubspot-gray">Priority:</span>
                      <span className={`badge ${
                        schema.schema_priority === 'primary' 
                          ? 'bg-hubspot-orange text-white' 
                          : 'badge-info'
                      }`}>
                        {schema.schema_priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hubspot-gray">Version:</span>
                      <span className="font-medium text-hubspot-dark">{schema.version || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hubspot-gray">Status:</span>
                      <span className={`badge ${
                        schema.approval_status === 'approved' ? 'badge-success' :
                        schema.approval_status === 'rejected' ? 'badge-error' :
                        schema.approval_status === 'needs_revision' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {schema.approval_status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hubspot-gray">Last Updated:</span>
                      <span className="font-medium text-hubspot-dark">
                        {new Date(schema.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Summary */}
              <div className="card">
                <div className="card-body">
                  <h5 className="text-sm font-medium text-hubspot-dark mb-3">Field Summary</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-hubspot-gray">Total Fields:</span>
                      <span className="font-medium">{Object.keys(getAllEditableFields()).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hubspot-gray">Editable:</span>
                      <span className="font-medium text-green-600">
                        {Object.values(getAllEditableFields()).filter(f => f.editable).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hubspot-gray">Read Only:</span>
                      <span className="font-medium text-hubspot-gray">
                        {Object.values(getAllEditableFields()).filter(f => !f.editable).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-hubspot-light flex-shrink-0">
          <div className="flex items-center text-sm text-hubspot-gray">
            {hasChanges() && (
              <span className="flex items-center text-orange-600">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.17 0 2.25-.16 2.25-1.729 0-.329-.314-.729-.314-.729L12 2.25l-6.875 11.25s-.314.4-.314.729c0 1.569 1.08 1.729 2.25 1.729z" />
                </svg>
                Unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            
            {/* Status Change Buttons - Always Available */}
            <button
              onClick={() => handleAction('rejected')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                schema.approval_status === 'rejected' 
                  ? 'bg-red-200 text-red-900 border-2 border-red-400' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
              disabled={loading}
            >
              {loading ? 'Processing...' : '✗ Reject'}
              {schema.approval_status === 'rejected' && ' (Current)'}
            </button>
            
            <button
              onClick={() => handleAction('needs_revision')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                schema.approval_status === 'needs_revision' 
                  ? 'bg-yellow-200 text-yellow-900 border-2 border-yellow-400' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
              disabled={loading}
            >
              {loading ? 'Processing...' : '⚠ Needs Revision'}
              {schema.approval_status === 'needs_revision' && ' (Current)'}
            </button>
            
            <button
              onClick={() => handleAction('approved')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                schema.approval_status === 'approved' 
                  ? 'bg-green-200 text-green-900 border-2 border-green-400' 
                  : 'btn-primary'
              }`}
              disabled={loading}
            >
              {loading ? 'Processing...' : '✓ Approve'}
              {schema.approval_status === 'approved' && ' (Current)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

