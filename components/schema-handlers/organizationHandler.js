// Organization schema handler
export const handleOrganizationFields = (schemaData) => {
  const fields = {}
  
  // Handle @graph structure - find the Organization object and other entities
  let organizationData = schemaData
  let webPageData = null
  let personEntities = []
  
  if (schemaData['@graph'] && Array.isArray(schemaData['@graph'])) {
    organizationData = schemaData['@graph'].find(item => item['@type'] === 'Organization') || schemaData
    webPageData = schemaData['@graph'].find(item => item['@type'] === 'WebPage')
    personEntities = schemaData['@graph'].filter(item => item['@type'] === 'Person')
  }
  
  // Basic organization fields
  if (organizationData.name) {
    fields.name = {
      value: organizationData.name,
      field_type: 'text',
      editable: true,
      description: 'Organization name'
    }
  }
  
  if (organizationData.url) {
    fields.url = {
      value: organizationData.url,
      field_type: 'url',
      editable: true,
      description: 'Organization website URL'
    }
  }
  
  if (organizationData.description) {
    fields.description = {
      value: organizationData.description,
      field_type: 'textarea',
      editable: true,
      description: 'Organization description'
    }
  }

  if (organizationData.logo) {
    fields.logo = {
      value: organizationData.logo,
      field_type: 'url',
      editable: true,
      description: 'Organization logo URL'
    }
  }

  // Address fields
  if (organizationData.address) {
    if (organizationData.address.streetAddress) {
      fields.streetAddress = {
        value: organizationData.address.streetAddress,
        field_type: 'text',
        editable: true,
        description: 'Street address'
      }
    }
    
    if (organizationData.address.addressLocality) {
      fields.addressLocality = {
        value: organizationData.address.addressLocality,
        field_type: 'text',
        editable: true,
        description: 'City/locality'
      }
    }
    
    if (organizationData.address.addressRegion) {
      fields.addressRegion = {
        value: organizationData.address.addressRegion,
        field_type: 'text',
        editable: true,
        description: 'State/region'
      }
    }
    
    if (organizationData.address.postalCode) {
      fields.postalCode = {
        value: organizationData.address.postalCode,
        field_type: 'text',
        editable: true,
        description: 'Postal code'
      }
    }
    
    if (organizationData.address.addressCountry) {
      fields.addressCountry = {
        value: organizationData.address.addressCountry,
        field_type: 'text',
        editable: true,
        description: 'Country code (e.g., GB, US)'
      }
    }
  }

  // Contact point fields  
  if (organizationData.contactPoint) {
    // Handle single contact point
    if (!Array.isArray(organizationData.contactPoint)) {
      if (organizationData.contactPoint.telephone) {
        fields.telephone = {
          value: organizationData.contactPoint.telephone,
          field_type: 'tel',
          editable: true,
          description: 'Contact telephone'
        }
      }
      
      if (organizationData.contactPoint.email) {
        fields.email = {
          value: organizationData.contactPoint.email,
          field_type: 'email',
          editable: true,
          description: 'Contact email'
        }
      }
      
      if (organizationData.contactPoint.contactType) {
        fields.contactType = {
          value: organizationData.contactPoint.contactType,
          field_type: 'select',
          editable: true,
          description: 'Contact type',
          options: ['Customer Service', 'Technical Support', 'Sales', 'Billing', 'General']
        }
      }

      if (organizationData.contactPoint.areaServed) {
        fields.areaServed = {
          value: organizationData.contactPoint.areaServed,
          field_type: 'text',
          editable: true,
          description: 'Area served'
        }
      }

      if (organizationData.contactPoint.availableLanguage) {
        fields.availableLanguage = {
          value: organizationData.contactPoint.availableLanguage,
          field_type: 'text',
          editable: true,
          description: 'Available languages'
        }
      }
    } else {
      // Handle multiple contact points
      organizationData.contactPoint.forEach((contact, index) => {
        if (contact.telephone) {
          fields[`contactPhone_${index}`] = {
            value: contact.telephone,
            field_type: 'tel',
            editable: true,
            description: `Contact phone #${index + 1} (${contact.contactType || 'general'})`
          }
        }
        
        if (contact.email) {
          fields[`contactEmail_${index}`] = {
            value: contact.email,
            field_type: 'email',
            editable: true,
            description: `Contact email #${index + 1} (${contact.contactType || 'general'})`
          }
        }
        
        if (contact.contactType) {
          fields[`contactType_${index}`] = {
            value: contact.contactType,
            field_type: 'select',
            editable: true,
            description: `Contact type #${index + 1}`,
            options: ['Customer Service', 'Technical Support', 'Sales', 'Billing', 'General']
          }
        }
      })
    }
  }

  // WebPage fields (if present in @graph)
  if (webPageData) {
    if (webPageData.name) {
      fields.webPageName = {
        value: webPageData.name,
        field_type: 'text',
        editable: true,
        description: 'Webpage title'
      }
    }
    
    if (webPageData.description) {
      fields.webPageDescription = {
        value: webPageData.description,
        field_type: 'textarea',
        editable: true,
        description: 'Webpage description'
      }
    }

    if (webPageData.url) {
      fields.webPageUrl = {
        value: webPageData.url,
        field_type: 'url',
        editable: true,
        description: 'Webpage URL'
      }
    }

    if (webPageData.mainEntityOfPage) {
      fields.mainEntityOfPage = {
        value: webPageData.mainEntityOfPage,
        field_type: 'url',
        editable: true,
        description: 'Main entity of page URL'
      }
    }
  }

  // Person entities fields (team members)
  personEntities.forEach((person, index) => {
    if (person.name) {
      fields[`person_${index}_name`] = {
        value: person.name,
        field_type: 'text',
        editable: true,
        description: `Team member #${index + 1} name`
      }
    }
    
    if (person.jobTitle) {
      fields[`person_${index}_jobTitle`] = {
        value: person.jobTitle,
        field_type: 'text',
        editable: true,
        description: `${person.name || `Team member #${index + 1}`} job title`
      }
    }
    
    if (person.email) {
      fields[`person_${index}_email`] = {
        value: person.email,
        field_type: 'email',
        editable: true,
        description: `${person.name || `Team member #${index + 1}`} email`
      }
    }
    
    if (person.telephone) {
      fields[`person_${index}_telephone`] = {
        value: person.telephone,
        field_type: 'tel',
        editable: true,
        description: `${person.name || `Team member #${index + 1}`} phone`
      }
    }
    
    if (person.sameAs) {
      fields[`person_${index}_sameAs`] = {
        value: person.sameAs,
        field_type: 'url',
        editable: true,
        description: `${person.name || `Team member #${index + 1}`} LinkedIn profile`
      }
    }
  })

  // Additional organization fields
  if (organizationData.foundingDate) {
    fields.foundingDate = {
      value: organizationData.foundingDate,
      field_type: 'date',
      editable: true,
      description: 'Founding date'
    }
  }

  if (organizationData.numberOfEmployees) {
    fields.numberOfEmployees = {
      value: organizationData.numberOfEmployees,
      field_type: 'number',
      editable: true,
      description: 'Number of employees'
    }
  }

  if (organizationData.sameAs && Array.isArray(organizationData.sameAs)) {
    fields.sameAs = {
      value: organizationData.sameAs.join(', '),
      field_type: 'textarea',
      editable: true,
      description: 'Social media profiles (one per line or comma-separated)'
    }
  }

  return fields
}

export const getOrganizationInitialFields = (schemaData) => {
  const initialFields = {}
  
  // Handle @graph structure - find the Organization object and other entities
  let organizationData = schemaData
  let webPageData = null
  let personEntities = []
  
  if (schemaData['@graph'] && Array.isArray(schemaData['@graph'])) {
    organizationData = schemaData['@graph'].find(item => item['@type'] === 'Organization') || schemaData
    webPageData = schemaData['@graph'].find(item => item['@type'] === 'WebPage')
    personEntities = schemaData['@graph'].filter(item => item['@type'] === 'Person')
  }
  
  // Basic organization fields
  if (organizationData.name) initialFields.name = organizationData.name
  if (organizationData.url) initialFields.url = organizationData.url
  if (organizationData.description) initialFields.description = organizationData.description
  if (organizationData.logo) initialFields.logo = organizationData.logo
  
  // Address fields
  if (organizationData.address) {
    if (organizationData.address.streetAddress) initialFields.streetAddress = organizationData.address.streetAddress
    if (organizationData.address.addressLocality) initialFields.addressLocality = organizationData.address.addressLocality
    if (organizationData.address.addressRegion) initialFields.addressRegion = organizationData.address.addressRegion
    if (organizationData.address.postalCode) initialFields.postalCode = organizationData.address.postalCode
    if (organizationData.address.addressCountry) initialFields.addressCountry = organizationData.address.addressCountry
  }
  
  // Contact fields
  if (organizationData.contactPoint) {
    if (!Array.isArray(organizationData.contactPoint)) {
      if (organizationData.contactPoint.telephone) initialFields.telephone = organizationData.contactPoint.telephone
      if (organizationData.contactPoint.email) initialFields.email = organizationData.contactPoint.email
      if (organizationData.contactPoint.contactType) initialFields.contactType = organizationData.contactPoint.contactType
      if (organizationData.contactPoint.areaServed) initialFields.areaServed = organizationData.contactPoint.areaServed
      if (organizationData.contactPoint.availableLanguage) initialFields.availableLanguage = organizationData.contactPoint.availableLanguage
    } else {
      organizationData.contactPoint.forEach((contact, index) => {
        if (contact.telephone) initialFields[`contactPhone_${index}`] = contact.telephone
        if (contact.email) initialFields[`contactEmail_${index}`] = contact.email
        if (contact.contactType) initialFields[`contactType_${index}`] = contact.contactType
      })
    }
  }

  // WebPage fields
  if (webPageData) {
    if (webPageData.name) initialFields.webPageName = webPageData.name
    if (webPageData.description) initialFields.webPageDescription = webPageData.description
    if (webPageData.url) initialFields.webPageUrl = webPageData.url
    if (webPageData.mainEntityOfPage) initialFields.mainEntityOfPage = webPageData.mainEntityOfPage
  }

  // Person entities (team members)
  personEntities.forEach((person, index) => {
    if (person.name) initialFields[`person_${index}_name`] = person.name
    if (person.jobTitle) initialFields[`person_${index}_jobTitle`] = person.jobTitle
    if (person.email) initialFields[`person_${index}_email`] = person.email
    if (person.telephone) initialFields[`person_${index}_telephone`] = person.telephone
    if (person.sameAs) initialFields[`person_${index}_sameAs`] = person.sameAs
  })
  
  // Additional organization fields
  if (organizationData.foundingDate) initialFields.foundingDate = organizationData.foundingDate
  if (organizationData.numberOfEmployees) initialFields.numberOfEmployees = organizationData.numberOfEmployees
  if (organizationData.sameAs && Array.isArray(organizationData.sameAs)) {
    initialFields.sameAs = organizationData.sameAs.join(', ')
  }
  
  return initialFields
}
