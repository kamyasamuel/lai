import React, { useState, useEffect, useCallback } from 'react';
import { fetchDocumentsAPI } from './documentLibraryService';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Search, FileText, Download, Folder, MoreVertical } from 'lucide-react';
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
      // The API now returns objects with name and url properties
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

  // Dummy folders for Dropbox/Google Drive feel
  const folders = [
    { name: 'Project Documents', fileCount: 5 },
    { name: 'Legal Agreements', fileCount: 3 },
    { name: 'Reports', fileCount: 8 },
  ];

  return (
    <div className="h-full flex flex-col text-white bg-[#0a0a0a] page-container-padding gap-6">
      {/* Header and Search */}
      <div className="flex flex-col items-center w-full pt-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Document Library</h1>
        <p className="text-gray-400 mb-6 text-center">Search, browse, and download documents.</p>
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full p-4 pl-12 bg-[#1a1a1a] border border-[#333] rounded-full focus:ring-orange-500 focus:border-orange-500"
            value={searchTerm}
            onChange={handleInputChange}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Document Listing Section */}
      <div className="flex-1 overflow-y-auto pt-8">
        {loading && <LoadingIndicator text="Loading documents..." />}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}

        {!loading && !error && (
          <div>
            {/* The documents will need categorizing for better display */}
            {/* Folders Section - for the "Google Drive" feel }
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-300">Folders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map(folder => (
                  <div key={folder.name} className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333] hover:border-orange-500 transition-colors cursor-pointer flex items-center gap-4">
                    <Folder size={24} className="text-orange-400" />
                    <div>
                      <p className="font-medium">{folder.name}</p>
                      <p className="text-sm text-gray-500">{folder.fileCount} files</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>**/}

            {/* Files Section */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-300">Files</h2>
              <div className="bg-[#1a1a1a] rounded-lg border border-[#333]">
                <ul className="divide-y divide-[#333]">
                  {/* Header */}
                  <li className="flex items-center justify-between py-2 px-3 text-sm font-medium text-gray-400">
                    <div className="w-2/5">Name</div>
                    <div className="w-1/5 text-center"></div>
                    <div className="w-1/5 text-center"></div>
                    <div className="w-1/5 text-right">Action</div>
                  </li>

                  {documents.length > 0 ? (
                    documents.map((doc, index) => (
                      <li key={index} className="flex items-center justify-between py-2 px-3 hover:bg-[#222] transition-colors">
                        <div className="flex items-center gap-2 w-2/5">
                          <FileText size={18} className="text-gray-400 flex-shrink-0" />
                          <span className="font-medium truncate">{doc.name}</span>
                        </div>
                        <div className="w-1/5 text-center text-gray-500"></div>
                        <div className="w-1/5 text-center text-gray-500"></div>
                        <div className="w-1/5 flex justify-end items-center gap-1">
                           <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-1.5 text-sm bg-[#333] hover:bg-orange-600 rounded-md"
                            download
                          >
                            <Download size={14} />
                          </a>
                          <button className="p-1.5 text-sm bg-[#333] hover:bg-orange-600 rounded-md">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-gray-500 py-8">
                      <p>No documents found.</p>
                      {debouncedSearchTerm && <p>Try adjusting your search.</p>}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentLibraryInterface;
