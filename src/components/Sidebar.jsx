import React from 'react'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'

const API_BASE_URL = 'https://lawyers.legalaiafrica.com/api'
import { menuStructure } from '../constants/menuStructure'

export default function Sidebar({
  activeFeature,
  setActiveFeature,
  open,
  toggle,
}) {
  return (
    <>
      {/* Mobile top‐bar with menu toggle */}
      <div className="mob-menu h-fit md:hidden flex items-center justify-between bg-[#111] p-2 border-b border-[#333]">
        <span className="text-white font-semibold">Legal AI Africa</span>
        <button onClick={toggle} className="text-white">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop on mobile when open */}
      {open && (
        <div
          onClick={toggle}
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-20 h-full w-64
          bg-[#111] border-r border-[#333] p-2
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:flex md:flex-col
        `}
      >
        {/* collapse button on desktop */}
        <div className="hidden md:flex items-center justify-between px-2 py-2 border-b border-[#333]">
          <h2 className="text-lg font-semibold text-white">Features</h2>
          <button onClick={toggle} className="text-white">
            {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {Object.entries(menuStructure).map(([section, items]) => (
            <div key={section} className="mb-4">
              {/* section heading (only if open on desktop) */}
              <h3 className="hidden md:block text-xs text-gray-400 uppercase mb-2 px-2">
                {section}
              </h3>
              <ul>
                {items.map(({ name, icon: Icon }) => (
                  <li key={name}>
                    <button
                      onClick={() => {
                        setActiveFeature(name)
                        // on mobile auto‐close after selecting
                        if (window.innerWidth < 768) toggle()
                      }}
                      className={`
                        flex items-center w-full text-left px-2 py-1 rounded
                        hover:bg-[#222]
                        ${activeFeature === name ? 'bg-[#222]' : ''}
                        text-white
                      `}
                    >
                      <Icon size={18} className="text-[#8c00cc] mr-2" />
                      <span className="md:inline">{name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}