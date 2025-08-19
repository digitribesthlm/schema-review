// Service schema handler
export const handleServiceFields = (schemaData) => {
  const fields = {}
  
  if (schemaData.name) {
    fields.name = {
      value: schemaData.name,
      field_type: 'text',
      editable: true,
      description: 'Service name'
    }
  }
  
  if (schemaData.description) {
    fields.description = {
      value: schemaData.description,
      field_type: 'textarea',
      editable: true,
      description: 'Service description'
    }
  }

  // Handle provider information
  if (schemaData.provider) {
    if (schemaData.provider.name) {
      fields.providerName = {
        value: schemaData.provider.name,
        field_type: 'text',
        editable: true,
        description: 'Provider/company name'
      }
    }
    
    if (schemaData.provider.url) {
      fields.providerUrl = {
        value: schemaData.provider.url,
        field_type: 'url',
        editable: true,
        description: 'Provider website URL'
      }
    }
    
    if (schemaData.provider.logo) {
      fields.providerLogo = {
        value: schemaData.provider.logo,
        field_type: 'url',
        editable: true,
        description: 'Provider logo URL'
      }
    }
  }

  // Handle contact points
  if (schemaData.provider?.contactPoint && Array.isArray(schemaData.provider.contactPoint)) {
    schemaData.provider.contactPoint.forEach((contact, index) => {
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
    })
  }

  // Handle offers/service offerings
  if (schemaData.offers) {
    if (schemaData.offers.description) {
      fields.offersDescription = {
        value: schemaData.offers.description,
        field_type: 'textarea',
        editable: true,
        description: 'Service offering description'
      }
    }
  }

  // Handle area served
  if (schemaData.areaServed) {
    fields.areaServed = {
      value: Array.isArray(schemaData.areaServed) 
        ? schemaData.areaServed.join(', ') 
        : schemaData.areaServed,
      field_type: 'text',
      editable: true,
      description: 'Areas served (separate multiple with commas)'
    }
  }

  // Handle service categories/types
  if (schemaData.serviceType) {
    fields.serviceType = {
      value: Array.isArray(schemaData.serviceType) 
        ? schemaData.serviceType.join(', ') 
        : schemaData.serviceType,
      field_type: 'text',
      editable: true,
      description: 'Service types (separate multiple with commas)'
    }
  }

  // Handle image
  if (schemaData.image) {
    fields.image = {
      value: schemaData.image,
      field_type: 'url',
      editable: true,
      description: 'Service image URL'
    }
  }

  // Handle URL
  if (schemaData.url) {
    fields.url = {
      value: schemaData.url,
      field_type: 'url',
      editable: true,
      description: 'Service page URL'
    }
  }

  return fields
}

export const getServiceInitialFields = (schemaData) => {
  const initialFields = {}
  
  if (schemaData.name) initialFields.name = schemaData.name
  if (schemaData.description) initialFields.description = schemaData.description
  if (schemaData.provider?.name) initialFields.providerName = schemaData.provider.name
  if (schemaData.provider?.url) initialFields.providerUrl = schemaData.provider.url
  if (schemaData.provider?.logo) initialFields.providerLogo = schemaData.provider.logo
  if (schemaData.offers?.description) initialFields.offersDescription = schemaData.offers.description
  if (schemaData.areaServed) {
    initialFields.areaServed = Array.isArray(schemaData.areaServed) 
      ? schemaData.areaServed.join(', ') 
      : schemaData.areaServed
  }
  if (schemaData.serviceType) {
    initialFields.serviceType = Array.isArray(schemaData.serviceType) 
      ? schemaData.serviceType.join(', ') 
      : schemaData.serviceType
  }
  if (schemaData.image) initialFields.image = schemaData.image
  if (schemaData.url) initialFields.url = schemaData.url

  // Handle contact points
  if (schemaData.provider?.contactPoint && Array.isArray(schemaData.provider.contactPoint)) {
    schemaData.provider.contactPoint.forEach((contact, index) => {
      if (contact.telephone) initialFields[`contactPhone_${index}`] = contact.telephone
      if (contact.email) initialFields[`contactEmail_${index}`] = contact.email
    })
  }
  
  return initialFields
}
