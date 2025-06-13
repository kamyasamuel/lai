import React, { useState } from 'react';
import DragAndDropFileInput from '../../components/DragAndDropFileInput';
import { FileBox } from 'lucide-react';

export default function FileSummarizerInterface() {
  const [file, setFile] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  
  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };
  
  const handleSubmit = async () => {
    if (!file) return;
    
    setSummarizing(true);
    // Process the file...
  };
  
  return (
    <div className="min-h-full flex flex-col items-center justify-center text-white page-container-padding">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Document Summarizer</h1>
          <p className="text-gray-400">Upload your document to generate a concise summary</p>
        </div>
        
        {/* File Input Section */}
        <div className="bg-[#111] border border-[#333] rounded-lg p-6 mb-8">
          <DragAndDropFileInput 
            onFileSelect={handleFileSelect} 
            acceptedFileTypes=".pdf,.docx,.doc,.txt" 
          />
          
          {file && (
            <div className="mt-4 p-3 bg-[#222] rounded border border-[#333] flex items-center">
              <FileBox className="text-[#8c00cc] mr-3" size={24} />
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
            disabled={!file || summarizing}
            className="mt-4 custom-button px-8 py-3 rounded-lg text-white disabled:opacity-50 w-full"
          >
            {summarizing ? 'Summarizing...' : 'Generate Summary'}
          </button>
        </div>
        
        {/* Results Section */}
        {/* ...your existing results UI */}
      </div>
    </div>
  );
}