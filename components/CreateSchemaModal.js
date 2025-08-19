import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function CreateSchemaModal({ onClose, clientId, onSuccess }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!url.trim()) {
      toast.error('Please enter a valid URL')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch (error) {
      toast.error('Please enter a valid URL (including http:// or https://)')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/create-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url.trim(),
          clientId
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Schema creation started! You will see the schemas appear shortly.')
        onSuccess()
      } else {
        toast.error(result.message || 'Failed to start schema creation')
      }
    } catch (error) {
      console.error('Error creating schema:', error)
      toast.error('Failed to start schema creation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-hubspot-dark">Create Schema from URL</h3>
          <button
            onClick={onClose}
            className="text-hubspot-gray hover:text-hubspot-dark transition-colors"
            disabled={loading}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="url" className="form-label">
              Website URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input"
              placeholder="https://example.com"
              disabled={loading}
              required
            />
            <p className="text-xs text-hubspot-gray mt-2">
              Enter the URL of the website you want to analyze and create schemas for
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
