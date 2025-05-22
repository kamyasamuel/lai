import React, { useState, useEffect } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Search } from 'lucide-react';

function DocumentLibraryInterface() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch initial documents on component mount
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://your-document-server.com/documents');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (e) {
      setError('Failed to fetch documents.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`https://your-document-server.com/documents?search=${searchTerm}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (e) {
      setError('Failed to perform search.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Document Library</h2>
      <div className="flex items-center mb-4">
        <input
          type="text" placeholder="Search documents..."
          className="p-3 gap-2 flex br-2 rounded-l bg-[#111] text-white border border-[#333]"
          value={searchTerm}
          onChange={handleInputChange}
        />
        <Search onClick={handleSearch} className="hover-cursor scale-1" />
      </div>
      {loading && <LoadingIndicator text="Loading..." />}
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="space-y-2">
        {searchResults.map((doc, index) => (
          <div key={index} className="bg-[#222] p-3 rounded border border-[#333]">
            <a href={doc.link} target="_blank" rel="noopener noreferrer" className="text-[#8c00cc] underline">
              {doc.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DocumentLibraryInterface;