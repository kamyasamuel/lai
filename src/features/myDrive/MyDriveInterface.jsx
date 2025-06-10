import React, { useState, useEffect, useCallback } from 'react'
import { connectDrive } from './driveService'
import { FileBox, Link as LinkIcon, Download, Eye, Upload } from 'lucide-react'
import API_BASE_URL from '../../config';
import { fetchDocumentsAPI } from '../documentLibrary/documentLibraryService';
import LoadingIndicator from '../../components/LoadingIndicator';
import FileInput from '../../components/FileInput';
import { uploadDriveDocumentAPI } from './myDriveUploadService';

export default function MyDriveInterface() {
  // status message shown below the buttons
  const [status, setStatus] = useState('')
  // name of the provider currently loading (or empty string)
  const [loading, setLoading] = useState(false)
  const [legalAiAfricaFiles, setLegalAiAfricaFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setStatus('');
    try {
      const docs = await fetchDocumentsAPI(); // Fetch all documents
      setLegalAiAfricaFiles(docs);
      setStatus('Documents loaded.');
    } catch (err) {
      setStatus(`Error loading documents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleFileUpload = async () => {
    if (!fileToUpload) {
      setUploadStatus('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadStatus('');

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const result = await uploadDriveDocumentAPI(formData);
      setUploadStatus(`File uploaded successfully: ${result.filename}`);
      setFileToUpload(null); // Clear the selected file
      loadDocuments(); // Reload documents after upload
    } catch (err) {
      setUploadStatus(`Error uploading file: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    // Main container with padding and centering
    <div className="flex flex-col items-center text-white page-container-padding">
      {/* Title and description */}
      <h2 className="text-xl font-semibold mb-2">My Drive</h2>
      <p className="text-gray-400 text-sm mb-4">
        Your personal cloud storage for legal documents.
      </p>

      {/* Upload Section */}
      <div className="w-full max-w-2xl mb-6 p-4 bg-[#1a1a1a] rounded-lg shadow-lg flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-3 border-b border-[#333] pb-2 w-full text-center">
          Upload Documents
        </h3>
        <FileInput onChange={e => setFileToUpload(e.target.files[0])} />
        <button
          onClick={handleFileUpload}
          disabled={!fileToUpload || uploading}
          className="mt-4 custom-button px-6 py-2 rounded text-white disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload to Drive'}
        </button>
        {uploadStatus && <p className="mt-2 text-sm text-gray-300">{uploadStatus}</p>}
      </div>

      {/* Display Legal AI Africa files */}
      {loading ? (
        <LoadingIndicator text="Loading your documents..." />
      ) : legalAiAfricaFiles.length > 0 ? (
        <div className="w-full max-w-2xl mt-6 p-4 bg-[#1a1a1a] rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 border-b border-[#333] pb-2">
            Your Legal AI Africa Cloud Drive
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {legalAiAfricaFiles.map((filename, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-between bg-[#2a2a2a] border border-[#333] p-4 rounded-lg shadow-md hover:border-orange-500 transition-colors"
              >
                <FileBox size={48} className="text-orange-400 mb-2" />
                <span className="text-center text-sm font-medium mb-3 truncate w-full">{filename}</span>
                <div className="flex gap-2">
                  <a
                    href={`${API_BASE_URL}/uploads/${filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-gray-400 hover:text-orange-500"
                    download
                  >
                    <Download size={16} className="mr-1" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p>No documents found in your drive.</p>
          <p>Upload new documents above to get started!</p>
        </div>
      )}

      {/* Status message */}
      {status && !loading && (
        <div className="text-sm text-gray-300 bg-[#222] border border-[#333]
                        px-4 py-2 rounded max-w-md text-center mt-4">
          {status}
        </div>
      )}
    </div>
  )
}