import { handleFAQPageFields, getFAQPageInitialFields } from './faqPageHandler'
import { handleEventFields, getEventInitialFields } from './eventHandler'
import { handleServiceFields, getServiceInitialFields } from './serviceHandler'
import { handleOrganizationFields, getOrganizationInitialFields } from './organizationHandler'
import { handleProductFields, getProductInitialFields } from './productHandler'
import { handleArticleFields, getArticleInitialFields } from './articleHandler'

// Schema handler registry
const schemaHandlers = {
  FAQPage: {
    getFields: handleFAQPageFields,
    getInitialFields: getFAQPageInitialFields
  },
  Event: {
    getFields: handleEventFields,
    getInitialFields: getEventInitialFields
  },
  Service: {
    getFields: handleServiceFields,
    getInitialFields: getServiceInitialFields
  },
  Organization: {
    getFields: handleOrganizationFields,
    getInitialFields: getOrganizationInitialFields
  },
  Product: {
    getFields: handleProductFields,
    getInitialFields: getProductInitialFields
  },
  Article: {
    getFields: handleArticleFields,
    getInitialFields: getArticleInitialFields
  },
  // TODO: Add handlers for LocalBusiness
  // For now, return a default handler
  default: {
    getFields: (schemaData) => {
      const fields = {}
      
      // Common fields that most schemas have
      if (schemaData.name) {
        fields.name = {
          value: schemaData.name,
          field_type: 'text',
          editable: true,
          description: 'Name'
        }
      }
      
      if (schemaData.description) {
        fields.description = {
          value: schemaData.description,
          field_type: 'textarea',
          editable: true,
          description: 'Description'
        }
      }
      
      if (schemaData.url) {
        fields.url = {
          value: schemaData.url,
          field_type: 'url',
          editable: true,
          description: 'URL'
        }
      }
      
      return fields
    },
    getInitialFields: (schemaData) => {
      const initialFields = {}
      
      if (schemaData.name) initialFields.name = schemaData.name
      if (schemaData.description) initialFields.description = schemaData.description
      if (schemaData.url) initialFields.url = schemaData.url
      
      return initialFields
    }
  }
}

export const getSchemaHandler = (schemaType) => {
  return schemaHandlers[schemaType] || schemaHandlers.default
}

// Helper function to generate additional fields that don't fit the main schema types
export const generateAdditionalFields = (schemaData, schema) => {
  const additionalFields = {}
  
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
      description: 'URL'
    }
  }
  
  return additionalFields
}

// Utility function to normalize field values
export const normalizeField = (fieldName, field) => {
  // If field is a primitive value, convert it to a field object
  if (typeof field !== 'object' || field === null) {
    return {
      value: field,
      field_type: typeof field === 'string' && field.includes('T') && field.includes('Z') ? 'datetime' : 'text',
      editable: true,
      description: fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }
  } else {
    // Field is already an object, just ensure it's editable
    return {
      ...field,
      editable: true
    }
  }
}
