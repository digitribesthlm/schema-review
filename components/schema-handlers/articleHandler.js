// Article schema handler
export const handleArticleFields = (schemaData) => {
  const fields = {}
  
  // Handle @graph structure - find the Article object and Person entities
  let articleData = schemaData
  let personEntities = []
  
  if (schemaData['@graph'] && Array.isArray(schemaData['@graph'])) {
    articleData = schemaData['@graph'].find(item => item['@type'] === 'Article') || schemaData
    personEntities = schemaData['@graph'].filter(item => item['@type'] === 'Person')
  }
  
  // Basic article fields
  if (articleData.headline) {
    fields.headline = {
      value: articleData.headline,
      field_type: 'text',
      editable: true,
      description: 'Article headline/title'
    }
  }
  
  if (articleData.description) {
    fields.description = {
      value: articleData.description,
      field_type: 'textarea',
      editable: true,
      description: 'Article description'
    }
  }

  if (articleData.keywords) {
    fields.keywords = {
      value: articleData.keywords,
      field_type: 'textarea',
      editable: true,
      description: 'Article keywords (comma-separated)'
    }
  }

  if (articleData.datePublished) {
    fields.datePublished = {
      value: articleData.datePublished,
      field_type: 'date',
      editable: true,
      description: 'Publication date'
    }
  }

  if (articleData.mainEntityOfPage) {
    fields.mainEntityOfPage = {
      value: articleData.mainEntityOfPage,
      field_type: 'url',
      editable: true,
      description: 'Article URL'
    }
  }

  // Author fields
  if (articleData.author) {
    if (articleData.author.name) {
      fields.authorName = {
        value: articleData.author.name,
        field_type: 'text',
        editable: true,
        description: 'Author name'
      }
    }
    
    if (articleData.author.jobTitle) {
      fields.authorJobTitle = {
        value: articleData.author.jobTitle,
        field_type: 'text',
        editable: true,
        description: 'Author job title'
      }
    }
    
    if (articleData.author.sameAs) {
      fields.authorSameAs = {
        value: articleData.author.sameAs,
        field_type: 'url',
        editable: true,
        description: 'Author social profile URL'
      }
    }
    
    if (articleData.author.image) {
      fields.authorImage = {
        value: articleData.author.image,
        field_type: 'url',
        editable: true,
        description: 'Author image URL'
      }
    }
  }

  // Person entities fields (from @graph structure)
  personEntities.forEach((person, index) => {
    if (person.name) {
      fields[`person_${index}_name`] = {
        value: person.name,
        field_type: 'text',
        editable: true,
        description: `Person #${index + 1} name`
      }
    }
    
    if (person.jobTitle) {
      fields[`person_${index}_jobTitle`] = {
        value: person.jobTitle,
        field_type: 'text',
        editable: true,
        description: `${person.name || `Person #${index + 1}`} job title`
      }
    }
    
    if (person.email) {
      fields[`person_${index}_email`] = {
        value: person.email,
        field_type: 'email',
        editable: true,
        description: `${person.name || `Person #${index + 1}`} email`
      }
    }
    
    if (person.telephone) {
      fields[`person_${index}_telephone`] = {
        value: person.telephone,
        field_type: 'tel',
        editable: true,
        description: `${person.name || `Person #${index + 1}`} phone`
      }
    }
    
    if (person.sameAs) {
      fields[`person_${index}_sameAs`] = {
        value: person.sameAs,
        field_type: 'url',
        editable: true,
        description: `${person.name || `Person #${index + 1}`} LinkedIn profile`
      }
    }
  })

  // Publisher fields
  if (articleData.publisher) {
    if (articleData.publisher.name) {
      fields.publisherName = {
        value: articleData.publisher.name,
        field_type: 'text',
        editable: true,
        description: 'Publisher/organization name'
      }
    }
    
    if (articleData.publisher.logo && articleData.publisher.logo.url) {
      fields.publisherLogoUrl = {
        value: articleData.publisher.logo.url,
        field_type: 'url',
        editable: true,
        description: 'Publisher logo URL'
      }
    }
    
    // Publisher contact point
    if (articleData.publisher.contactPoint) {
      if (articleData.publisher.contactPoint.telephone) {
        fields.publisherTelephone = {
          value: articleData.publisher.contactPoint.telephone,
          field_type: 'tel',
          editable: true,
          description: 'Publisher contact phone'
        }
      }
      
      if (articleData.publisher.contactPoint.contactType) {
        fields.publisherContactType = {
          value: articleData.publisher.contactPoint.contactType,
          field_type: 'select',
          editable: true,
          description: 'Publisher contact type',
          options: ['Customer Service', 'Sales', 'Support', 'General Inquiry']
        }
      }
      
      if (articleData.publisher.contactPoint.areaServed) {
        fields.publisherAreaServed = {
          value: articleData.publisher.contactPoint.areaServed,
          field_type: 'text',
          editable: true,
          description: 'Area served by publisher'
        }
      }
    }
    
    // Publisher address
    if (articleData.publisher.address) {
      if (articleData.publisher.address.streetAddress) {
        fields.publisherStreetAddress = {
          value: articleData.publisher.address.streetAddress,
          field_type: 'text',
          editable: true,
          description: 'Publisher street address'
        }
      }
      
      if (articleData.publisher.address.addressLocality) {
        fields.publisherAddressLocality = {
          value: articleData.publisher.address.addressLocality,
          field_type: 'text',
          editable: true,
          description: 'Publisher city/locality'
        }
      }
      
      if (articleData.publisher.address.addressRegion) {
        fields.publisherAddressRegion = {
          value: articleData.publisher.address.addressRegion,
          field_type: 'text',
          editable: true,
          description: 'Publisher state/region'
        }
      }
      
      if (articleData.publisher.address.postalCode) {
        fields.publisherPostalCode = {
          value: articleData.publisher.address.postalCode,
          field_type: 'text',
          editable: true,
          description: 'Publisher postal code'
        }
      }
      
      if (articleData.publisher.address.addressCountry) {
        fields.publisherAddressCountry = {
          value: articleData.publisher.address.addressCountry,
          field_type: 'text',
          editable: true,
          description: 'Publisher country'
        }
      }
    }
  }

  return fields
}

export const getArticleInitialFields = (schemaData) => {
  const initialFields = {}
  
  // Handle @graph structure - find the Article object and Person entities
  let articleData = schemaData
  let personEntities = []
  
  if (schemaData['@graph'] && Array.isArray(schemaData['@graph'])) {
    articleData = schemaData['@graph'].find(item => item['@type'] === 'Article') || schemaData
    personEntities = schemaData['@graph'].filter(item => item['@type'] === 'Person')
  }
  
  // Basic fields
  if (articleData.headline) initialFields.headline = articleData.headline
  if (articleData.description) initialFields.description = articleData.description
  if (articleData.keywords) initialFields.keywords = articleData.keywords
  if (articleData.datePublished) initialFields.datePublished = articleData.datePublished
  if (articleData.mainEntityOfPage) initialFields.mainEntityOfPage = articleData.mainEntityOfPage
  
  // Author fields
  if (articleData.author) {
    if (articleData.author.name) initialFields.authorName = articleData.author.name
    if (articleData.author.jobTitle) initialFields.authorJobTitle = articleData.author.jobTitle
    if (articleData.author.sameAs) initialFields.authorSameAs = articleData.author.sameAs
    if (articleData.author.image) initialFields.authorImage = articleData.author.image
  }
  
  // Publisher fields
  if (articleData.publisher) {
    if (articleData.publisher.name) initialFields.publisherName = articleData.publisher.name
    if (articleData.publisher.logo?.url) initialFields.publisherLogoUrl = articleData.publisher.logo.url
    
    if (articleData.publisher.contactPoint) {
      if (articleData.publisher.contactPoint.telephone) initialFields.publisherTelephone = articleData.publisher.contactPoint.telephone
      if (articleData.publisher.contactPoint.contactType) initialFields.publisherContactType = articleData.publisher.contactPoint.contactType
      if (articleData.publisher.contactPoint.areaServed) initialFields.publisherAreaServed = articleData.publisher.contactPoint.areaServed
    }
    
    if (articleData.publisher.address) {
      if (articleData.publisher.address.streetAddress) initialFields.publisherStreetAddress = articleData.publisher.address.streetAddress
      if (articleData.publisher.address.addressLocality) initialFields.publisherAddressLocality = articleData.publisher.address.addressLocality
      if (articleData.publisher.address.addressRegion) initialFields.publisherAddressRegion = articleData.publisher.address.addressRegion
      if (articleData.publisher.address.postalCode) initialFields.publisherPostalCode = articleData.publisher.address.postalCode
      if (articleData.publisher.address.addressCountry) initialFields.publisherAddressCountry = articleData.publisher.address.addressCountry
    }
  }
  
  // Person entities (from @graph structure)
  personEntities.forEach((person, index) => {
    if (person.name) initialFields[`person_${index}_name`] = person.name
    if (person.jobTitle) initialFields[`person_${index}_jobTitle`] = person.jobTitle
    if (person.email) initialFields[`person_${index}_email`] = person.email
    if (person.telephone) initialFields[`person_${index}_telephone`] = person.telephone
    if (person.sameAs) initialFields[`person_${index}_sameAs`] = person.sameAs
  })
  
  return initialFields
}
