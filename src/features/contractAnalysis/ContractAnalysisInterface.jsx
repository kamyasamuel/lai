import React, { useState } from 'react';
import DragAndDropFileInput from '../../components/DragAndDropFileInput';
import { FileBox } from 'lucide-react';
import { analyzeContractAPI } from './contractAnalysisService';
import LoadingIndicator from '../../components/LoadingIndicator'; // Assuming a loading indicator component
import MarkdownRenderer from '../../components/MarkdownRenderer';

export default function ContractAnalysisInterface() {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  var filename = null; // To store filename for download, if applicable

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    // Reset any previous results or errors
  };

  const handleSubmit = async () => {
    if (!file) return;

    setSubmitted(true);
    setAnalyzing(true);
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      // Assuming analyzeContractAPI exists and returns an object with a 'analysis' key
      const analysisResult = await analyzeContractAPI(fd);
      const analysis = analysisResult.analysis;
      filename = analysisResult.filename; // Assuming filename is also returned
      setOutput(analysis || 'No analysis returned.');
    } catch (error) {
      setOutput('Error analyzing contract: ' + error.toString());
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  // Optional: Handle download of the analysis result
  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'contract_analysis_result'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center text-white page-container-padding">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Contract Analysis</h1>
          <p className="text-gray-400">Upload your contract for detailed analysis and recommendations</p>
        </div>

        {/* File Input Section */}
        <div className="bg-[#111] border border-[#222] rounded-lg p-6 mb-8">
          <DragAndDropFileInput
            onFileSelect={handleFileSelect}
            acceptedFileTypes=".pdf,.docx,.doc"
          />

          {file && (
            <div className="mt-4 p-3 bg-[#222] rounded border border-[#333] flex items-center">
              <FileBox className="text-[#fff] mr-3" size={24} />
              <p className="text-sm text-gray-300 flex-grow">{file.name}</p>
              <button
                className="text-gray-400 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
              >
                Remove
              </button>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || analyzing}
            className="mt-4 custom-button px-8 py-3 rounded-lg text-white disabled:opacity-50 w-full"
          >
            {analyzing ? 'Analyzing Contract...' : 'Analyze Contract'}
          </button>
        </div>

        {/* Analysis Results Section */}
        <div className={`w-full max-w-3xl space-y-4 overflow-y-auto ${output ? 'flex-1' : ''}`}>
          {output && (
            <div className="bg-[#2a2a2a] p-4 rounded shadow relative">
              <h3 className="text-lg font-bold mb-2">Contract Analysis Result</h3>
              {loading ? (
                <LoadingIndicator text="Analyzing contract..." />
              ) : (
                <MarkdownRenderer content={output} />
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
            <div className="text-center text-gray-400 mb-6 w-full">
              <p className="mb-2">Upload a contract document for AI analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}