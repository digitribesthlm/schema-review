import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function SchemaWorkflow() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [filter, setFilter] = useState('all'); // all, no_schema, pending, approved
  const [selectedPage, setSelectedPage] = useState(null);
  const [schemaJson, setSchemaJson] = useState('');
  const [saving, setSaving] = useState(false);
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const [contentFlags, setContentFlags] = useState([]);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagField, setFlagField] = useState('');
  const [flagIssue, setFlagIssue] = useState('');
  const [flagSource, setFlagSource] = useState('');
  const [flagSaving, setFlagSaving] = useState(false);
  const [editorHeight, setEditorHeight] = useState(400);
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const pageContainerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchPages();
    checkUserRole();
  }, [filter]);

  // Auto-select page if page parameter is provided.
  useEffect(() => {
    const { page } = router.query;
    if (page && pages.length > 0) {
      const foundPage = pages.find(p => p._id === page);
      if (foundPage) {
        handlePageSelect(foundPage);
      }
    }
  }, [router.query, pages]);

  // Keyboard shortcut: Cmd/Ctrl+S to save
  useEffect(() => {
    const onKeyDown = (e) => {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
      const saveCombo = (isMac && e.metaKey && e.key.toLowerCase() === 's') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 's');
      if (saveCombo) {
        e.preventDefault();
        if (schemaJson && selectedPage && !saving) {
          saveSchema();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [schemaJson, selectedPage, saving]);

  // Auto-size editor height (up to 70vh) and keep gutter in sync
  useEffect(() => {
    const adjustHeight = () => {
      if (!textareaRef.current) return;
      const maxHeight = Math.floor(window.innerHeight * 0.7);
      const next = Math.min(Math.max(textareaRef.current.scrollHeight, 240), maxHeight);
      setEditorHeight(next);
    };
    adjustHeight();
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [schemaJson]);

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

  const unwrapSchemaBody = (body) => {
    try {
      let parsed = typeof body === 'string' ? JSON.parse(body) : body;
      // If @graph is itself a string (double-serialized), unwrap it
      while (parsed && typeof parsed['@graph'] === 'string') {
        parsed = JSON.parse(parsed['@graph']);
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      return typeof body === 'string' ? body : JSON.stringify(body, null, 2);
    }
  };

  const handlePageSelect = async (page) => {
    setSelectedPage(page);
    setContentFlags(page.contentFlags || []);
    setShowFlagForm(false);
    setFlagField('');
    setFlagIssue('');
    setFlagSource('');
    if (page.schema_body) {
      setSchemaJson(unwrapSchemaBody(page.schema_body));
    } else {
      setSchemaJson('');
    }
  };

  const addContentFlag = async () => {
    if (!selectedPage || !flagField || !flagIssue) return;
    setFlagSaving(true);
    try {
      const response = await fetch('/api/schema-workflow/content-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: selectedPage._id,
          field: flagField,
          issue: flagIssue,
          source: flagSource
        })
      });
      if (response.ok) {
        const data = await response.json();
        setContentFlags(prev => [...prev, data.flag]);
        setFlagField('');
        setFlagIssue('');
        setFlagSource('');
        setShowFlagForm(false);
      } else {
        alert('Error saving flag');
      }
    } catch (error) {
      console.error('Error adding flag:', error);
      alert('Error saving flag');
    } finally {
      setFlagSaving(false);
    }
  };

  const resolveFlag = async (flagId, currentStatus) => {
    if (!selectedPage) return;
    const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
    try {
      const response = await fetch('/api/schema-workflow/content-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: selectedPage._id,
          flag_id: flagId,
          status: newStatus
        })
      });
      if (response.ok) {
        setContentFlags(prev => prev.map(f =>
          f.id === flagId ? { ...f, status: newStatus, resolved_at: newStatus === 'resolved' ? new Date() : null } : f
        ));
      } else {
        alert('Error updating flag');
      }
    } catch (error) {
      console.error('Error resolving flag:', error);
    }
  };

  const deleteFlag = async (flagId) => {
    if (!selectedPage || !confirm('Delete this flag?')) return;
    try {
      const response = await fetch('/api/schema-workflow/content-flags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: selectedPage._id, flag_id: flagId })
      });
      if (response.ok) {
        setContentFlags(prev => prev.filter(f => f.id !== flagId));
      } else {
        alert('Error deleting flag');
      }
    } catch (error) {
      console.error('Error deleting flag:', error);
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
          // API expects `schema_body` (string or object)
          schema_body: schemaJson
        }),
      });

      if (response.ok) {
        alert('Schema saved successfully!');
        fetchPages();
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

  const approveSchema = async (notes) => {
    if (!selectedPage) return;

    try {
      const response = await fetch('/api/schema-workflow/approve-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: selectedPage._id,
          status: 'approved',
          notes: notes
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

  const rejectSchema = async (notes) => {
    if (!selectedPage) return;

    try {
      const response = await fetch('/api/schema-workflow/approve-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: selectedPage._id,
          status: 'rejected',
          notes: notes
        }),
      });

      if (response.ok) {
        alert('Schema rejected successfully!');
        fetchPages();
        setSelectedPage(null);
      } else {
        alert('Error rejecting schema');
      }
    } catch (error) {
      console.error('Error rejecting schema:', error);
      alert('Error rejecting schema');
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
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'next': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSchemaIndicator = (page) => {
    if (page.schema_body) {
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
    <div className="bg-gray-50">
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
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className={selectedPage ? "grid grid-cols-1 gap-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
          {/* Page List - only show if no specific page is selected */}
          {!selectedPage && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Pages ({pages.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pages.map((page) => (
                  <div
                    key={page._id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedPage?._id === page._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    onClick={() => handlePageSelect(page)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{page.page_title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{page.bq_main_topic || page.main_topic}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{page.content_summary}</p>
                      </div>
                      <div className="ml-4 text-right">
                        {getSchemaIndicator(page)}
                        <div className={`mt-1 px-2 py-1 rounded-full text-xs ${getStatusColor(page.status)}`}>
                          {page.status || 'next'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Page Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {selectedPage ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Page Details</h2>
                </div>

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
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">Keywords ({(selectedPage.bq_keywords || selectedPage.keywords || []).length})</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Relevance score: 100 = most relevant, 0 = least relevant
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {(selectedPage.bq_keywords || selectedPage.keywords || []).slice(0, 10).map((keyword, index) => {
                      // Handle both string and number importance values
                      const importance = parseFloat(keyword.importance || 0);
                      const relevanceScore = (importance * 100).toFixed(0);
                      const keywordText = keyword.term || keyword.name || 'Unknown';

                      return (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          title={`Relevance Score: ${relevanceScore}/100`}
                        >
                          {keywordText} ({relevanceScore})
                        </span>
                      );
                    })}
                    {(selectedPage.bq_keywords || selectedPage.keywords || []).length > 10 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{(selectedPage.bq_keywords || selectedPage.keywords || []).length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Entities */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">Entities ({(selectedPage.bq_entities || selectedPage.entities || []).length})</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Hover to see relevance score and entity type
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {(selectedPage.bq_entities || selectedPage.entities || []).slice(0, 12).map((entity, index) => {
                      // Handle both string and number importance values
                      const importance = parseFloat(entity.importance || 0);
                      const relevanceScore = (importance * 100).toFixed(0);

                      return (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${entity.type === 'organization' ? 'bg-purple-100 text-purple-800' :
                            entity.type === 'product' ? 'bg-green-100 text-green-800' :
                              entity.type === 'person' ? 'bg-yellow-100 text-yellow-800' :
                                entity.type === 'concept' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}
                          title={`Type: ${entity.type}, Relevance: ${relevanceScore}/100`}
                        >
                          {entity.name} ({entity.type})
                        </span>
                      );
                    })}
                    {(selectedPage.bq_entities || selectedPage.entities || []).length > 12 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{(selectedPage.bq_entities || selectedPage.entities || []).length - 12} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Flags */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">
                      Content Flags
                      {contentFlags.filter(f => f.status === 'open').length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                          {contentFlags.filter(f => f.status === 'open').length} open
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => setShowFlagForm(!showFlagForm)}
                      className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      + Add Flag
                    </button>
                  </div>

                  {/* Add flag form */}
                  {showFlagForm && (
                    <div className="mb-3 p-3 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Schema Field / Section *</label>
                        <input
                          type="text"
                          value={flagField}
                          onChange={e => setFlagField(e.target.value)}
                          placeholder="e.g. description, Q2 answer, component list"
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Issue Description *</label>
                        <textarea
                          value={flagIssue}
                          onChange={e => setFlagIssue(e.target.value)}
                          placeholder="Describe what is factually wrong or missing compared to the live page..."
                          className="w-full px-2 py-1 text-sm border rounded"
                          rows={3}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Source / Evidence (optional)</label>
                        <input
                          type="text"
                          value={flagSource}
                          onChange={e => setFlagSource(e.target.value)}
                          placeholder="e.g. Live page section heading or quote"
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addContentFlag}
                          disabled={flagSaving || !flagField || !flagIssue}
                          className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                        >
                          {flagSaving ? 'Saving...' : 'Save Flag'}
                        </button>
                        <button
                          onClick={() => setShowFlagForm(false)}
                          className="px-3 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Flag list */}
                  {contentFlags.length === 0 ? (
                    <p className="text-xs text-gray-500">No content flags yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {contentFlags.map((flag) => (
                        <div
                          key={flag.id}
                          className={`p-3 rounded-lg border text-sm ${
                            flag.status === 'resolved'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-orange-50 border-orange-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-xs uppercase tracking-wide text-gray-500">Field:</span>
                                <span className="font-medium">{flag.field}</span>
                                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                                  flag.status === 'resolved'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {flag.status}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-1">{flag.issue}</p>
                              {flag.source && (
                                <p className="text-xs text-gray-500 italic">Source: {flag.source}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                Added {new Date(flag.created_at).toLocaleDateString()}
                                {flag.resolved_at && ` · Resolved ${new Date(flag.resolved_at).toLocaleDateString()}`}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => resolveFlag(flag.id, flag.status)}
                                className={`px-2 py-1 text-xs rounded ${
                                  flag.status === 'resolved'
                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                                }`}
                                title={flag.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
                              >
                                {flag.status === 'resolved' ? 'Reopen' : '✓ Resolve'}
                              </button>
                              <button
                                onClick={() => deleteFlag(flag.id)}
                                className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded"
                                title="Delete flag"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Schema Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Schema JSON-LD</h3>
                    <button
                      type="button"
                      onClick={() => setEditorFullscreen(true)}
                      className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                      title="Open fullscreen editor"
                    >
                      ⤢ Expand
                    </button>
                  </div>
                  <div className="relative border rounded-lg overflow-hidden">
                    <div className="flex">
                      {/* Line numbers */}
                      <div
                        ref={gutterRef}
                        className="bg-gray-100 p-3 text-right text-xs text-gray-500 font-mono select-none min-w-[3rem] border-r overflow-y-auto"
                        style={{ height: editorHeight }}
                      >
                        {schemaJson.split('\n').map((_, index) => (
                          <div key={index} className="leading-5">
                            {index + 1}
                          </div>
                        ))}
                      </div>
                      {/* Textarea */}
                      <textarea
                        ref={textareaRef}
                        value={schemaJson}
                        onChange={(e) => setSchemaJson(e.target.value)}
                        onScroll={(e) => {
                          if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
                        }}
                        className="flex-1 p-3 font-mono text-sm outline-none leading-5"
                        placeholder="Paste your Schema.org JSON-LD here..."
                        style={{ height: editorHeight, lineHeight: '1.25rem', whiteSpace: 'pre', overflowY: 'auto' }}
                        data-testid="schema-json-textarea"
                      />
                    </div>
                  </div>
                  <button
                    onClick={saveSchema}
                    disabled={saving || !schemaJson}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    data-testid="save-schema-button"
                  >
                    {saving ? 'Saving...' : 'Save Schema'}
                  </button>
                </div>

                {editorFullscreen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                      <div className="flex items-center justify-between p-3 border-b">
                        <h4 className="font-medium">Schema JSON-LD (Fullscreen)</h4>
                        <button
                          type="button"
                          onClick={() => setEditorFullscreen(false)}
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          ✕ Close
                        </button>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex h-full">
                          <div className="bg-gray-100 p-3 text-right text-xs text-gray-500 font-mono select-none min-w-[3rem] border-r overflow-y-auto">
                            {schemaJson.split('\n').map((_, index) => (
                              <div key={index} className="leading-5">
                                {index + 1}
                              </div>
                            ))}
                          </div>
                          <textarea
                            value={schemaJson}
                            onChange={(e) => setSchemaJson(e.target.value)}
                            className="flex-1 p-3 font-mono text-sm outline-none leading-5"
                            style={{ height: 'calc(90vh - 100px)', lineHeight: '1.25rem', whiteSpace: 'pre' }}
                          />
                        </div>
                      </div>
                      <div className="p-3 border-t flex justify-end gap-2">
                        <button
                          onClick={() => setEditorFullscreen(false)}
                          className="px-3 py-2 border rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveSchema}
                          disabled={saving || !schemaJson}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? 'Saving…' : 'Save Schema'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Schema Actions */}
                {selectedPage.schema_body && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Schema Status</h3>
                    <div className="mb-4">
                      <span className="text-green-600 font-medium">✓ Schema Available</span>
                    </div>

                    {/* Review Actions */}
                    <div className="mt-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-2">Decision Notes</label>
                        <textarea
                          id="reviewNotes"
                          className="w-full p-2 border rounded-lg text-sm"
                          rows="3"
                          placeholder="Explain your approval or rejection decision (saved when you click Approve/Reject)..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          💡 These notes will be saved when you click Approve or Reject below
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const notes = document.getElementById('reviewNotes').value;
                            approveSchema(notes);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          ✅ Approve Schema
                        </button>
                        <button
                          onClick={() => {
                            const notes = document.getElementById('reviewNotes').value;
                            if (!notes.trim()) {
                              alert('Please add notes explaining why you are rejecting this schema.');
                              return;
                            }
                            rejectSchema(notes);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          ❌ Reject Schema
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Schema Available */}
                {!selectedPage.schema_body && (
                  <div className="mb-6">
                    <div className="mb-4">
                      <span className="text-red-600 font-medium">✗ No Schema Available</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      This page does not have any schema markup yet. An admin needs to create and submit a schema for your review.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Admin will analyze this page and create appropriate schema markup</li>
                        <li>• You'll receive a notification when the schema is ready for review</li>
                        <li>• You can then approve, reject, or request changes to the schema</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Review Status */}
                {selectedPage.reviewed_by && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Review Status</h3>
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Reviewed by:</span>
                          <div className="text-gray-900">{selectedPage.reviewer_name || selectedPage.reviewed_by}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Decision:</span>
                          <div className={`font-medium ${selectedPage.review_decision === 'approved' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {selectedPage.review_decision === 'approved' ? '✅ Approved' : '❌ Rejected'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Review Date:</span>
                          <div className="text-gray-900">
                            {selectedPage.reviewed_at ? new Date(selectedPage.reviewed_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Status:</span>
                          <div className={`px-2 py-1 rounded-full text-xs inline-block ${getStatusColor(selectedPage.status)}`}>
                            {selectedPage.status}
                          </div>
                        </div>
                      </div>
                      {selectedPage.review_notes && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="font-medium text-gray-600">Review Notes:</span>
                          <div className="text-gray-900 mt-1">{selectedPage.review_notes}</div>
                        </div>
                      )}
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
              </>
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
