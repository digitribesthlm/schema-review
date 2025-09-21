import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PageDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPageDetails();
    }
  }, [id]);

  const fetchPageDetails = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/schema-workflow/pages?filter=all`);
      const pages = await response.json();
      
      // Find the specific page by ID
      const foundPage = pages.find(p => p._id === id);
      if (foundPage) {
        setPage(foundPage);
      } else {
        console.error('Page not found');
      }
    } catch (error) {
      console.error('Error fetching page details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'next': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading page details...</div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-4">The requested page could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Page Details - {page.page_title || 'Untitled'}</title>
      </Head>

      <div className="bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Page Details</h1>
                <p className="text-gray-600">{page.page_title || 'Untitled Page'}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => router.push(`/schema-workflow?page=${page._id}`)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Edit Schema
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Page Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Page Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Page Title</label>
                    <p className="mt-1 text-sm text-gray-900">{page.page_title || 'No title'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <a 
                      href={page.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:underline break-all"
                    >
                      {page.url}
                    </a>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Page ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{page._id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                        {page.status || 'next'}
                      </span>
                      {page.schema_body && (
                        <span className="text-green-600 text-xs font-medium">✓ Has Schema</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Analysis */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Content Analysis</h2>
                <div className="space-y-4">
                  {page.bq_main_topic && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Main Topic</label>
                      <p className="mt-1 text-sm text-gray-900">{page.bq_main_topic}</p>
                    </div>
                  )}
                  
                  {page.content_summary && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Content Summary</label>
                      <p className="mt-1 text-sm text-gray-900">{page.content_summary}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Timestamps</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{formatDate(page.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span className="text-gray-900">{formatDate(page.updated_at)}</span>
                  </div>
                  {page.last_crawled && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Crawled:</span>
                      <span className="text-gray-900">{formatDate(page.last_crawled)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Keywords & Entities */}
            <div className="space-y-6">
              {/* Keywords */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Keywords</h2>
                {page.bq_keywords && page.bq_keywords.length > 0 ? (
                  <div className="space-y-2">
                    {page.bq_keywords.map((keyword, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-900">{keyword.term}</span>
                        <span className="text-sm text-gray-500">{(keyword.importance * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No keywords available</p>
                )}
              </div>

              {/* Entities */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Entities</h2>
                {page.bq_entities && page.bq_entities.length > 0 ? (
                  <div className="space-y-2">
                    {page.bq_entities.map((entity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-900">{entity.name}</span>
                        <span className="text-sm text-gray-500">{entity.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No entities available</p>
                )}
              </div>

              {/* Schema Information */}
              {page.schema_body && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Schema JSON-LD</h2>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
                    {typeof page.schema_body === 'string' 
                      ? page.schema_body 
                      : JSON.stringify(page.schema_body, null, 2)
                    }
                  </pre>
                </div>
              )}

              {/* Comments */}
              {page.comments && page.comments.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Comments</h2>
                  <div className="space-y-3">
                    {page.comments.map((comment, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-900">{comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
