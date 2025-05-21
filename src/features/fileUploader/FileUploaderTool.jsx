import React, { useState } from 'react';
import { uploadDocumentAPI } from './uploaderService';

export default function FileUploaderTool({ title }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const fd=new FormData(); fd.append('file', file);
    try {
      const data = await uploadDocumentAPI(title, fd);
      setResult(data);
    } catch {
      setResult({ error:'Failed to analyze the document.' });
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-4">
      <div className="flex-1 w-full max-w-3xl space-y-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-400 mb-4 text-center">
        Upload a legal document for processing and analysis.
      </p>
      <button onClick={handleUpload}
              className="custom-button px-4 py-2 rounded text-white mt-4">
        {loading?'Analyzing...':'Analyze'}
      </button>
      {result && (
        <div className="mt-4 bg-[#1a1a1a] border border-[#333] p-4 rounded">
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
      <div className={`w-full max-w-3xl mt-4 transition-all ${result ? 'mt-auto' : ''}`}>
        <input type="file" onChange={handleFileChange}
               className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                          file:rounded file:border-0 file:text-sm file:font-semibold
                          file:bg-[#8c00cc] file:text-white hover:file:bg-[#a02cd0]"/>
      </div>
    </div>
  );
}