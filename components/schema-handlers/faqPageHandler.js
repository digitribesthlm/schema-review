// FAQ Page schema handler
export const handleFAQPageFields = (schemaData, schema) => {
  const fields = {}
  
  if (schemaData.url) {
    fields.url = {
      value: schemaData.url,
      field_type: 'url',
      editable: true,
      description: 'FAQ page URL'
    }
  }
  
  if (schemaData.mainEntity && Array.isArray(schemaData.mainEntity)) {
    schemaData.mainEntity.forEach((qa, index) => {
      if (qa.name) {
        fields[`question_${index}`] = {
          value: qa.name,
          field_type: 'text',
          editable: true,
          description: `FAQ question #${index + 1}`
        }
      }
      
      if (qa.acceptedAnswer?.text) {
        fields[`answer_${index}`] = {
          value: qa.acceptedAnswer.text,
          field_type: 'textarea',
          editable: true,
          description: `FAQ answer for question #${index + 1}`
        }
      }
    })
  }
  
  if (schemaData.publisher?.name) {
    fields.publisherName = {
      value: schemaData.publisher.name,
      field_type: 'text',
      editable: true,
      description: 'Organization publishing the FAQ'
    }
  }
  
  if (schemaData.publisher?.description) {
    fields.publisherDescription = {
      value: schemaData.publisher.description,
      field_type: 'textarea',
      editable: true,
      description: 'Description of the publishing organization'
    }
  }
  
  if (schemaData.publisher?.url) {
    fields.publisherUrl = {
      value: schemaData.publisher.url,
      field_type: 'url',
      editable: true,
      description: 'Publisher website URL'
    }
  }
  
  // Handle service and product arrays that might be nested in FAQPage
  if (schemaData.service && Array.isArray(schemaData.service)) {
    schemaData.service.forEach((service, index) => {
      if (service.name && !schema.editable_fields?.[`serviceName_${index}`]) {
        fields[`serviceName_${index}`] = {
          value: service.name,
          field_type: 'text',
          editable: true,
          description: `Service ${index + 1} name`
        }
      }
      if (service.description && !schema.editable_fields?.[`serviceDescription_${index}`]) {
        fields[`serviceDescription_${index}`] = {
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
        fields[`productName_${index}`] = {
          value: product.name,
          field_type: 'text',
          editable: true,
          description: `Product ${index + 1} name`
        }
      }
      if (product.description && !schema.editable_fields?.[`productDescription_${index}`]) {
        fields[`productDescription_${index}`] = {
          value: product.description,
          field_type: 'textarea',
          editable: true,
          description: `Product ${index + 1} description`
        }
      }
    })
  }
  
  return fields
}

export const getFAQPageInitialFields = (schemaData) => {
  const initialFields = {}
  
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
  
  return initialFields
}
