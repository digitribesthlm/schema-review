import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Dashboard() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [user, setUser] = useState(null);
  const [langFilter, setLangFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) fetchPages();
  }, [langFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        fetchPages();
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (langFilter !== 'all') params.set('lang', langFilter);
      const response = await fetch(`/api/schema-workflow/pages?${params}`);
      const data = await response.json();

      setPages(data);
      setStats({
        total: data.length,
        with_schema: data.filter(p => p.schema_body).length,
        pending: data.filter(p => p.status === 'pending').length,
        approved: data.filter(p => p.status === 'approved').length
      });
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueLanguages = () => {
    const langs = new Set();
    pages.forEach(p => {
      if (p.page_language && Array.isArray(p.page_language)) {
        p.page_language.forEach(l => langs.add(l));
      }
    });
    return [...langs].sort();
  };

  const getLangLabel = (langCode) => {
    const labels = {
      en: 'EN', nl: 'NL', de: 'DE', fr: 'FR', es: 'ES', it: 'IT',
      pt: 'PT', ru: 'RU', zh: 'ZH', ja: 'JA', ko: 'KO', ar: 'AR',
      tr: 'TR', pl: 'PL', sv: 'SV', da: 'DA', no: 'NO', fi: 'FI'
    };
    return labels[langCode] || langCode.toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Schema Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.with_schema}</div>
              <div className="text-sm text-gray-600">With Schema</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>

          {/* Simple Page List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-medium">Pages</h2>
              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                <option value="all">All Languages</option>
                {uniqueLanguages().map(lang => (
                  <option key={lang} value={lang}>{getLangLabel(lang)}</option>
                ))}
              </select>
            </div>
            <div className="divide-y">
              {pages.map((page) => (
                <div 
                  key={page._id}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => router.push(`/schema-workflow?page=${page._id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {page.page_title || 'Untitled Page'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {page.url}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                      {page.status || 'next'}
                    </span>
                    {page.page_language && page.page_language.length > 0 && page.page_language.map(l => (
                      <span key={l} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                        {getLangLabel(l)}
                      </span>
                    ))}
                    {page.schema_body && (
                      <span className="text-green-600 text-sm">✓ Schema</span>
                    )}
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
