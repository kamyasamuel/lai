import React, { useState, useEffect, useCallback } from 'react'
import { FileBox, Download, Upload, FolderOpen } from 'lucide-react'
import API_BASE_URL from '../../config';
import LoadingIndicator from '../../components/LoadingIndicator';
import FileInput from '../../components/FileInput';
import { fetchUserDocumentsAPI } from './myDriveService';
import { uploadDriveDocumentAPI } from './myDriveUploadService';

export default function MyDriveInterface() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [userDocuments, setUserDocuments] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Load documents on component mount
  useEffect(() => {
    loadUserDocuments();
  }, []);

  const loadUserDocuments = useCallback(async () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    setLoading(true);
    setStatus('');
    
    try {
      const docs = await fetchUserDocumentsAPI(token);
      setUserDocuments(docs);
      
      if (docs.length === 0) {
        setStatus("Your drive is empty. Upload your first document to get started!");
      }
    } catch (err) {
      setStatus(`Error loading documents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = async () => {
    if (!fileToUpload) {
      setUploadStatus('Please select a file to upload.');
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    setUploading(true);
    setUploadStatus('');

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const result = await uploadDriveDocumentAPI(formData, token);
      setUploadStatus(`File uploaded successfully: ${result.filename}`);
      setFileToUpload(null);
      loadUserDocuments(); // Reload documents after upload
    } catch (err) {
      setUploadStatus(`Error uploading file: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center text-white page-container-padding">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <FolderOpen className="mr-3 text-[#8c00cc]" size={32} />
            My Drive
          </h1>
          <p className="text-gray-400">
            Your personal cloud storage for legal documents
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-[#111] border border-[#333] rounded-lg p-6 mb-8">
          <div className="text-center">
            <Upload className="mx-auto mb-4 text-[#8c00cc]" size={48} />
            <h3 className="text-xl font-semibold mb-4">Upload Documents</h3>
            
            <div className="max-w-md mx-auto">
              <FileInput onChange={e => setFileToUpload(e.target.files[0])} />
              
              {fileToUpload && (
                <div className="mt-3 p-3 bg-[#222] rounded border border-[#333]">
                  <p className="text-sm text-gray-300">Selected: {fileToUpload.name}</p>
                </div>
              )}
              
              <button
                onClick={handleFileUpload}
                disabled={!fileToUpload || uploading}
                className="mt-4 custom-button px-8 py-3 rounded-lg text-white disabled:opacity-50 w-full"
              >
                {uploading ? 'Uploading...' : 'Upload to Drive'}
              </button>
              
              {uploadStatus && (
                <p className={`mt-3 text-sm ${uploadStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {uploadStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-[#111] border border-[#333] rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6 text-center">Your Documents</h3>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingIndicator text="Loading your documents..." />
            </div>
          ) : userDocuments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {userDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-[--tw-bg-color] transition-all duration-200 hover:shadow-lg"
                >
                  <div className="text-center">
                    <FileBox size={48} className="text-[#8c00cc] mx-auto mb-3" />
                    <h4 className="font-medium mb-3 text-sm break-words">
                      {doc.filename}
                    </h4>
                    <a
                      href={`${API_BASE_URL}/user-uploads/${doc.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm px-3 py-2 border border-[--tw-bg-color] bg-[transparent] hover:bg-[#111] rounded-md transition-colors"
                      download
                    >
                      <Download size={16} className="mr-2" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileBox size={64} className="text-gray-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2 text-gray-400">No documents yet</h4>
              <p className="text-gray-500">
                Upload your first document using the form above to get started!
              </p>
            </div>
          )}
        </div>

        {status && !loading && (
          <div className="mt-6 text-center">
            <div className="inline-block bg-[#222] border border-[#333] px-4 py-2 rounded-lg text-gray-300">
              {status}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}