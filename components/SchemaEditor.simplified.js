import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import FieldRenderer from './FieldRenderer'
import { getSchemaHandler, generateAdditionalFields, normalizeField } from './schema-handlers'

export default function SchemaEditor({ schema, onSave, onClose }) {
  const [editedFields, setEditedFields] = useState({})
  const [feedback, setFeedback] = useState(schema.feedback || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Initialize edited fields with current values
    const initialFields = {}
    
    // Create fields from existing editable_fields or schema_data
    if (schema.editable_fields) {
      Object.entries(schema.editable_fields).forEach(([key, field]) => {
        initialFields[key] = typeof field === 'object' && field !== null ? field.value : field
      })
    } else if (schema.schema_data) {
      const schemaType = schema.schema_data['@type']
      const handler = getSchemaHandler(schemaType)
      const handlerFields = handler.getInitialFields(schema.schema_data)
      Object.assign(initialFields, handlerFields)
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
      const schemaType = schema.schema_data['@type']
      const handler = getSchemaHandler(schemaType)
      const handlerFields = handler.getFields(schema.schema_data, schema)
      Object.assign(allFields, handlerFields)
      
      // Add additional fields that don't fit the main schema types
      const additionalFields = generateAdditionalFields(schema.schema_data, schema)
      Object.assign(allFields, additionalFields)
    }
    
    // Normalize all fields to ensure they have the proper structure
    Object.keys(allFields).forEach(fieldName => {
      allFields[fieldName] = normalizeField(fieldName, allFields[fieldName])
    })
    
    return allFields
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
                    <FieldRenderer
                      fieldName={fieldName}
                      fieldConfig={fieldConfig}
                      value={editedFields[fieldName] || fieldConfig.value}
                      onChange={handleFieldChange}
                    />
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
