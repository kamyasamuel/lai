import React, { useState, useCallback } from 'react';
import { compareDocumentsAPI } from './documentComparisonService';
import FileInput from '../../components/FileInput';
import LoadingIndicator from '../../components/LoadingIndicator';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { Upload, FileType } from 'lucide-react';

export default function DocumentComparisonInterface() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDraggingFile1, setIsDraggingFile1] = useState(false);
  const [isDraggingFile2, setIsDraggingFile2] = useState(false);

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setSubmitted(true);
    setLoading(true);
    const fd = new FormData();
    fd.append('file1', file1);
    fd.append('file2', file2);

    try {
      const comparisonResult = await compareDocumentsAPI(fd);
      setResult(comparisonResult);
    } catch(error) {
      setResult({ error: 'Error comparing documents: ' + error.toString() });
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers for file1
  const handleDragEnterFile1 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile1(true);
  }, []);

  const handleDragOverFile1 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeaveFile1 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile1(false);
  }, []);

  const handleDropFile1 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile1(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile1(e.dataTransfer.files[0]);
    }
  }, []);

  // Drag and drop handlers for file2
  const handleDragEnterFile2 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile2(true);
  }, []);

  const handleDragOverFile2 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeaveFile2 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile2(false);
  }, []);

  const handleDropFile2 = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile2(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile2(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-white page-container-padding">
      <div className={`w-full max-w-3xl space-y-4 overflow-y-auto ${result ? 'flex-1' : ''}`}>
        {result && (
          <div className="bg-[#111] p-4 rounded shadow relative">
            <h3 className="text-lg font-bold mb-2">Comparison Result</h3>
            {loading ? (
               <LoadingIndicator text="Comparing documents..." />
            ) : (
               <MarkdownRenderer content={result.comparisonResult || JSON.stringify(result, null, 2)} />
            )}
          </div>
        )}
        {!submitted && (
          <div className="text-center text-gray-400 mb-6">
            <h2 className="text-2xl font-bold mb-3">Document Comparison</h2>
            <p className="mb-2">Upload two documents to compare them using AI.</p>
          </div>
        )}
      </div>

      <div className={`w-full max-w-3xl mt-4 space-y-4 transition-all ${submitted ? 'mt-auto' : ''}`}>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">First Document:</label>
          {!file1 ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                isDraggingFile1 
                  ? 'border-[--tw-bg-color] bg-[rgba(140,0,204,0.05)]' 
                  : 'border-[#333] hover:border-[--tw-bg-color]'
              }`}
              onDragEnter={handleDragEnterFile1}
              onDragOver={handleDragOverFile1}
              onDragLeave={handleDragLeaveFile1}
              onDrop={handleDropFile1}
            >
              <div className="text-center">
                <Upload className="mx-auto mb-3 text-[#8c00cc]" size={32} />
                <h3 className="text-sm font-medium mb-2">
                  {isDraggingFile1 ? 'Drop your file here' : 'Drag & drop your first document here'}
                </h3>
                <p className="text-xs text-gray-400 mb-3">or use the file input below</p>
                <FileInput onChange={e => setFile1(e.target.files[0])} />
              </div>
            </div>
          ) : (
            <div className="bg-[#111] p-3 rounded-lg border border-[#333]">
              <div className="flex items-center">
                <FileType className="text-[#8c00cc] mr-3" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{file1.name}</p>
                  <p className="text-xs text-gray-400">{(file1.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  onClick={() => setFile1(null)}
                  className="text-gray-400 hover:text-white px-2 py-1 text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Second Document:</label>
          {!file2 ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                isDraggingFile2 
                  ? 'border-[--tw-bg-color] bg-[rgba(140,0,204,0.05)]' 
                  : 'border-[#333] hover:border-[--tw-bg-color]'
              }`}
              onDragEnter={handleDragEnterFile2}
              onDragOver={handleDragOverFile2}
              onDragLeave={handleDragLeaveFile2}
              onDrop={handleDropFile2}
            >
              <div className="text-center">
                <Upload className="mx-auto mb-3 text-[#8c00cc]" size={32} />
                <h3 className="text-sm font-medium mb-2">
                  {isDraggingFile2 ? 'Drop your file here' : 'Drag & drop your second document here'}
                </h3>
                <p className="text-xs text-gray-400 mb-3">or use the file input below</p>
                <FileInput onChange={e => setFile2(e.target.files[0])} />
              </div>
            </div>
          ) : (
            <div className="bg-[#111] p-3 rounded-lg border border-[#333]">
              <div className="flex items-center">
                <FileType className="text-[#8c00cc] mr-3" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{file2.name}</p>
                  <p className="text-xs text-gray-400">{(file2.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  onClick={() => setFile2(null)}
                  className="text-gray-400 hover:text-white px-2 py-1 text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button onClick={handleCompare}
                disabled={!file1 || !file2 || loading}
                className="mt-4 custom-button px-4 py-2 rounded w-full disabled:opacity-50">
          {loading ? 'Comparing...' : 'Compare Documents'}
        </button>
      </div>
    </div>
  );
}