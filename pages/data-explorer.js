import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function DataExplorer() {
  const [schemas, setSchemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSchema, setSelectedSchema] = useState(null)
  const [filter, setFilter] = useState('')
  const [schemaTypeFilter, setSchemaTypeFilter] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchSchemas()
  }, [])

  const fetchSchemas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/data-explorer')
      if (!response.ok) {
        throw new Error('Failed to fetch schemas')
      }
      const data = await response.json()
      setSchemas(data.schemas || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredSchemas = schemas.filter(schema => {
    const matchesUrl = !filter || schema.url?.toLowerCase().includes(filter.toLowerCase())
    const matchesType = !schemaTypeFilter || schema.schema_type === schemaTypeFilter
    return matchesUrl && matchesType
  })

  const uniqueSchemaTypes = [...new Set(schemas.map(s => s.schema_type))].filter(Boolean)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schema data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading data</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchSchemas}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schema Data Explorer</h1>
              <p className="text-gray-600">Raw data from agency.schema_definitions collection</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by URL
              </label>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search URLs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Schema Type
              </label>
              <select
                value={schemaTypeFilter}
                onChange={(e) => setSchemaTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {uniqueSchemaTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <div>Total Schemas: <span className="font-semibold">{schemas.length}</span></div>
                <div>Filtered: <span className="font-semibold">{filteredSchemas.length}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Schema List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Schema List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Schema Definitions</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredSchemas.map((schema) => (
                <div
                  key={schema._id}
                  onClick={() => setSelectedSchema(schema)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedSchema?._id === schema._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {schema.url || 'No URL'}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          schema.schema_type === 'Organization' ? 'bg-blue-100 text-blue-800' :
                          schema.schema_type === 'Article' ? 'bg-green-100 text-green-800' :
                          schema.schema_type === 'Service' ? 'bg-purple-100 text-purple-800' :
                          schema.schema_type === 'Product' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {schema.schema_type || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          v{schema.version || 1}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(schema.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Schema Details */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Schema Details</h2>
            </div>
            <div className="p-4">
              {selectedSchema ? (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h3>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div><strong>ID:</strong> {selectedSchema._id}</div>
                      <div><strong>URL:</strong> {selectedSchema.url}</div>
                      <div><strong>Schema Type:</strong> {selectedSchema.schema_type}</div>
                      <div><strong>Priority:</strong> {selectedSchema.schema_priority}</div>
                      <div><strong>Version:</strong> {selectedSchema.version}</div>
                      <div><strong>Status:</strong> {selectedSchema.status}</div>
                      <div><strong>Created:</strong> {formatDate(selectedSchema.created_at)}</div>
                      <div><strong>Updated:</strong> {formatDate(selectedSchema.updated_at)}</div>
                    </div>
                  </div>

                  {/* Schema Data */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Schema Data (JSON-LD)</h3>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(selectedSchema.schema_data, null, 2))}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Copy JSON
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(selectedSchema.schema_data, null, 2)}
                    </pre>
                  </div>

                  {/* Editable Fields */}
                  {selectedSchema.editable_fields && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Editable Fields</h3>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(selectedSchema.editable_fields, null, 2))}
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Copy Fields
                        </button>
                      </div>
                      <pre className="bg-gray-900 text-yellow-400 p-3 rounded text-xs overflow-auto max-h-64">
                        {JSON.stringify(selectedSchema.editable_fields, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Raw Document */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Complete Document</h3>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(selectedSchema, null, 2))}
                        className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Copy All
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-300 p-3 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(selectedSchema, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">📄</div>
                  <p>Select a schema from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
