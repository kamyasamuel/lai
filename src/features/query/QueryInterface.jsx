import React, { useState } from 'react';
import { queryAPI } from './QueryService';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Search } from 'lucide-react';

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
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { results: res } = await queryAPI(title, query);
      setResults(res || []);
    } catch (e) {
      setResults([{ title:'Error', snippet: e.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 text-white">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-400 text-sm mb-4">
        Use AI to explore {title.toLowerCase()} across jurisdictions.
      </p>
      <div className="flex gap-2 flex-wrap justify-center mb-6">
        {useCasesByTitle[title]?.map((ex,i)=>(
          <button
            key={i}
            onClick={()=>setQuery(ex)}
            className="custom-button hover:bg-[#3a3a3a] text-sm px-3 py-1 rounded-full"
          >
            {ex}
          </button>
        ))}
      </div>
      <div className="flex gap-2 center-items w-full max-w-2xl mb-4">
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&handleSearch()}
          className="flex-1 p-3 br-2 rounded-l bg-[#111] text-white border border-[#333]"
          placeholder={`Search ${title.toLowerCase()}...`}
        />
        <Search onClick={handleSearch} className='hover-cursor scale-1' />
      </div>
      {loading && <LoadingIndicator text="Searching..." />}
      <div className="w-full max-w-2xl space-y-4 mt-4">
        {results.map((r,i)=>(
          <div key={i} className="p-4 rounded bg-[#222] border border-[#333]">
            <h4 className="text-md font-semibold mb-1">
              {r.title}
              {r.jurisdiction && r.year && (
                <span className="text-xs text-gray-400">
                  ({r.jurisdiction}, {r.year})
                </span>
              )}
            </h4>
            <p className="text-sm text-gray-300 mb-2">{r.snippet}</p>
            {r.link && (
              <a href={r.link} target="_blank"
                 className="text-sm text-[#8c00cc] underline">
                View Source
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}