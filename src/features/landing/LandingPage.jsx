import React from 'react'
import { menuStructure } from '../../constants/menuStructure'
import { starterContent } from '../../constants/starterContent'

export default function LandingPage({ onSelect }) {
  return (
    <div className="h-full flex flex-col justify-center items-center text-center text-white page-container-padding">
      <h1 className="text-4xl font-bold mb-4">Welcome to Legal AI Africa</h1>
      <p className="text-gray-400 text-lg max-w-2xl mb-8">
        Your AI-powered legal assistant for document analysis, research,
        drafting, and more. Select a feature from the menu to get started.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(menuStructure).flatMap(([_, items]) =>
          items.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className="border border-[#333] rounded p-4 flex flex-col items-center
                         text-center shadow-md hover:bg-[#2a2a2a]"
            >
              <Icon size={32} className="mb-2 text-[#8c00cc]" />
              <h3 className="font-semibold text-lg mb-1">{name}</h3>
              <p className="text-sm text-gray-400">
                {starterContent[name] || 'Explore this feature.'}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}