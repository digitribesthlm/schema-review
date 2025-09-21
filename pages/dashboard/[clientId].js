import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { toast } from 'react-hot-toast'
import Cookies from 'js-cookie'
import SchemaCard from '../../components/SchemaCard'
import SchemaEditor from '../../components/SchemaEditor'
import CreateSchemaModal from '../../components/CreateSchemaModal'

export default function Dashboard() {
  const router = useRouter()
  const { clientId } = router.query
  const [user, setUser] = useState(null)
  const [pages, setPages] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedSchema, setSelectedSchema] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10) // Can make this adjustable later
  const [showCreateSchemaModal, setShowCreateSchemaModal] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (clientId && user) {
      fetchSchemas()
    }
  }, [clientId, user, currentPage])

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
        setUser(data.user)
      } else {
        Cookies.remove('auth-token')
        router.push('/login')
      }
    } catch (error) {
      Cookies.remove('auth-token')
      router.push('/login')
    }
  }

  const fetchSchemas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/schema-workflow/pages?client_id=${clientId}`)
      
      if (response.ok) {
        const data = await response.json()
        
        setPages(data)
        // Calculate stats from the workflow data
        const stats = {
          total: data.length,
          pending: data.filter(p => p.status === 'pending').length,
          approved: data.filter(p => p.status === 'approved').length,
          next: data.filter(p => p.status === 'next').length
        }
        setStats(stats)
        setPagination({ total: data.length, page: 1, pages: 1 })
      } else {
        toast.error('Failed to load pages')
      }
    } catch (error) {
      toast.error('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo(0, 0) // Scroll to top when changing pages
  }

  const handleEditSchema = (schema) => {
    setSelectedSchema(schema)
  }

  const handleQuickApprove = async (schema) => {
    try {
      const response = await fetch('/api/schemas/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaId: schema.schema_id,
          action: 'approved',
          feedback: ''
        })
      })

      if (response.ok) {
        toast.success('Schema approved successfully!')
        fetchSchemas() // Refresh data
      } else {
        toast.error('Failed to approve schema')
      }
    } catch (error) {
      toast.error('Failed to approve schema')
    }
  }

  const handleQuickReject = async (schema) => {
    const feedback = prompt('Please provide feedback for rejection:')
    if (feedback === null) return // User cancelled

    try {
      const response = await fetch('/api/schemas/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaId: schema.schema_id,
          action: 'rejected',
          feedback
        })
      })

      if (response.ok) {
        toast.success('Schema rejected')
        fetchSchemas() // Refresh data
      } else {
        toast.error('Failed to reject schema')
      }
    } catch (error) {
      toast.error('Failed to reject schema')
    }
  }

  const handleSaveSchema = async (editedFields, feedback, action) => {
    const response = await fetch('/api/schemas/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaId: selectedSchema.schema_id,
        editedFields,
        feedback,
        action
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save schema')
    }

    fetchSchemas() // Refresh data
  }

  const handleLogout = () => {
    Cookies.remove('auth-token')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  // Get all schemas from all pages
  const allSchemas = pages.reduce((acc, page) => {
    const pageSchemas = (page.schemas || []).map(schema => ({
      ...schema,
      page_title: page.page_title,
      page_url: page.url || page._id,
      page_type: page.page_type
    }))
    return [...acc, ...pageSchemas]
  }, [])

  // Filter schemas based on status
  const filteredSchemas = allSchemas.filter(schema => {
    if (filterStatus === 'all') return true
    return schema.approval_status === filterStatus
  })

  // Pagination component
  const PaginationControls = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null
    
    const pageNumbers = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1)
    
    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div className="flex items-center justify-between mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-hubspot-gray">
            Page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalRecords} total pages)
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              pagination.hasPrevPage
                ? 'bg-hubspot-orange text-white hover:bg-orange-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex space-x-1">
            {startPage > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-hubspot-gray hover:bg-gray-50"
                >
                  1
                </button>
                {startPage > 2 && <span className="px-2 py-2 text-hubspot-gray">...</span>}
              </>
            )}
            
            {pageNumbers.map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pageNum === pagination.currentPage
                    ? 'bg-hubspot-orange text-white'
                    : 'text-hubspot-gray hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            {endPage < pagination.totalPages && (
              <>
                {endPage < pagination.totalPages - 1 && <span className="px-2 py-2 text-hubspot-gray">...</span>}
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-hubspot-gray hover:bg-gray-50"
                >
                  {pagination.totalPages}
                </button>
              </>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              pagination.hasNextPage
                ? 'bg-hubspot-orange text-white hover:bg-orange-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-hubspot-light flex items-center justify-center">
        <div className="loading"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Schema Dashboard - {user?.clientName}</title>
      </Head>

      <div className="min-h-screen bg-hubspot-light">
        {/* HubSpot-style Header */}
        <div className="navbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-hubspot-orange rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-hubspot-dark">Schema Review</h1>
                <div className="hidden md:flex items-center space-x-2 text-sm text-hubspot-gray">
                  <span>•</span>
                  <span>{user?.clientName}</span>
                  <span>•</span>
                  <span className="text-hubspot-orange">{user?.domain}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">

                <button
                  onClick={() => router.push('/schema-workflow')}
                  className="btn-ghost flex items-center space-x-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Schema Workflow</span>
                </button>

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
            <h2 className="text-3xl font-bold text-hubspot-dark mb-2">Schema Review Dashboard</h2>
            <p className="text-hubspot-gray">Review, edit, and approve schemas for {user?.domain}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="stat-card">
              <div className="stat-number">{stats.total_pages || 0}</div>
              <div className="stat-label">Total Pages</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.total_schemas || 0}</div>
              <div className="stat-label">Total Schemas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-hubspot-orange">{stats.pending_schemas || 0}</div>
              <div className="stat-label">Pending Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-green-600">{stats.approved_schemas || 0}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
              {[
                { key: 'all', label: 'All Schemas', count: allSchemas.length },
                { key: 'pending', label: 'Pending', count: allSchemas.filter(s => s.approval_status === 'pending').length },
                { key: 'approved', label: 'Approved', count: allSchemas.filter(s => s.approval_status === 'approved').length },
                { key: 'needs_revision', label: 'Needs Revision', count: allSchemas.filter(s => s.approval_status === 'needs_revision').length },
                { key: 'rejected', label: 'Rejected', count: allSchemas.filter(s => s.approval_status === 'rejected').length }
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

          {/* Current Page Info */}
          {pagination.totalPages > 1 && (
            <div className="mb-4">
              <div className="text-sm text-hubspot-gray bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 w-fit">
                Showing page {pagination.currentPage} of {pagination.totalPages} 
                ({filteredSchemas.length} schemas on this page)
              </div>
            </div>
          )}

          {/* Schemas List */}
          {filteredSchemas.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <svg className="mx-auto h-12 w-12 text-hubspot-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-hubspot-dark mb-2">
                  {filterStatus === 'all' ? 'No schemas found on this page' : `No ${filterStatus} schemas on this page`}
                </h3>
                <p className="text-hubspot-gray">
                  {filterStatus === 'all' 
                    ? 'Try navigating to other pages or check if data has been loaded.' 
                    : `No schemas with ${filterStatus} status on this page. Try other pages.`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSchemas.map((schema) => (
                <div key={schema.schema_id} className="card">
                  <div className="card-body">
                    {/* Page Info Header */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-hubspot-dark">
                            {schema.page_title || 'Untitled Page'}
                          </h3>
                          {schema.page_url && (
                            <a 
                              href={schema.page_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-hubspot-orange hover:underline"
                            >
                              {schema.page_url} ↗
                            </a>
                          )}
                        </div>
                        <span className="badge badge-info">
                          {schema.page_type || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {/* Schema Card */}
                    <SchemaCard
                      schema={schema}
                      onEdit={handleEditSchema}
                      onApprove={handleQuickApprove}
                      onReject={handleQuickReject}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <PaginationControls />
        </div>
      </div>

      {/* Create Schema Modal */}
      {showCreateSchemaModal && (
        <CreateSchemaModal
          onClose={() => setShowCreateSchemaModal(false)}
          clientId={clientId}
          onSuccess={() => {
            setShowCreateSchemaModal(false)
            fetchSchemas() // Refresh schemas after creation
          }}
        />
      )}

      {/* Schema Editor Modal */}
      {selectedSchema && (
        <SchemaEditor
          schema={selectedSchema}
          onSave={handleSaveSchema}
          onClose={() => setSelectedSchema(null)}
        />
      )}
    </>
  )
}

