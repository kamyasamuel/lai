import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { menuStructure } from '../constants/menuStructure';

export default function Sidebar({
  activeFeature,
  setActiveFeature,
  open,
  toggle,
  isAuthenticated: propIsAuthenticated, // Rename to avoid confusion
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount and when prop changes
  useEffect(() => {
    const checkAuthStatus = () => {
      if (propIsAuthenticated !== undefined) {
        // Use prop if provided
        setIsAuthenticated(propIsAuthenticated);
      } else {
        // Fallback: check localStorage for token (use consistent key)
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const authStatus = !!token;
        setIsAuthenticated(authStatus);
      }
    };

    checkAuthStatus();
    
    // Optional: Listen for storage changes (if user logs in/out in another tab)
    const handleStorageChange = () => {
      if (propIsAuthenticated === undefined) {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        setIsAuthenticated(!!token);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [propIsAuthenticated]);  
  return (
    <aside
      className={`relative flex flex-col bg-[#111] border-r border-[#333] transition-all duration-300 ease-in-out ${
        open ? 'w-64' : 'w-10'
      }`}
    >
      {/* Header remains the same */}
      <div
        className={`flex items-center p-1 border-b border-[#333] ${
          open ? 'justify-between' : 'justify-center'
        }`}
      >
        {open && (
          <h2 className="text-lg font-semibold text-white px-2">Tools</h2>
        )}
        <button onClick={toggle} className="text-white">
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-1 bg-[#000] place-content-center">
        {/* Home button */}
        <div className="mb-2">
          <button
            onClick={() => setActiveFeature('Dashboard')}
            {...(!isAuthenticated && { disabled: true })}
            className={`flex items-center w-full text-left p-1 rounded hover:bg-[#222] text-white ${
              activeFeature === 'Dashboard' ? 'bg-[#222]' : ''
            } ${!open ? 'justify-center' : 'justify-center'} ${
              !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Home"
          >
            <Home
              size={18}
              className={`text-[#8c00cc] ${open ? 'mr-2' : ''}`}
            />
            {open && <span>Home</span>}
          </button>
        </div>

        {/* Separator line */}
        {open && <div className="border-b border-[#333] mb-2"></div>}

        {/* Regular menu items - filter out Dashboard */}
        {Object.entries(menuStructure).map(([section, items]) => {
          const filteredItems = items.filter(item => item.name !== 'Dashboard');
          
          if (filteredItems.length === 0) return null;
          
          return (
            <div key={section} className="mb-4">
              {open && (
                <h3 className="text-xs text-gray-400 uppercase mb-2 px-2">
                  {section}
                </h3>
              )}
              <ul>
                {filteredItems.map(({ name, icon: Icon }) => (
                  <li key={name}>
                    <button
                      onClick={() => setActiveFeature(name)}
                      {...(!isAuthenticated && { disabled: true })}
                      className={`flex items-center w-full text-left p-1 rounded hover:bg-[#222] text-white ${
                        activeFeature === name ? 'bg-[#222]' : ''
                      } ${!open ? 'justify-center' : 'justify-center'} ${
                        !isAuthenticated
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
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
          );
        })}
      </nav>
      
      {/* Footer copyright - only visible when expanded */}
      {open && (
        <div className="p-2 border-t bg-[#111] border-[#333] text-center">
          <p className="text-xs text-gray-500">© Legal AI Africa</p>
        </div>
      )}
    </aside>
  );
}