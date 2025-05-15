import React, { useState } from 'react';
import { uploadDocumentAPI } from './uploaderService';
import FileInput from '../../components/FileInput';

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

  return (
    <div className="p-6 text-white max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-400 mb-4">
        Upload a legal document for processing and AI analysis.
      </p>
      <FileInput onChange={e=>setFile(e.target.files[0])}/>
      <button onClick={handleUpload}
              className="bg-[#8c00cc] px-4 py-2 rounded text-white mt-4">
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
  );
}