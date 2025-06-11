import React, { useState } from 'react';
import { analyseContractAPI, chatWithContractAPI } from './contractAnalysisService';
import FileUploader from '../fileUploader/FileUploaderTool';
import LoadingIndicator from '../../components/LoadingIndicator';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import ChatInterface from '../chat/ChatInterface'; // Assuming a generic chat interface component

function ContractAnalysisInterface() {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isChatActive, setIsChatActive] = useState(false);

  const handleFileAnalysis = async (file) => {
    if (!file) {
      setError('Please select a file for analysis.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis('');
    setFileName(file.name);
    setConversationHistory([]);
    setIsChatActive(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await analyseContractAPI(formData);
      setAnalysis(result.analysis);
      setConversationHistory([{ role: 'assistant', content: result.analysis }]);
      setIsChatActive(true);
    } catch (e) {
      setError(e.message || 'Failed to analyze the contract.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (prompt) => {
    setLoading(true);
    try {
      const result = await chatWithContractAPI(prompt, conversationHistory);
      setConversationHistory(prev => [...prev, { role: 'user', content: prompt }, { role: 'assistant', content: result.response }]);
    } catch (e) {
      setError(e.message || 'Failed to get a response from the chat.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row text-white bg-[#0a0a0a] page-container-padding gap-6">
      {/* Left side: File upload and analysis */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Contract Analyzer</h1>
          <p className="text-gray-400">
            Upload a contract to identify key clauses, potential risks, and obligations.
          </p>
        </div>

        {/* File Uploader */}
        <div className="flex justify-center">
          <FileUploader
            onFileUpload={handleFileAnalysis}
            uploadButtonText="Analyze Contract"
            acceptedFileTypes={{
              'application/pdf': ['.pdf'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            }}
          />
        </div>

        {/* Analysis Display */}
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
          {loading && !isChatActive && <LoadingIndicator text={`Analyzing ${fileName}...`} />}
          {error && <p className="text-red-500 text-center">Error: {error}</p>}
          
          {!loading && analysis && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Analysis of {fileName}</h2>
              <MarkdownRenderer content={analysis} />
            </div>
          )}

          {!loading && !analysis && !error && (
            <div className="text-center text-gray-500">
              <p>Your contract analysis will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Chat interface */}
      {isChatActive && (
        <div className="flex-1 flex flex-col bg-[#1a1a1a] rounded-lg border border-[#333]">
          <div className="p-4 border-b border-[#333]">
            <h2 className="text-xl font-bold text-center">Chat with your Contract</h2>
          </div>
          <ChatInterface
            messages={conversationHistory}
            onSendMessage={handleChatSubmit}
            isLoading={loading}
            placeholder="Ask questions about the contract..."
          />
        </div>
      )}
    </div>
  );
}

export default ContractAnalysisInterface;
