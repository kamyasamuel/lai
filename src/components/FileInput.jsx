import React from 'react';
export default function FileInput({ onChange }) {
  return (
    <input
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={onChange}
      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                 file:rounded file:border-0 file:text-sm file:font-semibold
                 file:bg-[#8c00cc] file:text-white hover:file:bg-[#a02cd0]"
    />
  );
}