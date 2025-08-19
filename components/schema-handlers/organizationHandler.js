// Organization schema handler
export const handleOrganizationFields = (schemaData) => {
  const fields = {}
  
  // Basic organization fields
  if (schemaData.name) {
    fields.name = {
      value: schemaData.name,
      field_type: 'text',
      editable: true,
      description: 'Organization name'
    }
  }
  
  if (schemaData.url) {
    fields.url = {
      value: schemaData.url,
      field_type: 'url',
      editable: true,
      description: 'Organization website URL'
    }
  }
  
  if (schemaData.description) {
    fields.description = {
      value: schemaData.description,
      field_type: 'textarea',
      editable: true,
      description: 'Organization description'
    }
  }

  // Address fields
  if (schemaData.address) {
    if (schemaData.address.streetAddress) {
      fields.streetAddress = {
        value: schemaData.address.streetAddress,
        field_type: 'text',
        editable: true,
        description: 'Street address'
      }
    }
    
    if (schemaData.address.addressLocality) {
      fields.addressLocality = {
        value: schemaData.address.addressLocality,
        field_type: 'text',
        editable: true,
        description: 'City/locality'
      }
    }
    
    if (schemaData.address.addressRegion) {
      fields.addressRegion = {
        value: schemaData.address.addressRegion,
        field_type: 'text',
        editable: true,
        description: 'State/region'
      }
    }
    
    if (schemaData.address.postalCode) {
      fields.postalCode = {
        value: schemaData.address.postalCode,
        field_type: 'text',
        editable: true,
        description: 'Postal code'
      }
    }
    
    if (schemaData.address.addressCountry) {
      fields.addressCountry = {
        value: schemaData.address.addressCountry,
        field_type: 'text',
        editable: true,
        description: 'Country code (e.g., GB, US)'
      }
    }
  }

  // Contact point fields
  if (schemaData.contactPoint) {
    // Handle single contact point
    if (!Array.isArray(schemaData.contactPoint)) {
      if (schemaData.contactPoint.telephone) {
        fields.telephone = {
          value: schemaData.contactPoint.telephone,
          field_type: 'tel',
          editable: true,
          description: 'Contact telephone'
        }
      }
      
      if (schemaData.contactPoint.email) {
        fields.email = {
          value: schemaData.contactPoint.email,
          field_type: 'email',
          editable: true,
          description: 'Contact email'
        }
      }
      
      if (schemaData.contactPoint.contactType) {
        fields.contactType = {
          value: schemaData.contactPoint.contactType,
          field_type: 'select',
          editable: true,
          description: 'Contact type',
          options: ['customer service', 'sales', 'support', 'billing', 'general']
        }
      }
    } else {
      // Handle multiple contact points
      schemaData.contactPoint.forEach((contact, index) => {
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
            options: ['customer service', 'sales', 'support', 'billing', 'general']
          }
        }
      })
    }
  }

  // Additional common organization fields
  if (schemaData.logo) {
    fields.logo = {
      value: schemaData.logo,
      field_type: 'url',
      editable: true,
      description: 'Organization logo URL'
    }
  }

  if (schemaData.foundingDate) {
    fields.foundingDate = {
      value: schemaData.foundingDate,
      field_type: 'date',
      editable: true,
      description: 'Founding date'
    }
  }

  if (schemaData.numberOfEmployees) {
    fields.numberOfEmployees = {
      value: schemaData.numberOfEmployees,
      field_type: 'number',
      editable: true,
      description: 'Number of employees'
    }
  }

  if (schemaData.sameAs && Array.isArray(schemaData.sameAs)) {
    fields.sameAs = {
      value: schemaData.sameAs.join(', '),
      field_type: 'textarea',
      editable: true,
      description: 'Social media profiles (one per line or comma-separated)'
    }
  }

  return fields
}

export const getOrganizationInitialFields = (schemaData) => {
  const initialFields = {}
  
  // Basic fields
  if (schemaData.name) initialFields.name = schemaData.name
  if (schemaData.url) initialFields.url = schemaData.url
  if (schemaData.description) initialFields.description = schemaData.description
  
  // Address fields
  if (schemaData.address) {
    if (schemaData.address.streetAddress) initialFields.streetAddress = schemaData.address.streetAddress
    if (schemaData.address.addressLocality) initialFields.addressLocality = schemaData.address.addressLocality
    if (schemaData.address.addressRegion) initialFields.addressRegion = schemaData.address.addressRegion
    if (schemaData.address.postalCode) initialFields.postalCode = schemaData.address.postalCode
    if (schemaData.address.addressCountry) initialFields.addressCountry = schemaData.address.addressCountry
  }
  
  // Contact fields
  if (schemaData.contactPoint) {
    if (!Array.isArray(schemaData.contactPoint)) {
      if (schemaData.contactPoint.telephone) initialFields.telephone = schemaData.contactPoint.telephone
      if (schemaData.contactPoint.email) initialFields.email = schemaData.contactPoint.email
      if (schemaData.contactPoint.contactType) initialFields.contactType = schemaData.contactPoint.contactType
    } else {
      schemaData.contactPoint.forEach((contact, index) => {
        if (contact.telephone) initialFields[`contactPhone_${index}`] = contact.telephone
        if (contact.email) initialFields[`contactEmail_${index}`] = contact.email
        if (contact.contactType) initialFields[`contactType_${index}`] = contact.contactType
      })
    }
  }
  
  // Additional fields
  if (schemaData.logo) initialFields.logo = schemaData.logo
  if (schemaData.foundingDate) initialFields.foundingDate = schemaData.foundingDate
  if (schemaData.numberOfEmployees) initialFields.numberOfEmployees = schemaData.numberOfEmployees
  if (schemaData.sameAs && Array.isArray(schemaData.sameAs)) {
    initialFields.sameAs = schemaData.sameAs.join(', ')
  }
  
  return initialFields
}
