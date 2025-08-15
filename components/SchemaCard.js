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
    if (!schema.editable_fields) return []
    // Show more fields in preview - up to 6 instead of 3
    const fields = Object.entries(schema.editable_fields).slice(0, 6)
    return fields.map(([key, field]) => ({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: Array.isArray(field.value) ? field.value.join(', ') : field.value,
      editable: field.editable
    }))
  }

  const getAllFields = () => {
    if (!schema.editable_fields) return []
    return Object.entries(schema.editable_fields).map(([key, field]) => ({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: Array.isArray(field.value) ? field.value.join(', ') : field.value,
      editable: field.editable,
      fieldType: field.field_type,
      description: field.description
    }))
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

