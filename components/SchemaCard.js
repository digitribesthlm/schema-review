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

