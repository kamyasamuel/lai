import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import LandingPage from './features/landing/LandingPage'
import ChatInterface from './features/chat/ChatInterface'
import DraftingInterface from './features/drafting/DraftingInterface'
import FileAnalysisInterface from './features/fileanalysis/FileAnalysisInterface' // Corrected import path
//import FileUploaderTool from './features/fileUploader/FileUploaderTool'
import QueryInterface from './features/query/QueryInterface'
import MyDriveInterface from './features/myDrive/MyDriveInterface'
import ContractAnalysisInterface from './features/contractAnalysis/ContractAnalysisInterface'
import DocumentComparisonInterface from './features/documentComparison/DocumentComparisonInterface'
import DocumentLibraryInterface from './features/documentLibrary/DocumentLibraryInterface'
import MyDriveInterface from './features/myDrive/MyDriveInterface' // Import MyDriveInterface
import { menuStructure } from './constants/menuStructure'


export default function App() {
  const [activeFeature, setActiveFeature] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark'; // Default to dark if no theme is saved
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const renderFeature = () => {
    switch (activeFeature) {
      case 'Chat':
        return <ChatInterface />
      case 'Drafting':
        return <DraftingInterface />
      case 'File Analysis':
        return <FileAnalysisInterface />
      case 'File Summariser':
        // Use FileAnalysisInterface for summarization as it connects to the /analyze endpoint
        return <FileAnalysisInterface />
      case 'Contract Analysis':
        return <ContractAnalysisInterface />
      case 'Document Comparison':
        return <DocumentComparisonInterface /> // Changed to new component
      case 'Document Library':
          return <DocumentLibraryInterface />
      case 'My Drive': // Added case for My Drive
          return <MyDriveInterface />
      case 'Contract Search':
      case 'Web & News':
      case 'Laws & Regulations':
      case 'Case Law':
        return <QueryInterface title={activeFeature} />
      case 'My Drive':
        return <MyDriveInterface />
      default:
        return <LandingPage onSelect={setActiveFeature} />
    }
  }

  return (
    <div className="flex h-screen bg-background-light text-text-primary-light dark:bg-background-dark dark:text-text-primary-dark main-content">
      <Sidebar
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        open={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className="flex-1 overflow-auto">
        <button 
          onClick={toggleTheme} 
          className="p-2 m-4 bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark rounded"
        >
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
        {renderFeature()}
      </main>
    </div>
  )
}