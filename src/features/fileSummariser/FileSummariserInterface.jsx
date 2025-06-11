import React, { useState } from 'react';
import { summariseFileAPI } from './fileSummariserService';
import FileUploader from '../fileUploader/FileUploaderTool';
import LoadingIndicator from '../../components/LoadingIndicator';
import MarkdownRenderer from '../../components/MarkdownRenderer';

function FileSummariserInterface() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileSummary = async (file) => {
    if (!file) {
      setError('Please select a file to summarize.');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary('');
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await summariseFileAPI(formData);
      setSummary(result.summary);
    } catch (e) {
      setError(e.message || 'Failed to summarize the file.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col text-white bg-[#0a0a0a] page-container-padding">
      {/* Header */}
      <div className="text-center pt-8">
        <h1 className="text-3xl font-bold mb-2">File Summarizer</h1>
        <p className="text-gray-400">
          Upload any document to get a concise summary of its contents.
        </p>
      </div>

      {/* File Uploader */}
      <div className="flex justify-center py-8">
        <FileUploader
          onFileUpload={handleFileSummary}
          uploadButtonText="Summarize Document"
          acceptedFileTypes={{
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
          }}
        />
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
        {loading && <LoadingIndicator text={`Summarizing ${fileName}...`} />}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}
        
        {!loading && !error && summary && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Summary of {fileName}</h2>
            <MarkdownRenderer content={summary} />
          </div>
        )}
        
        {!loading && !summary && !error && (
          <div className="text-center text-gray-500">
            <p>Your document summary will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileSummariserInterface;
