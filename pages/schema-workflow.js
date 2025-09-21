import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SchemaWorkflow() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [filter, setFilter] = useState('all'); // all, no_schema, pending, approved
  const [selectedPage, setSelectedPage] = useState(null);
  const [schemaJson, setSchemaJson] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPages();
    checkUserRole();
  }, [filter]);

  const fetchPages = async () => {
    try {
      const response = await fetch(`/api/schema-workflow/pages?filter=${filter}`);
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/auth/user');
      const user = await response.json();
      setUserRole(user.role || 'client');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const handlePageSelect = async (page) => {
    setSelectedPage(page);
    // Check for schema in different possible fields
    if (page.schema_body) {
      setSchemaJson(JSON.stringify(page.schema_body, null, 2));
    } else if (page.schema_json) {
      setSchemaJson(JSON.stringify(page.schema_json, null, 2));
    } else {
      setSchemaJson('');
    }
  };

  const saveSchema = async () => {
    if (!selectedPage || !schemaJson) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/schema-workflow/save-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: selectedPage._id,
          schema_body: JSON.parse(schemaJson),
          status: 'pending'
        }),
      });

      if (response.ok) {
        alert('Schema saved successfully!');
        fetchPages();
        setSelectedPage(null);
        setSchemaJson('');
      } else {
        alert('Error saving schema');
      }
    } catch (error) {
      console.error('Error saving schema:', error);
      alert('Error saving schema');
    } finally {
      setSaving(false);
    }
  };

  const approveSchema = async () => {
    if (!selectedPage) return;

    try {
      const response = await fetch('/api/schema-workflow/approve-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: selectedPage._id,
          status: 'approved'
        }),
      });

      if (response.ok) {
        alert('Schema approved successfully!');
        fetchPages();
        setSelectedPage(null);
      } else {
        alert('Error approving schema');
      }
    } catch (error) {
      console.error('Error approving schema:', error);
      alert('Error approving schema');
    }
  };

  const addComment = async (comment) => {
    if (!selectedPage || !comment) return;

    try {
      const response = await fetch('/api/schema-workflow/add-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: selectedPage._id,
          comment: comment
        }),
      });

      if (response.ok) {
        alert('Comment added successfully!');
        fetchPages();
      } else {
        alert('Error adding comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
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

  const getSchemaIndicator = (page) => {
    if (page.schema_body || page.schema_json) {
      return <span className="text-green-600">✓ Schema</span>;
    } else {
      return <span className="text-red-600">✗ No Schema</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Schema Workflow</h1>
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Pages</option>
              <option value="no_schema">No Schema</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Page List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pages ({pages.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pages.map((page) => (
                <div
                  key={page._id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedPage?._id === page._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handlePageSelect(page)}
                >
                  <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">
                      {page.page_title || new URL(page.url).pathname}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {page.bq_main_topic || page.main_topic || 'No topic available'}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {page.content_summary ? page.content_summary.substring(0, 100) + '...' : ''}
                    </div>
                    <div className="flex justify-between items-center">
                      {getSchemaIndicator(page)}
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(page.status)}`}>
                        {page.status || 'next'}
                      </span>
                    </div>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {selectedPage ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Page Details</h2>
                
                {/* Basic Info */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Page Title</h3>
                  <p className="text-sm text-gray-700 font-medium">{selectedPage.page_title}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">URL</h3>
                  <a 
                    href={selectedPage.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {selectedPage.url}
                  </a>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Main Topic</h3>
                  <p className="text-sm text-gray-700">{selectedPage.bq_main_topic || selectedPage.main_topic || 'No topic available'}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Content Summary</h3>
                  <p className="text-sm text-gray-700">{selectedPage.content_summary || 'No summary available'}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Page ID & Status</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">ID: {selectedPage.bq_page_id || selectedPage.page_id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPage.status)}`}>
                      {selectedPage.status || 'next'}
                    </span>
                  </div>
                </div>

                {/* Keywords */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Keywords ({selectedPage.bq_keywords?.length || 0})</h3>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {(selectedPage.bq_keywords || selectedPage.keywords || []).slice(0, 10).map((keyword, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        title={`Importance: ${(keyword.importance * 100).toFixed(0)}%`}
                      >
                        {keyword.term} ({(keyword.importance * 100).toFixed(0)}%)
                      </span>
                    ))}
                    {(selectedPage.bq_keywords || selectedPage.keywords || []).length > 10 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{(selectedPage.bq_keywords || selectedPage.keywords || []).length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Entities */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Entities ({selectedPage.bq_entities?.length || 0})</h3>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {(selectedPage.bq_entities || selectedPage.entities || []).slice(0, 12).map((entity, index) => (
                      <span 
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs ${
                          entity.type === 'organization' ? 'bg-purple-100 text-purple-800' :
                          entity.type === 'product' ? 'bg-green-100 text-green-800' :
                          entity.type === 'person' ? 'bg-yellow-100 text-yellow-800' :
                          entity.type === 'concept' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                        title={`Type: ${entity.type}, Importance: ${(entity.importance * 100).toFixed(0)}%`}
                      >
                        {entity.name} ({entity.type})
                      </span>
                    ))}
                    {(selectedPage.bq_entities || selectedPage.entities || []).length > 12 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{(selectedPage.bq_entities || selectedPage.entities || []).length - 12} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Schema Section */}
                {userRole === 'admin' && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Schema JSON-LD</h3>
                    <textarea
                      value={schemaJson}
                      onChange={(e) => setSchemaJson(e.target.value)}
                      className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
                      placeholder="Paste your Schema.org JSON-LD here..."
                    />
                    <button
                      onClick={saveSchema}
                      disabled={saving || !schemaJson}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Schema'}
                    </button>
                  </div>
                )}

                {/* Schema Display for Clients */}
                {userRole === 'client' && selectedPage.schema_body && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Schema JSON-LD</h3>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-64 whitespace-pre-wrap">
                      {JSON.stringify(selectedPage.schema_body, null, 2).split('\n').map((line, index) => (
                        <div key={index} className="flex">
                          <span className="text-gray-400 mr-3 select-none">{index + 1}</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </pre>
                    
                    {/* Client Actions */}
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={approveSchema}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve Schema
                      </button>
                      <button
                        onClick={() => {
                          const comment = prompt('Add a comment about this schema:');
                          if (comment) addComment(comment);
                        }}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments */}
                {selectedPage.comments && selectedPage.comments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Comments</h3>
                    <div className="space-y-2">
                      {selectedPage.comments.map((comment, index) => (
                        <div key={index} className="p-2 bg-gray-100 rounded text-sm">
                          {comment.text} 
                          <span className="text-gray-500 ml-2">
                            - {new Date(comment.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a page from the list to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
