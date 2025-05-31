import React, { useState } from 'react';
import { analyzeContractAPI } from './contractAnalysisService'; // Assuming analyzeContractAPI now points to the new domain internally
import FileInput from '../../components/FileInput'; 
import LoadingIndicator from '../../components/LoadingIndicator'; // Assuming a loading indicator component

export default function ContractAnalysisInterface() {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  var filename = null; // To store filename for download, if applicable

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitted(true);
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      // Assuming analyzeContractAPI exists and returns an object with a 'analysis' key
      const analysisResult = await analyzeContractAPI(fd);
      const analysis = analysisResult.analysis;
      filename = analysisResult.filename; // Assuming filename is also returned
      setOutput(analysis || 'No analysis returned.');
    } catch(error) {
      setOutput('Error analyzing contract: ' + error.toString());
    } finally {
      setLoading(false);
    }
  };

  // Optional: Handle download of the analysis result
  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type:'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'contract_analysis_result'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-4">
      <div className="flex-1 w-full max-w-3xl space-y-4 overflow-y-auto">
        {output && (
          <div className="bg-[#2a2a2a] p-4 rounded shadow relative">
            <h3 className="text-lg font-bold mb-2">Contract Analysis Result</h3>
            {loading ? (
               <LoadingIndicator text="Analyzing contract..." />
            ) : (
               <div id='contract-analysis-output' dangerouslySetInnerHTML={{ __html: output }}></div>
            )}

            {/* Download button - uncomment if download is needed */}
            {/*
            <button onClick={handleDownload}
              className="absolute top-4 right-4 flex items-center gap-1 text-sm custom-button
                         px-3 py-1 rounded hover:bg-[#a02cd0]">
              Download
            </button>
            */}
          </div>
        )}
        {!submitted && (
          <div className="text-center text-gray-400 mb-6">
            <p className="mb-2">Upload a contract document for AI analysis.</p>
          </div>
        )}
      </div>

      <div className={`w-full max-w-3xl mt-4 transition-all ${submitted ? 'mt-auto' : ''}`}>
        <FileInput onChange={e => setFile(e.target.files[0])} />
        <button onClick={handleSubmit}
                disabled={!file || loading}
                className="mt-2 custom-button px-4 py-2 rounded w-full disabled:opacity-50">
          {loading ? 'Analyzing...' : 'Analyze Contract'}
        </button>
      </div>
    </div>
  );
}