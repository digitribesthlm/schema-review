import { useState } from 'react'

export default function SchemaCard({ schema, onEdit, onApprove, onReject }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'badge-success'
      case 'rejected': return 'badge-error'
      case 'needs_revision': return 'badge-warning'
      default: return 'badge-info'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✓'
      case 'rejected': return '✗'
      case 'needs_revision': return '⚠'
      default: return '⏳'
    }
  }

  const formatSchemaType = (type) => {
    return type.replace(/([A-Z])/g, ' $1').trim()
  }

  const getPreviewFields = () => {
    // If we have editable_fields, use them
    if (schema.editable_fields) {
      const fields = Object.entries(schema.editable_fields).slice(0, 6)
      return fields.map(([key, field]) => ({
        key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: Array.isArray(field.value) ? field.value.join(', ') : field.value,
        editable: field.editable
      }))
    }
    
    // If no editable_fields, create preview from schema_data
    if (schema.schema_data) {
      const schemaData = schema.schema_data
      const previewFields = []
      
      // Handle FAQPage schema type
      if (schemaData['@type'] === 'FAQPage') {
        if (schemaData.url) {
          previewFields.push({
            key: 'url',
            label: 'FAQ Page URL',
            value: schemaData.url,
            editable: true
          })
        }
        
        if (schemaData.mainEntity && Array.isArray(schemaData.mainEntity)) {
          previewFields.push({
            key: 'questionsCount',
            label: 'Number of Questions',
            value: schemaData.mainEntity.length,
            editable: false
          })
          
          // Show first few questions as preview
          schemaData.mainEntity.slice(0, 3).forEach((qa, index) => {
            if (qa.name) {
              previewFields.push({
                key: `question_${index}`,
                label: `Question ${index + 1}`,
                value: qa.name.length > 80 ? qa.name.substring(0, 80) + '...' : qa.name,
                editable: true
              })
            }
          })
        }
        
        if (schemaData.publisher?.name) {
          previewFields.push({
            key: 'publisherName',
            label: 'Publisher',
            value: schemaData.publisher.name,
            editable: true
          })
        }
        
        return previewFields.slice(0, 6)
      }
      
      // Handle Event schema type
      if (schemaData['@type'] === 'Event') {
        if (schemaData.name) {
          previewFields.push({
            key: 'name',
            label: 'Event Name',
            value: schemaData.name,
            editable: true
          })
        }
        
        if (schemaData.description) {
          previewFields.push({
            key: 'description',
            label: 'Description',
            value: schemaData.description.length > 100 ? 
              schemaData.description.substring(0, 100) + '...' : 
              schemaData.description,
            editable: true
          })
        }
        
        if (schemaData.startDate && schemaData.endDate) {
          const dateRange = schemaData.startDate === schemaData.endDate ? 
            schemaData.startDate : 
            `${schemaData.startDate} to ${schemaData.endDate}`
          previewFields.push({
            key: 'dateRange',
            label: 'Event Date(s)',
            value: dateRange,
            editable: false
          })
        }
        
        if (schemaData.location?.name) {
          previewFields.push({
            key: 'locationName',
            label: 'Location',
            value: schemaData.location.name,
            editable: true
          })
        }
        
        if (schemaData.organizer?.name) {
          previewFields.push({
            key: 'organizerName',
            label: 'Organizer',
            value: schemaData.organizer.name,
            editable: true
          })
        }
        
        if (schemaData.agenda && Array.isArray(schemaData.agenda)) {
          previewFields.push({
            key: 'agendaCount',
            label: 'Agenda Items',
            value: `${schemaData.agenda.length} items`,
            editable: false
          })
        }
        
        if (schemaData.speakers && Array.isArray(schemaData.speakers)) {
          previewFields.push({
            key: 'speakersCount',
            label: 'Speakers',
            value: `${schemaData.speakers.length} speakers`,
            editable: false
          })
        }
        
        return previewFields.slice(0, 6)
      }
      
      // Handle Organization schema type
      if (schemaData['@type'] === 'Organization') {
        if (schemaData.name) {
          previewFields.push({
            key: 'name',
            label: 'Organization Name',
            value: schemaData.name,
            editable: true
          })
        }
        
        if (schemaData.alternateName) {
          previewFields.push({
            key: 'alternateName',
            label: 'Alternate Name',
            value: schemaData.alternateName,
            editable: true
          })
        }
        
        if (schemaData.slogan) {
          previewFields.push({
            key: 'slogan',
            label: 'Slogan',
            value: schemaData.slogan,
            editable: true
          })
        }
        
        if (schemaData.description) {
          previewFields.push({
            key: 'description',
            label: 'Description',
            value: schemaData.description.length > 100 ? 
              schemaData.description.substring(0, 100) + '...' : 
              schemaData.description,
            editable: true
          })
        }
        
        if (schemaData.foundingDate) {
          previewFields.push({
            key: 'foundingDate',
            label: 'Founded',
            value: schemaData.foundingDate,
            editable: true
          })
        }
        
        // Handle numberOfEmployees as both string and QuantitativeValue object
        const employeeCount = schemaData.numberOfEmployees?.value || schemaData.numberOfEmployees
        if (employeeCount) {
          previewFields.push({
            key: 'employeeCount',
            label: 'Employees',
            value: `${employeeCount}${schemaData.numberOfEmployees?.unitText ? ' ' + schemaData.numberOfEmployees.unitText : ''}`,
            editable: false
          })
        }
        
        if (schemaData.parentOrganization?.name) {
          previewFields.push({
            key: 'parentOrg',
            label: 'Parent Company',
            value: schemaData.parentOrganization.name,
            editable: false
          })
        }
        
        if (schemaData.aggregateRating?.ratingValue) {
          previewFields.push({
            key: 'rating',
            label: 'Rating',
            value: `${schemaData.aggregateRating.ratingValue}/${schemaData.aggregateRating.bestRating || '5'} (${schemaData.aggregateRating.ratingCount || '0'} reviews)`,
            editable: false
          })
        }
        
        if (schemaData.department && Array.isArray(schemaData.department)) {
          previewFields.push({
            key: 'departments',
            label: 'Departments',
            value: `${schemaData.department.length} departments`,
            editable: false
          })
        }
        
        if (schemaData.memberOf && Array.isArray(schemaData.memberOf)) {
          previewFields.push({
            key: 'partnerships',
            label: 'Partnerships',
            value: `${schemaData.memberOf.length} partnerships`,
            editable: false
          })
        }
        
        if (schemaData.areaServed && Array.isArray(schemaData.areaServed)) {
          const countries = schemaData.areaServed.map(area => area.name || area).join(', ')
          previewFields.push({
            key: 'areaServed',
            label: 'Areas Served',
            value: countries.length > 50 ? countries.substring(0, 50) + '...' : countries,
            editable: false
          })
        }
        
        return previewFields.slice(0, 6)
      }
      
      // Handle other schema types (Service, Product, etc.)
      if (schemaData.name) {
        previewFields.push({
          key: 'name',
          label: 'Name',
          value: schemaData.name,
          editable: true
        })
      }
      
      if (schemaData.description) {
        previewFields.push({
          key: 'description', 
          label: 'Description',
          value: schemaData.description.length > 100 ? 
            schemaData.description.substring(0, 100) + '...' : 
            schemaData.description,
          editable: true
        })
      }
      
      if (schemaData.serviceType) {
        previewFields.push({
          key: 'serviceType',
          label: 'Service Type', 
          value: schemaData.serviceType,
          editable: true
        })
      }
      
      if (schemaData.areaServed) {
        const areaValue = Array.isArray(schemaData.areaServed) ? 
          schemaData.areaServed.join(', ') : 
          (schemaData.areaServed.name || schemaData.areaServed)
        previewFields.push({
          key: 'areaServed',
          label: 'Area Served',
          value: areaValue,
          editable: true
        })
      }
      
      if (schemaData.offers?.description) {
        previewFields.push({
          key: 'offersDescription',
          label: 'Offers Description',
          value: schemaData.offers.description,
          editable: true
        })
      }
      
      if (schemaData.image) {
        previewFields.push({
          key: 'image',
          label: 'Image',
          value: schemaData.image,
          editable: true
        })
      }
      
      return previewFields.slice(0, 6) // Limit to 6 fields for preview
    }
    
    return []
  }

  const getAllFields = () => {
    // If we have editable_fields, use them
    if (schema.editable_fields) {
      return Object.entries(schema.editable_fields).map(([key, field]) => ({
        key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: Array.isArray(field.value) ? field.value.join(', ') : field.value,
        editable: field.editable,
        fieldType: field.field_type,
        description: field.description
      }))
    }
    
    // If no editable_fields, create all fields from schema_data
    if (schema.schema_data) {
      const schemaData = schema.schema_data
      const allFields = []
      
      // Handle FAQPage schema type
      if (schemaData['@type'] === 'FAQPage') {
        if (schemaData.url) {
          allFields.push({
            key: 'url',
            label: 'FAQ Page URL',
            value: schemaData.url,
            editable: true,
            fieldType: 'url',
            description: 'The URL of the FAQ page'
          })
        }
        
        if (schemaData.mainEntity && Array.isArray(schemaData.mainEntity)) {
          // Add each question and answer pair
          schemaData.mainEntity.forEach((qa, index) => {
            if (qa.name) {
              allFields.push({
                key: `question_${index}`,
                label: `Question ${index + 1}`,
                value: qa.name,
                editable: true,
                fieldType: 'text',
                description: `FAQ question #${index + 1}`
              })
            }
            
            if (qa.acceptedAnswer?.text) {
              allFields.push({
                key: `answer_${index}`,
                label: `Answer ${index + 1}`,
                value: qa.acceptedAnswer.text,
                editable: true,
                fieldType: 'textarea',
                description: `FAQ answer for question #${index + 1}`
              })
            }
          })
        }
        
        if (schemaData.publisher?.name) {
          allFields.push({
            key: 'publisherName',
            label: 'Publisher Name',
            value: schemaData.publisher.name,
            editable: true,
            fieldType: 'text',
            description: 'Organization publishing the FAQ'
          })
        }
        
        if (schemaData.publisher?.description) {
          allFields.push({
            key: 'publisherDescription',
            label: 'Publisher Description',
            value: schemaData.publisher.description,
            editable: true,
            fieldType: 'textarea',
            description: 'Description of the publishing organization'
          })
        }
        
        return allFields
      }
      
      // Handle Event schema type  
      if (schemaData['@type'] === 'Event') {
        if (schemaData.name) {
          allFields.push({
            key: 'name',
            label: 'Event Name',
            value: schemaData.name,
            editable: true,
            fieldType: 'text',
            description: 'Name of the event'
          })
        }
        
        if (schemaData.description) {
          allFields.push({
            key: 'description',
            label: 'Event Description',
            value: schemaData.description,
            editable: true,
            fieldType: 'textarea',
            description: 'Detailed description of the event'
          })
        }
        
        if (schemaData.startDate) {
          allFields.push({
            key: 'startDate',
            label: 'Start Date',
            value: schemaData.startDate,
            editable: true,
            fieldType: 'date',
            description: 'Event start date'
          })
        }
        
        if (schemaData.endDate) {
          allFields.push({
            key: 'endDate',
            label: 'End Date',
            value: schemaData.endDate,
            editable: true,
            fieldType: 'date',
            description: 'Event end date'
          })
        }
        
        // Location details
        if (schemaData.location?.name) {
          allFields.push({
            key: 'locationName',
            label: 'Location Name',
            value: schemaData.location.name,
            editable: true,
            fieldType: 'text',
            description: 'Name of the event venue'
          })
        }
        
        if (schemaData.location?.address?.streetAddress) {
          allFields.push({
            key: 'locationAddress',
            label: 'Street Address',
            value: schemaData.location.address.streetAddress,
            editable: true,
            fieldType: 'text',
            description: 'Venue street address'
          })
        }
        
        if (schemaData.location?.address?.addressLocality) {
          allFields.push({
            key: 'locationCity',
            label: 'City',
            value: schemaData.location.address.addressLocality,
            editable: true,
            fieldType: 'text',
            description: 'Venue city'
          })
        }
        
        // Organizer details
        if (schemaData.organizer?.name) {
          allFields.push({
            key: 'organizerName',
            label: 'Organizer Name',
            value: schemaData.organizer.name,
            editable: true,
            fieldType: 'text',
            description: 'Organization hosting the event'
          })
        }
        
        if (schemaData.organizer?.url) {
          allFields.push({
            key: 'organizerUrl',
            label: 'Organizer Website',
            value: schemaData.organizer.url,
            editable: true,
            fieldType: 'url',
            description: 'Organizer website URL'
          })
        }
        
        // Offers details
        if (schemaData.offers?.price) {
          allFields.push({
            key: 'offerPrice',
            label: 'Ticket Price',
            value: schemaData.offers.price,
            editable: true,
            fieldType: 'text',
            description: 'Event ticket price'
          })
        }
        
        if (schemaData.offers?.description) {
          allFields.push({
            key: 'offerDescription',
            label: 'Offer Description',
            value: schemaData.offers.description,
            editable: true,
            fieldType: 'textarea',
            description: 'Description of what\'s included'
          })
        }
        
        // Agenda items
        if (schemaData.agenda && Array.isArray(schemaData.agenda)) {
          schemaData.agenda.forEach((item, index) => {
            if (item.name) {
              allFields.push({
                key: `agenda_${index}`,
                label: `Agenda Item ${index + 1}`,
                value: item.name,
                editable: true,
                fieldType: 'text',
                description: `Agenda item #${index + 1}`
              })
            }
          })
        }
        
        // Speakers
        if (schemaData.speakers && Array.isArray(schemaData.speakers)) {
          schemaData.speakers.forEach((speaker, index) => {
            if (speaker.name) {
              allFields.push({
                key: `speaker_${index}`,
                label: `Speaker ${index + 1}`,
                value: `${speaker.name}${speaker.worksFor?.name ? ` (${speaker.worksFor.name})` : ''}`,
                editable: true,
                fieldType: 'text',
                description: `Speaker #${index + 1} name and organization`
              })
            }
          })
        }
        
        return allFields
      }
      
      // Handle Organization schema type
      if (schemaData['@type'] === 'Organization') {
        if (schemaData.name) {
          allFields.push({
            key: 'name',
            label: 'Organization Name',
            value: schemaData.name,
            editable: true,
            fieldType: 'text',
            description: 'Official organization name'
          })
        }
        
        if (schemaData.alternateName) {
          allFields.push({
            key: 'alternateName',
            label: 'Alternate Name',
            value: schemaData.alternateName,
            editable: true,
            fieldType: 'text',
            description: 'Commonly known as or trading name'
          })
        }
        
        if (schemaData.url) {
          allFields.push({
            key: 'url',
            label: 'Website URL',
            value: schemaData.url,
            editable: true,
            fieldType: 'url',
            description: 'Official organization website'
          })
        }
        
        if (schemaData.logo) {
          // Handle logo as both simple URL and ImageObject
          const logoUrl = schemaData.logo.url || schemaData.logo
          allFields.push({
            key: 'logoUrl',
            label: 'Logo URL',
            value: logoUrl,
            editable: true,
            fieldType: 'url',
            description: 'Organization logo image URL'
          })
          
          // Add logo dimensions if available
          if (schemaData.logo.width) {
            allFields.push({
              key: 'logoWidth',
              label: 'Logo Width',
              value: schemaData.logo.width,
              editable: true,
              fieldType: 'text',
              description: 'Logo image width in pixels'
            })
          }
          
          if (schemaData.logo.height) {
            allFields.push({
              key: 'logoHeight',
              label: 'Logo Height',
              value: schemaData.logo.height,
              editable: true,
              fieldType: 'text',
              description: 'Logo image height in pixels'
            })
          }
        }
        
        if (schemaData.description) {
          allFields.push({
            key: 'description',
            label: 'Description',
            value: schemaData.description,
            editable: true,
            fieldType: 'textarea',
            description: 'Organization description and services'
          })
        }
        
        if (schemaData.slogan) {
          allFields.push({
            key: 'slogan',
            label: 'Slogan',
            value: schemaData.slogan,
            editable: true,
            fieldType: 'text',
            description: 'Organization slogan or tagline'
          })
        }
        
        if (schemaData.foundingDate) {
          allFields.push({
            key: 'foundingDate',
            label: 'Founding Date',
            value: schemaData.foundingDate,
            editable: true,
            fieldType: 'text',
            description: 'Year or date organization was founded'
          })
        }
        
        // Handle numberOfEmployees as both string and QuantitativeValue object
        if (schemaData.numberOfEmployees) {
          const employeeValue = schemaData.numberOfEmployees.value || schemaData.numberOfEmployees
          allFields.push({
            key: 'numberOfEmployees',
            label: 'Number of Employees',
            value: employeeValue,
            editable: true,
            fieldType: 'text',
            description: 'Employee count or range'
          })
          
          if (schemaData.numberOfEmployees.unitText) {
            allFields.push({
              key: 'employeeUnit',
              label: 'Employee Unit',
              value: schemaData.numberOfEmployees.unitText,
              editable: true,
              fieldType: 'text',
              description: 'Unit of measurement for employee count'
            })
          }
        }
        
        // Address details
        if (schemaData.address?.streetAddress) {
          allFields.push({
            key: 'addressStreet',
            label: 'Street Address',
            value: schemaData.address.streetAddress,
            editable: true,
            fieldType: 'text',
            description: 'Street address or business park'
          })
        }
        
        if (schemaData.address?.addressLocality) {
          allFields.push({
            key: 'addressCity',
            label: 'City/Locality',
            value: schemaData.address.addressLocality,
            editable: true,
            fieldType: 'text',
            description: 'City, town, or locality'
          })
        }
        
        if (schemaData.address?.postalCode) {
          allFields.push({
            key: 'addressPostalCode',
            label: 'Postal Code',
            value: schemaData.address.postalCode,
            editable: true,
            fieldType: 'text',
            description: 'ZIP or postal code'
          })
        }
        
        if (schemaData.address?.addressCountry) {
          allFields.push({
            key: 'addressCountry',
            label: 'Country',
            value: schemaData.address.addressCountry,
            editable: true,
            fieldType: 'text',
            description: 'Country code or name'
          })
        }
        
        if (schemaData.address?.addressRegion) {
          allFields.push({
            key: 'addressRegion',
            label: 'Region/State',
            value: schemaData.address.addressRegion,
            editable: true,
            fieldType: 'text',
            description: 'State, province, or region'
          })
        }
        
        // Parent organization
        if (schemaData.parentOrganization?.name) {
          allFields.push({
            key: 'parentOrgName',
            label: 'Parent Organization',
            value: schemaData.parentOrganization.name,
            editable: true,
            fieldType: 'text',
            description: 'Parent company or organization name'
          })
        }
        
        if (schemaData.parentOrganization?.url) {
          allFields.push({
            key: 'parentOrgUrl',
            label: 'Parent Organization URL',
            value: schemaData.parentOrganization.url,
            editable: true,
            fieldType: 'url',
            description: 'Parent organization website'
          })
        }
        
        // Contact points
        if (schemaData.contactPoint && Array.isArray(schemaData.contactPoint)) {
          schemaData.contactPoint.forEach((contact, index) => {
            if (contact.telephone) {
              allFields.push({
                key: `contact_${index}_phone`,
                label: `${contact.contactType || 'Contact'} Phone`,
                value: contact.telephone,
                editable: true,
                fieldType: 'tel',
                description: `${contact.contactType || 'Contact'} telephone number`
              })
            }
            
            if (contact.email) {
              allFields.push({
                key: `contact_${index}_email`,
                label: `${contact.contactType || 'Contact'} Email`,
                value: contact.email,
                editable: true,
                fieldType: 'email',
                description: `${contact.contactType || 'Contact'} email address`
              })
            }
            
            if (contact.hoursAvailable?.opens && contact.hoursAvailable?.closes) {
              allFields.push({
                key: `contact_${index}_hours`,
                label: `${contact.contactType || 'Contact'} Hours`,
                value: `${contact.hoursAvailable.opens} - ${contact.hoursAvailable.closes}`,
                editable: true,
                fieldType: 'text',
                description: `${contact.contactType || 'Contact'} operating hours`
              })
            }
          })
        }
        
        // Social media links
        if (schemaData.sameAs && Array.isArray(schemaData.sameAs)) {
          schemaData.sameAs.forEach((socialUrl, index) => {
            // Extract platform name from URL
            let platformName = 'Social Media'
            if (socialUrl.includes('linkedin')) platformName = 'LinkedIn'
            else if (socialUrl.includes('twitter')) platformName = 'Twitter'
            else if (socialUrl.includes('youtube')) platformName = 'YouTube'
            else if (socialUrl.includes('facebook')) platformName = 'Facebook'
            
            allFields.push({
              key: `social_${index}`,
              label: `${platformName} Profile`,
              value: socialUrl,
              editable: true,
              fieldType: 'url',
              description: `${platformName} profile URL`
            })
          })
        }
        
        // Area served (countries/regions)
        if (schemaData.areaServed && Array.isArray(schemaData.areaServed)) {
          schemaData.areaServed.forEach((area, index) => {
            const areaName = area.name || area
            allFields.push({
              key: `areaServed_${index}`,
              label: `Area Served ${index + 1}`,
              value: areaName,
              editable: true,
              fieldType: 'text',
              description: `Geographic area #${index + 1} served`
            })
          })
        }
        
        // Departments
        if (schemaData.department && Array.isArray(schemaData.department)) {
          schemaData.department.forEach((dept, index) => {
            if (dept.name) {
              allFields.push({
                key: `department_${index}_name`,
                label: `Department ${index + 1} Name`,
                value: dept.name,
                editable: true,
                fieldType: 'text',
                description: `Department #${index + 1} name`
              })
            }
            
            if (dept.contactPoint?.telephone) {
              allFields.push({
                key: `department_${index}_phone`,
                label: `Department ${index + 1} Phone`,
                value: dept.contactPoint.telephone,
                editable: true,
                fieldType: 'tel',
                description: `Department #${index + 1} phone number`
              })
            }
            
            if (dept.contactPoint?.email) {
              allFields.push({
                key: `department_${index}_email`,
                label: `Department ${index + 1} Email`,
                value: dept.contactPoint.email,
                editable: true,
                fieldType: 'email',
                description: `Department #${index + 1} email address`
              })
            }
          })
        }
        
        // Expertise areas
        if (schemaData.knowsAbout && Array.isArray(schemaData.knowsAbout)) {
          allFields.push({
            key: 'knowsAbout',
            label: 'Expertise Areas',
            value: schemaData.knowsAbout.join(', '),
            editable: true,
            fieldType: 'textarea',
            description: 'Areas of expertise and knowledge (comma-separated)'
          })
        }
        
        // Partnerships/memberships
        if (schemaData.memberOf && Array.isArray(schemaData.memberOf)) {
          schemaData.memberOf.forEach((partnership, index) => {
            if (partnership.name) {
              allFields.push({
                key: `memberOf_${index}_name`,
                label: `Partnership ${index + 1}`,
                value: partnership.name,
                editable: true,
                fieldType: 'text',
                description: `Partnership/membership #${index + 1} name`
              })
            }
            
            if (partnership.url) {
              allFields.push({
                key: `memberOf_${index}_url`,
                label: `Partnership ${index + 1} URL`,
                value: partnership.url,
                editable: true,
                fieldType: 'url',
                description: `Partnership/membership #${index + 1} website`
              })
            }
          })
        }
        
        // Awards
        if (schemaData.award && Array.isArray(schemaData.award)) {
          schemaData.award.forEach((award, index) => {
            allFields.push({
              key: `award_${index}`,
              label: `Award ${index + 1}`,
              value: award,
              editable: true,
              fieldType: 'text',
              description: `Award/recognition #${index + 1}`
            })
          })
        }
        
        // Aggregate rating
        if (schemaData.aggregateRating) {
          if (schemaData.aggregateRating.ratingValue) {
            allFields.push({
              key: 'ratingValue',
              label: 'Rating Value',
              value: schemaData.aggregateRating.ratingValue,
              editable: true,
              fieldType: 'text',
              description: 'Average rating value'
            })
          }
          
          if (schemaData.aggregateRating.bestRating) {
            allFields.push({
              key: 'bestRating',
              label: 'Best Rating',
              value: schemaData.aggregateRating.bestRating,
              editable: true,
              fieldType: 'text',
              description: 'Maximum possible rating'
            })
          }
          
          if (schemaData.aggregateRating.ratingCount) {
            allFields.push({
              key: 'ratingCount',
              label: 'Rating Count',
              value: schemaData.aggregateRating.ratingCount,
              editable: true,
              fieldType: 'text',
              description: 'Number of ratings/reviews'
            })
          }
          
          if (schemaData.aggregateRating.description) {
            allFields.push({
              key: 'ratingDescription',
              label: 'Rating Description',
              value: schemaData.aggregateRating.description,
              editable: true,
              fieldType: 'text',
              description: 'Description of rating methodology'
            })
          }
        }
        
        // Business identifiers
        if (schemaData.taxID) {
          allFields.push({
            key: 'taxID',
            label: 'Tax ID',
            value: schemaData.taxID,
            editable: true,
            fieldType: 'text',
            description: 'Tax identification number'
          })
        }
        
        if (schemaData.vatID) {
          allFields.push({
            key: 'vatID',
            label: 'VAT ID',
            value: schemaData.vatID,
            editable: true,
            fieldType: 'text',
            description: 'VAT identification number'
          })
        }
        
        return allFields
      }
      
      // Handle other schema types (Service, Product, etc.) - existing code
      if (schemaData.name) {
        allFields.push({
          key: 'name',
          label: 'Name',
          value: schemaData.name,
          editable: true,
          fieldType: 'text',
          description: 'Service/Product name'
        })
      }
      
      if (schemaData.description) {
        allFields.push({
          key: 'description', 
          label: 'Description',
          value: schemaData.description,
          editable: true,
          fieldType: 'textarea',
          description: 'Service/Product description'
        })
      }
      
      if (schemaData.serviceType) {
        allFields.push({
          key: 'serviceType',
          label: 'Service Type', 
          value: schemaData.serviceType,
          editable: true,
          fieldType: 'text',
          description: 'Type of service offered'
        })
      }
      
      if (schemaData.areaServed) {
        const areaValue = Array.isArray(schemaData.areaServed) ? 
          schemaData.areaServed.join(', ') : 
          (schemaData.areaServed.name || schemaData.areaServed)
        allFields.push({
          key: 'areaServed',
          label: 'Area Served',
          value: areaValue,
          editable: true,
          fieldType: 'array',
          description: 'Geographic areas served'
        })
      }
      
      if (schemaData.offers?.description) {
        allFields.push({
          key: 'offersDescription',
          label: 'Offers Description',
          value: schemaData.offers.description,
          editable: true,
          fieldType: 'textarea',
          description: 'Description of service offerings'
        })
      }
      
      if (schemaData.image) {
        allFields.push({
          key: 'image',
          label: 'Image',
          value: schemaData.image,
          editable: true,
          fieldType: 'url',
          description: 'Service/Product image URL'
        })
      }
      
      if (schemaData.provider?.name) {
        allFields.push({
          key: 'providerName',
          label: 'Provider Name',
          value: schemaData.provider.name,
          editable: true,
          fieldType: 'text',
          description: 'Service provider organization name'
        })
      }
      
      return allFields
    }
    
    return []
  }

  return (
    <div className={`card mb-4 ${schema.schema_priority === 'primary' ? 'border-l-4 border-l-hubspot-orange' : ''}`}>
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h4 className="text-lg font-semibold text-hubspot-dark">
              {formatSchemaType(schema.schema_type)}
            </h4>
            <span className={`badge ${
              schema.schema_priority === 'primary' 
                ? 'bg-hubspot-orange text-white' 
                : 'badge-info'
            }`}>
              {schema.schema_priority}
            </span>
          </div>
          
          <span className={`badge ${getStatusColor(schema.approval_status)}`}>
            <span className="mr-1">{getStatusIcon(schema.approval_status)}</span>
            {schema.approval_status.replace('_', ' ')}
          </span>
        </div>

        {/* Preview Fields - Show more without truncation */}
        <div className="space-y-3 mb-4">
          {getPreviewFields().map(({ key, label, value, editable }) => (
            <div key={key} className="flex items-start space-x-3 text-sm">
              <span className="font-medium text-hubspot-gray min-w-0 flex-shrink-0 w-32">
                {label}:
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-hubspot-dark break-words">
                  {value || 'Not set'}
                </span>
                {editable && (
                  <span className="ml-2 text-green-600 text-xs">✓ Editable</span>
                )}
              </div>
            </div>
          ))}
          
          {schema.editable_fields && Object.keys(schema.editable_fields).length > 6 && (
            <div className="text-sm text-hubspot-gray italic">
              + {Object.keys(schema.editable_fields).length - 6} more fields...
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-hubspot-gray mb-4 pt-3 border-t border-gray-100">
          <span>Version {schema.version || 1}</span>
          <span>Updated {new Date(schema.updated_at).toLocaleDateString()}</span>
        </div>

        {/* Feedback */}
        {schema.feedback && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Feedback:</span> {schema.feedback}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-hubspot-orange hover:text-orange-600 font-medium transition-colors"
          >
            {isExpanded ? 'Hide Details' : 'View All Fields'}
          </button>
          
          <div className="flex items-center space-x-2">
            {schema.approval_status === 'pending' && (
              <>
                <button
                  onClick={() => onReject(schema)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => onApprove(schema)}
                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                >
                  Quick Approve
                </button>
              </>
            )}
            <button
              onClick={() => onEdit(schema)}
              className="btn-primary text-xs px-4 py-2"
            >
              {schema.approval_status === 'pending' ? 'Review & Edit' : 'View & Edit'}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-6">
            {/* All Fields */}
            <div>
              <h5 className="text-sm font-medium text-hubspot-dark mb-3">All Editable Fields</h5>
              <div className="space-y-3">
                {getAllFields().map(({ key, label, value, editable, fieldType, description }) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-hubspot-dark text-sm">{label}</span>
                      <div className="flex items-center space-x-2">
                        {fieldType && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {fieldType}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          editable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {editable ? 'Editable' : 'Read Only'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-hubspot-dark break-words">
                      {value || <span className="text-hubspot-gray italic">Not set</span>}
                    </div>
                    {description && (
                      <div className="text-xs text-hubspot-gray mt-1">{description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* JSON Schema */}
            <div>
              <h5 className="text-sm font-medium text-hubspot-dark mb-2">Schema JSON-LD</h5>
              <div className="json-preview max-h-64">
                <pre>{JSON.stringify(schema.schema_data, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

