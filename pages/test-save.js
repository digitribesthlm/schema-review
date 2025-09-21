import { useState } from 'react';

export default function TestSave() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSave = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('Starting test save...');
      
      const response = await fetch('/api/schema-workflow/save-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_id: '68cffde2f29e3a4d75305bb', // Use the actual page ID from MongoDB
          schema_body: '{"@context": "https://schema.org", "@type": "Product", "name": "Test Product"}',
          status: 'pending'
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (response.ok) {
        setResult('✅ SUCCESS: ' + responseText);
      } else {
        setResult('❌ ERROR: ' + response.status + ' - ' + responseText);
      }
    } catch (error) {
      console.error('Test save error:', error);
      setResult('❌ EXCEPTION: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Save API</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <button
            onClick={testSave}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Save API'}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Result:</h3>
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
