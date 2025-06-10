import React, { useState, useEffect, useRef } from 'react';
import { queryAPI } from './QueryService';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Search } from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { useQueryHistory } from './useQueryHistory';

const useCases = {
  'Laws & Regulations': [
    'Search the Ugandan Data Protection Act 2023.',
    'Get all regulations on land use from Ghana.',
    'List recent updates on consumer protection in Kenya.'
  ],


  'Case Law': [
    'Find precedent cases on wrongful dismissal in Uganda.',
    'Locate Ugandan Supreme Court judgments on contract breach.',
    'Explore Ugandan rulings on freedom of expression.'
  ]
};

export default function QueryInterface({ title }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useQueryHistory(title);
  const [loading, setLoading] = useState(false);
  const endOfResultsRef = useRef(null);

  useEffect(() => {
    endOfResultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results, loading]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const { results: res } = await queryAPI(title, searchQuery);
      setResults((prevResults) => [
        ...prevResults,
        { query: searchQuery, data: res, timestamp: Date.now() },
      ]);
    } catch (e) {
      setResults((prevResults) => [
        ...prevResults,
        { query: searchQuery, data: [{ title: 'Error', snippet: e.message }], timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
      setQuery(''); // Clear the input field after search
    }
  };

  const searchBar = (
    <div className="flex gap-2 center-items w-full max-w-2xl">
      <input
        value={query}
        onChange={e=>setQuery(e.target.value)}
        onKeyDown={e=>e.key==='Enter'&&handleSearch()}
        className="flex-1 p-3 br-2 rounded-l bg-[#111] text-white border border-[#333]"
        placeholder={`Search ${title.toLowerCase()}...`}
      />
      <Search onClick={()=>handleSearch()} className='hover-cursor scale-1' />
    </div>
  );

  return (
    <div className="flex flex-col h-full text-white page-container-padding">
      {/* Main content area for results */}
      <div className="flex-1 w-full max-w-3xl mx-auto space-y-4 overflow-y-auto scrollbar-hide">
        {results.length === 0 && !loading && (
          <div className="flex-1 flex flex-col justify-center items-center text-center h-full">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-gray-400 text-sm mb-4">
              Use AI to explore {title.toLowerCase()} across jurisdictions.
            </p>
          </div>
        )}

        {/* Display up to last 3 results */}
        {results.length > 0 &&
          results.slice(-3).map((entry, entryIndex) => (
            <div key={entryIndex} className="p-4 rounded bg-[#111]">
              <h3 className="text-lg font-semibold mb-2">Search Query: "{entry.query}"</h3>
              {entry.data?.length > 0 ? (
                entry.data.map((r, i) => (
                  <div key={i} className="mb-4 last:mb-0 p-3 rounded bg-[#1a1a1a]">
                    <h4 className="text-md font-semibold mb-1">
                      {r.title}
                      {r.jurisdiction && r.year && (
                        <span className="text-xs text-gray-400">
                          ({r.jurisdiction}, {r.year})
                        </span>
                      )}
                    </h4>
                    <div className="text-sm text-gray-300 mb-2">
                      <MarkdownRenderer content={r.snippet} />
                    </div>
                    {r.link && r.link !== '#' && (
                      <a href={r.link} target="_blank" rel="noopener noreferrer"
                         className="text-sm text-orange-400 underline">
                        View Source
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No results found for this query.</p>
              )}
            </div>
          ))}
        
        {loading && <LoadingIndicator text="Searching..." />}
        <div ref={endOfResultsRef} />
      </div>

      {/* Bottom section */}
      <div className="w-full max-w-3xl mx-auto mt-4 pt-4 border-t border-gray-700">
        
        {/* Search History or Use Cases */}
        <div className="mb-4">
            {results.length > 0 ? (
                <>
                    <h3 className="text-lg font-semibold mb-3">Search History</h3>
                    <div className="flex flex-wrap gap-2">
                        {[...results].reverse().map((entry, i) => (
                            <button
                                key={i}
                                onClick={() => handleSearch(entry.query)}
                                className="bg-[#2c2c2c] hover:bg-[#3a3a3a] px-3 py-1 rounded-full text-sm"
                            >
                                {entry.query}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center">
                    <p className="text-gray-400 mb-2">Try one of these:</p>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {useCases[title]?.map((ex, i) => (
                            <button
                                key={i}
                                onClick={() => setQuery(ex)}
                                className="custom-button hover:bg-[#3a3a3a] text-sm px-3 py-1 rounded-full"
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        {/* Search Bar */}
        {searchBar}
      </div>
    </div>
  );
}