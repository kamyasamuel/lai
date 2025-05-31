/*import React, { useState } from 'react';
import { analyzeFileAPI } from './fileAnalysisService';
import FileInput from '../../components/FileInput';

export default function FileAnalysisInterface() {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  var filename = null;

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitted(true);
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const analysis = await analyzeFileAPI(fd);
      const summary = analysis.summary 
      filename = analysis.filename;
      setOutput(summary || 'No summary returned.');
    } catch(error) {
      setOutput(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type:'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.txt`; a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    
    <div className="flex flex-col items-center justify-center h-full text-white p-4">
      <div className="flex-1 w-full max-w-3xl space-y-4 overflow-y-auto">
        {output && (
          <div className="bg-[#2a2a2a] p-4 rounded shadow relative">
            <h3 className="text-lg font-bold mb-2">AI Analysis</h3>
            <div id='analysis' dangerouslySetInnerHTML={{ __html: output }}></div>
            <button onClick={handleDownload} 
              className="absolute top-4 right-4 flex items-center gap-1 text-sm custom-button
                         px-3 py-1 rounded hover:bg-[#a02cd0]">
              Download
            </button>
          </div>
        )}
        {!submitted && (
          <div className="text-center text-gray-400 mb-6">
            <p className="mb-2">Upload a PDF or Word document for AI analysis and summarization.</p>
          </div>
        )}
      </div>

      <div className={`w-full max-w-3xl mt-4 transition-all ${submitted ? 'mt-auto' : ''}`}>
        <FileInput onChange={e=>setFile(e.target.files[0])} />
        <button onClick={handleSubmit}
                disabled={!file||loading}
                className="mt-2 bg-[#8c00cc] px-4 py-2 rounded w-full disabled:opacity-50">
          {loading ? 'Analyzing...' : 'Submit for Analysis'}
        </button>
      </div>
    </div>
  );
}*/

import React, { useState } from 'react';
import { analyzeFileAPI } from './fileAnalysisService';
import FileInput from '../../components/FileInput';

export default function FileAnalysisInterface() {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  var filename = null;

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitted(true);
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const analysis = await analyzeFileAPI(fd);
      const summary = analysis.summary;
      filename = analysis.filename;
      setOutput(summary || 'No summary returned.');
    } catch(error) {
      setOutput(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type:'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-4">
      <div className="flex-1 w-full max-w-3xl space-y-4 overflow-y-auto">
        {output && (
          <div className="bg-[#2a2a2a] p-4 rounded shadow relative">
            <h3 className="text-lg font-bold mb-2">AI Analysis</h3>
            <div id='analysis' dangerouslySetInnerHTML={{ __html: output }}></div>
            <button onClick={handleDownload}
              className="absolute top-4 right-4 flex items-center gap-1 text-sm custom-button
                         px-3 py-1 rounded hover:bg-[#a02cd0]">
              Download
            </button>
          </div>
        )}
        {!submitted && (
          <div className="text-center text-gray-400 mb-6">
            <p className="mb-2">Upload a PDF or Word document for AI analysis and summarization.</p>
          </div>
        )}
      </div>

      <div className={`w-full max-w-3xl mt-4 transition-all ${submitted ? 'mt-auto' : ''}`}>
        <FileInput onChange={e => setFile(e.target.files[0])} />
        <button onClick={handleSubmit}
                disabled={!file||loading}
                className="mt-2 custom-button px-4 py-2 rounded w-full disabled:opacity-50">
          {loading ? 'Analyzing...' : 'Submit for Analysis'}
        </button>
      </div>
    </div>
  );
}