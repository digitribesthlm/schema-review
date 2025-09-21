import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { toast } from 'react-hot-toast'
import Cookies from 'js-cookie'

export default function AIReviewer() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [schemas, setSchemas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSchema, setSelectedSchema] = useState(null)
  const [editingSchema, setEditingSchema] = useState(null)
  const [filterStatus, setFilterStatus] = useState('pending_ai_review')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchSchemasForReview()
    }
  }, [user, filterStatus])

  const checkAuth = async () => {
    const token = Cookies.get('auth-token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        // Check if user has AI reviewer permissions
        if (data.user.role !== 'ai_reviewer' && data.user.role !== 'admin') {
          toast.error('Access denied: AI Reviewer permissions required')
          router.push('/login')
          return
        }
        setUser(data.user)
      } else {
        Cookies.remove('auth-token')
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const fetchSchemasForReview = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ai-reviewer/schemas?status=${filterStatus}`, {
        headers: { 'Authorization': `Bearer ${Cookies.get('auth-token')}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSchemas(data.schemas)
      } else {
        toast.error('Failed to fetch schemas for review')
      }
    } catch (error) {
      console.error('Failed to fetch schemas:', error)
      toast.error('Failed to fetch schemas')
    } finally {
      setLoading(false)
    }
  }

  const analyzeSchema = async (schema) => {
    try {
      const response = await fetch('/api/ai-reviewer/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('auth-token')}`
        },
        body: JSON.stringify({
          schema_id: schema._id,
          url: schema.url,
          schema_data: schema.schema_data,
          page_content: schema.page_content
        })
      })

      if (response.ok) {
        const analysis = await response.json()
        setSelectedSchema({
          ...schema,
          ai_analysis: analysis
        })
      } else {
        toast.error('Failed to analyze schema')
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      toast.error('Analysis failed')
    }
  }

  const saveCorrections = async (schemaId, corrections) => {
    try {
      const response = await fetch('/api/ai-reviewer/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('auth-token')}`
        },
        body: JSON.stringify({
          schema_id: schemaId,
          corrections: corrections,
          reviewer_notes: corrections.reviewer_notes
        })
      })

      if (response.ok) {
        toast.success('Corrections saved successfully')
        setEditingSchema(null)
        fetchSchemasForReview()
      } else {
        toast.error('Failed to save corrections')
      }
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Save failed')
    }
  }

  const approveSchema = async (schemaId) => {
    try {
      const response = await fetch('/api/ai-reviewer/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('auth-token')}`
        },
        body: JSON.stringify({
          schema_id: schemaId,
          status: 'ai_approved'
        })
      })

      if (response.ok) {
        toast.success('Schema approved for customer review')
        fetchSchemasForReview()
      } else {
        toast.error('Failed to approve schema')
      }
    } catch (error) {
      console.error('Approval failed:', error)
      toast.error('Approval failed')
    }
  }

  const handleLogout = () => {
    Cookies.remove('auth-token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hubspot-orange mx-auto mb-4"></div>
          <p className="text-hubspot-gray">Loading schemas for review...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>AI Schema Reviewer - Schema Review System</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <svg className="h-8 w-8 text-hubspot-orange" fill="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-hubspot-dark">AI Schema Reviewer</h1>
                <div className="hidden md:flex items-center space-x-2 text-sm text-hubspot-gray">
                  <span>•</span>
                  <span>Quality Control Interface</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-hubspot-gray">
                  Welcome, <span className="font-medium text-hubspot-dark">{user?.name}</span>
                </span>
                <button onClick={handleLogout} className="btn-ghost">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-hubspot-dark mb-2">Schema Quality Review</h2>
            <p className="text-hubspot-gray">Review and correct AI-generated schemas before customer approval</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="stat-card">
              <div className="stat-number">{schemas.filter(s => s.ai_status === 'pending_ai_review').length}</div>
              <div className="stat-label">Pending Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-yellow-600">{schemas.filter(s => s.ai_status === 'needs_correction').length}</div>
              <div className="stat-label">Needs Correction</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-green-600">{schemas.filter(s => s.ai_status === 'ai_approved').length}</div>
              <div className="stat-label">AI Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-red-600">{schemas.filter(s => s.ai_status === 'rejected').length}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
              {[
                { key: 'pending_ai_review', label: 'Pending Review', count: schemas.filter(s => s.ai_status === 'pending_ai_review').length },
                { key: 'needs_correction', label: 'Needs Correction', count: schemas.filter(s => s.ai_status === 'needs_correction').length },
                { key: 'ai_approved', label: 'AI Approved', count: schemas.filter(s => s.ai_status === 'ai_approved').length },
                { key: 'rejected', label: 'Rejected', count: schemas.filter(s => s.ai_status === 'rejected').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === key
                      ? 'bg-hubspot-orange text-white'
                      : 'text-hubspot-gray hover:text-hubspot-dark hover:bg-gray-50'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Schema List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {schemas.map((schema) => (
              <div key={schema._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-hubspot-dark mb-1">
                      {schema.page_title || 'Untitled Page'}
                    </h3>
                    <a 
                      href={schema.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-hubspot-orange hover:underline"
                    >
                      {schema.url} ↗
                    </a>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    schema.ai_status === 'pending_ai_review' ? 'bg-yellow-100 text-yellow-800' :
                    schema.ai_status === 'needs_correction' ? 'bg-red-100 text-red-800' :
                    schema.ai_status === 'ai_approved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {schema.ai_status?.replace('_', ' ') || 'pending'}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-hubspot-gray">Schema Type:</span>
                    <span className="px-2 py-1 bg-hubspot-orange text-white text-xs rounded">
                      {schema.schema_type}
                    </span>
                  </div>
                  <div className="text-sm text-hubspot-gray">
                    Updated: {new Date(schema.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => analyzeSchema(schema)}
                    className="btn-ghost text-sm"
                  >
                    Analyze
                  </button>
                  <button
                    onClick={() => setEditingSchema(schema)}
                    className="btn-ghost text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => approveSchema(schema._id)}
                    className="btn-primary text-sm"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>

          {schemas.length === 0 && (
            <div className="text-center py-12">
              <div className="text-hubspot-gray mb-4">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-hubspot-dark mb-2">No schemas to review</h3>
              <p className="text-hubspot-gray">All schemas in this category have been processed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Schema Analysis Modal */}
      {selectedSchema && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Schema Analysis</h3>
                <button
                  onClick={() => setSelectedSchema(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedSchema.ai_analysis && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Issues Found:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {selectedSchema.ai_analysis.issues?.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {selectedSchema.ai_analysis.recommendations?.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Current Schema:</h4>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedSchema.schema_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schema Editor Modal */}
      {editingSchema && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Schema</h3>
                <button
                  onClick={() => setEditingSchema(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Schema editor interface would go here */}
              <div className="text-center py-8 text-gray-500">
                Schema editor interface - to be implemented with JSON editor component
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
