import React from 'react'

const FieldRenderer = ({ fieldName, fieldConfig, value, onChange }) => {
  const fieldId = `field-${fieldName}`

  switch (fieldConfig.field_type) {
    case 'textarea':
      return (
        <textarea
          id={fieldId}
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="form-input h-40 resize-y"
          placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
        />
      )
    
    case 'array':
      return (
        <input
          id={fieldId}
          type="text"
          value={Array.isArray(value) ? value.join(', ') : value || ''}
          onChange={(e) => onChange(fieldName, e.target.value.split(', ').filter(Boolean))}
          className="form-input"
          placeholder="Separate items with commas"
        />
      )
    
    case 'email':
      return (
        <input
          id={fieldId}
          type="email"
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="form-input"
          placeholder="Enter email address"
        />
      )
    
    case 'tel':
      return (
        <input
          id={fieldId}
          type="tel"
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="form-input"
          placeholder="Enter phone number"
        />
      )
    
    case 'url':
      return (
        <input
          id={fieldId}
          type="url"
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="form-input"
          placeholder="Enter URL"
        />
      )
    
    case 'date':
      return (
        <input
          id={fieldId}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="form-input"
        />
      )
    
    case 'datetime':
      return (
        <input
          id={fieldId}
          type="datetime-local"
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="form-input"
        />
      )
    
    case 'time':
      return (
        <input
          id={fieldId}
          type="time"
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="form-input"
          placeholder="HH:MM"
        />
      )
    
    case 'select':
      return (
        <select
          id={fieldId}
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="form-input"
        >
          <option value="">Select an option</option>
          {fieldConfig.options?.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )

    case 'number':
      return (
        <input
          id={fieldId}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="form-input"
          placeholder="Enter number"
        />
      )
    
    default:
      return (
        <input
          id={fieldId}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="form-input"
          placeholder={`Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
        />
      )
  }
}

export default FieldRenderer
