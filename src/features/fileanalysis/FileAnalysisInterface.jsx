import React, { useState, useCallback } from 'react';
import { analyzeFileAPI } from './fileAnalysisService';
import FileInput from '../../components/FileInput';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { Upload, FileType } from 'lucide-react';

export default function FileAnalysisInterface() {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-white page-container-padding">
      <div className={`w-full max-w-3xl space-y-4 overflow-y-auto ${output ? 'flex-1' : ''}`}>
        {output && (
          <div className="bg-[#111] p-4 rounded shadow relative">
            <h3 className="text-lg font-bold mb-2">AI Analysis</h3>
            <MarkdownRenderer content={output} />
            <button onClick={handleDownload}
              className="absolute top-4 right-4 flex items-center gap-1 text-sm custom-button
                         px-3 py-1 rounded">
              Download
            </button>
          </div>
        )}
        {!submitted && (
          <div className="text-center text-gray-400 mb-6">
            <h2 className="text-2xl font-bold mb-3">Document Analysis</h2>
            <p className="mb-2">Upload a PDF or Word document for AI analysis and summarization.</p>
          </div>
        )}
      </div>

      <div className={`w-full max-w-3xl mt-4 transition-all ${submitted ? 'mt-auto' : ''}`}>
        {!file ? (
          <div 
            className={`border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
              isDragging 
                ? 'border-[--tw-bg-color] bg-[rgba(140,0,204,0.05)]' 
                : 'border-[#333] hover:border-[--tw-bg-color]'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="mx-auto mb-4 text-[#8c00cc]" size={48} />
              <h3 className="text-lg font-medium mb-2">
                {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
              </h3>
              <p className="text-sm text-gray-400 mb-4">or use the file input below</p>
              <FileInput onChange={e => setFile(e.target.files[0])} />
              <p className="mt-3 text-xs text-gray-500">Supported formats: PDF, DOCX, DOC</p>
            </div>
          </div>
        ) : (
          <div className="bg-[#111] p-4 rounded-lg border border-[#333]">
            <div className="flex items-center mb-3">
              <FileType className="text-[#fff] mr-3" size={24} />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-white px-2 py-1"
              >
                Change
              </button>
            </div>
            <button onClick={handleSubmit}
                    disabled={loading}
                    className="mt-2 custom-button px-4 py-2 rounded w-full disabled:opacity-50">
              {loading ? 'Analyzing...' : 'Submit for Analysis'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}