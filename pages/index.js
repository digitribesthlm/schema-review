import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Dashboard() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPage, setSelectedPage] = useState(null);
  const [stats, setStats] = useState({});
  const router = useRouter();

  useEffect(() => {
    // Add small delay to ensure authentication is ready
    const timer = setTimeout(() => {
      fetchPages();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [filter]);

  // Also fetch when component becomes visible (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPages();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      
      // Ensure we have authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, retrying in 500ms...');
        setTimeout(fetchPages, 500);
        return;
      }
      
      const response = await fetch(`/api/schema-workflow/pages?filter=${filter}`);
      const data = await response.json();
      
      console.log('Dashboard API Response:', data);
      console.log('Data length:', data.length);
      
      setPages(data);
      
      // Calculate comprehensive stats
      const stats = {
        total: data.length,
        with_schema: data.filter(p => p.schema_body && p.schema_body.trim() !== '').length,
        pending: data.filter(p => p.status === 'pending').length,
        approved: data.filter(p => p.status === 'approved').length,
        with_keywords: data.filter(p => p.bq_keywords && p.bq_keywords.length > 0).length,
        with_entities: data.filter(p => p.bq_entities && p.bq_entities.length > 0).length,
        with_summary: data.filter(p => p.content_summary).length
      };
      
      console.log('Dashboard Stats:', stats);
      setStats(stats);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
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

  const truncateText = (text, maxLength = 150) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Schema Workflow Dashboard - Complete Data View</title>
      </Head>

      <div className="bg-gray-50">
        {/* Page Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Complete overview of schema workflow data</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/schema-workflow')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Schema Workflow
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Collection Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Pages</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-green-600">{stats.with_schema}</div>
                <div className="text-sm text-gray-600">With Schema</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.with_keywords}</div>
                <div className="text-sm text-gray-600">With Keywords</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-indigo-600">{stats.with_entities}</div>
                <div className="text-sm text-gray-600">With Entities</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.with_summary}</div>
                <div className="text-sm text-gray-600">With Summary</div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Pages' },
                { key: 'no_schema', label: 'No Schema' },
                { key: 'pending', label: 'Pending' },
                { key: 'approved', label: 'Approved' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pages Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Complete Collection Data ({pages.length} pages)
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                All information from MongoDB schema_workflow collection
              </p>
            </div>

            {pages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">No pages found for the selected filter.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Page Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Topic & Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keywords
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entities
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schema Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pages.map((page, index) => (
                      <tr key={page._id || index} className="hover:bg-gray-50">
                        {/* Page Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {page.page_title || new URL(page.url || 'https://example.com').pathname}
                            </div>
                            <a 
                              href={page.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline break-all"
                            >
                              {page.url}
                            </a>
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {page.page_id || page._id}
                            </div>
                          </div>
                        </td>

                        {/* Topic & Content */}
                        <td className="px-6 py-4">
                          <div className="max-w-sm">
                            <div className="text-sm font-medium text-gray-900 mb-2">
                              {page.bq_main_topic || page.main_topic || 'No topic'}
                            </div>
                            {page.content_summary && (
                              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                <strong>Summary:</strong> {truncateText(page.content_summary)}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Keywords */}
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {page.bq_keywords && page.bq_keywords.length > 0 ? (
                              <div className="space-y-1">
                                {page.bq_keywords.slice(0, 3).map((keyword, idx) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {keyword.term}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {(keyword.importance * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                ))}
                                {page.bq_keywords.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    +{page.bq_keywords.length - 3} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No keywords</span>
                            )}
                          </div>
                        </td>

                        {/* Entities */}
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {page.bq_entities && page.bq_entities.length > 0 ? (
                              <div className="space-y-1">
                                {page.bq_entities.slice(0, 3).map((entity, idx) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      {entity.name}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {entity.type}
                                    </span>
                                  </div>
                                ))}
                                {page.bq_entities.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    +{page.bq_entities.length - 3} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No entities</span>
                            )}
                          </div>
                        </td>

                        {/* Schema Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(page.status)}`}>
                              {page.status || 'next'}
                            </span>
                            <div className="text-xs">
                              {page.schema_body ? (
                                <span className="text-green-600">✓ Has Schema</span>
                              ) : (
                                <span className="text-red-600">✗ No Schema</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/page-details/${page._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal removed - using inline details panel */}

          {/* Quick Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => router.push('/schema-workflow')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Go to Schema Workflow
            </button>
            <button
              onClick={fetchPages}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
