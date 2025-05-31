import React, { useState } from 'react';
import { compareDocumentsAPI } from './documentComparisonService'; // Assuming a new service
import FileInput from '../../components/FileInput';
import LoadingIndicator from '../../components/LoadingIndicator'; // Assuming a loading indicator component

export default function DocumentComparisonInterface() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCompare = async () => {
    if (!file1 || !file2) return; // Ensure both files are selected
    setSubmitted(true);
    setLoading(true);
    const fd = new FormData();
    fd.append('file1', file1);
    fd.append('file2', file2);

    try {
      // Assuming compareDocumentsAPI exists and returns a comparison result object
      const comparisonResult = await fetch('https://lawyers.legalaiafrica.com/api/compareDocuments', { method: 'POST', body: fd }).then(res => res.json());
      setResult(comparisonResult);
    } catch(error) {
      setResult({ error: 'Error comparing documents: ' + error.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-4">
      <div className="flex-1 w-full max-w-3xl space-y-4 overflow-y-auto">
        {result && (
          <div className="bg-[#2a2a2a] p-4 rounded shadow relative">
            <h3 className="text-lg font-bold mb-2">Comparison Result</h3>
            {loading ? (
               <LoadingIndicator text="Comparing documents..." />
            ) : (
               <pre className="whitespace-pre-wrap text-sm">
                 {JSON.stringify(result, null, 2)}
               </pre>
            )}
          </div>
        )}
        {!submitted && (
          <div className="text-center text-gray-400 mb-6">
            <p className="mb-2">Upload two documents to compare them using AI.</p>
          </div>
        )}
      </div>

      <div className={`w-full max-w-3xl mt-4 space-y-4 transition-all ${submitted ? 'mt-auto' : ''}`}>
        <div>
          <label className="block text-sm font-medium text-gray-300">First Document:</label>
          <FileInput onChange={e => setFile1(e.target.files[0])} />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-300">Second Document:</label>
          <FileInput onChange={e => setFile2(e.target.files[0])} />
        </div>
        <button onClick={handleCompare}
                disabled={!file1 || !file2 || loading}
                className="mt-2 custom-button px-4 py-2 rounded w-full disabled:opacity-50">
          {loading ? 'Comparing...' : 'Compare Documents'}
        </button>
      </div>
    </div>
  );
}