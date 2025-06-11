import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { menuStructure } from '../constants/menuStructure'

export default function Sidebar({
  activeFeature,
  setActiveFeature,
  open,
  toggle,
}) {
  return (
    <aside
      className={`relative flex flex-col bg-[#111] border-r border-[#333] transition-all duration-300 ease-in-out ${
        open ? 'w-64' : 'w-10'
      }`}
    >
      <div
        className={`flex items-center p-1 border-b border-[#333] ${
          open ? 'justify-between' : 'justify-center'
        }`}
      >
        {open && (
          <h2 className="text-lg font-semibold text-white px-2">Features</h2>
        )}
        <button onClick={toggle} className="text-white">
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-1 bg-[#000]">
        {Object.entries(menuStructure).map(([section, items]) => (
          <div key={section} className="mb-4">
            {open && (
              <h3 className="text-xs text-gray-400 uppercase mb-2 px-2">
                {section}
              </h3>
            )}
            <ul>
              {items.map(({ name, icon: Icon }) => (
                <li key={name}>
                  <button
                    onClick={() => setActiveFeature(name)}
                    className={`flex items-center w-full text-left p-1 rounded hover:bg-[#222] text-white ${
                      activeFeature === name ? 'bg-[#222]' : ''
                    } ${!open ? 'justify-center' : ''}`}
                    title={name}
                  >
                    <Icon
                      size={18}
                      className={`text-[#8c00cc] ${open ? 'mr-2' : ''}`}
                    />
                    {open && <span>{name}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
