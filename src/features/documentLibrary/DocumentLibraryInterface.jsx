import React, { useState, useEffect, useCallback } from 'react';
import { fetchDocumentsAPI } from './documentLibraryService';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Search, FileText, Download } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import API_BASE_URL from '../../config';

function DocumentLibraryInterface() {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchDocuments = useCallback(async (search) => {
    setLoading(true);
    setError(null);
    try {
      const docs = await fetchDocumentsAPI(search);
      setDocuments(docs);
    } catch (e) {
      setError(e.message || 'Failed to fetch documents.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchDocuments]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="h-full flex flex-col md:flex-row text-white bg-[#0a0a0a] page-container-padding gap-6">
      {/* Document Listing Section */}
      <div className="flex-1 overflow-y-auto pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Available Documents</h1>
          <p className="text-gray-400">Browse and download from the document library.</p>
        </div>

        {loading && <LoadingIndicator text="Loading documents..." />}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}

        {!loading && !error && (
          <ul className="space-y-3">
            {documents.length > 0 ? (
              documents.map((doc, index) => (
                <li key={index} className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-lg border border-[#333] hover:border-orange-500 transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText size={20} className="text-orange-400" />
                    <span className="font-medium">{doc}</span>
                  </div>
                  <a
                    href={`${API_BASE_URL}/uploads/${doc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 text-sm bg-[#333] hover:bg-[#444] rounded-md"
                    download
                  >
                    <Download size={16} />
                  </a>
                </li>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                <p>No documents found.</p>
                {debouncedSearchTerm && <p>Try adjusting your search.</p>}
              </div>
            )}
          </ul>
        )}
      </div>

      {/* Divider */}
      <div className="border-l border-gray-700 hidden md:block"></div>
      <hr className="border-t border-gray-700 my-6 md:hidden" />

      {/* Search Section */}
      <div className="flex flex-col items-center pt-8 md:w-2/5">
        <h1 className="text-2xl font-bold mb-2 text-center">Search Document Library</h1>
        <p className="text-gray-400 mb-6 text-center">Find documents by name.</p>
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search documents by name..."
            className="w-full p-3 pl-12 bg-[#1a1a1a] border border-[#333] rounded-lg focus:ring-orange-500 focus:border-orange-500"
            value={searchTerm}
            onChange={handleInputChange}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
    </div>
  );
}

export default DocumentLibraryInterface;
