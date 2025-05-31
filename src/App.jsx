import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import LandingPage from './features/landing/LandingPage'
import ChatInterface from './features/chat/ChatInterface'
import DraftingInterface from './features/drafting/DraftingInterface'
import FileAnalysisInterface from './features/fileanalysis/FileAnalysisInterface' // Corrected import path
//import FileUploaderTool from './features/fileUploader/FileUploaderTool'
import QueryInterface from './features/query/QueryInterface'
import ContractAnalysisInterface from './features/contractAnalysis/ContractAnalysisInterface'
import DocumentComparisonInterface from './features/documentComparison/DocumentComparisonInterface'
import DocumentLibraryInterface from './features/documentLibrary/DocumentLibraryInterface'
import { menuStructure } from './constants/menuStructure'


export default function App() {
  const [activeFeature, setActiveFeature] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
      case 'Contract Search':
      case 'Web & News':
      case 'Laws & Regulations':
      case 'Case Law':
        return <QueryInterface title={activeFeature} />      
      default:
        return <LandingPage onSelect={setActiveFeature} />
    }
  }

  return (
    <div className="flex h-screen bg-black text-white main-content">
      <Sidebar
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        open={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className="flex-1 overflow-auto">{renderFeature()}</main>
    </div>
  )
}