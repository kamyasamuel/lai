import React, { useState, lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar'
import LandingPage from './features/landing/LandingPage'
import ChatInterface from './features/chat/ChatInterface'
import DraftingInterface from './features/drafting/DraftingInterface'
import LoadingIndicator from './components/LoadingIndicator'

// Lazy load large components
const FileAnalysisInterface = lazy(() => import('./features/fileanalysis/FileAnalysisInterface'))
const MyDriveInterface = lazy(() => import('./features/myDrive/MyDriveInterface'))
const DocumentLibraryInterface = lazy(() => import('./features/documentLibrary/DocumentLibraryInterface'))
const DocumentComparisonInterface = lazy(() => import('./features/documentComparison/DocumentComparisonInterface'))
const ContractAnalysisInterface = lazy(() => import('./features/contractAnalysis/ContractAnalysisInterface'))
const AgenticSearchInterface = lazy(() => import('./features/agenticSearch/AgenticSearchInterface'))
const QueryInterface = lazy(() => import('./features/query/QueryInterface'))

export default function App() {
  const [activeFeature, setActiveFeature] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderFeature = () => {
    switch (activeFeature) {
      case 'Chat':
        return <ChatInterface />
      case 'Drafting':
        return <DraftingInterface />
      case 'File Analysis':
        return (
          <Suspense fallback={<LoadingIndicator text="Loading File Analysis..." />}>
            <FileAnalysisInterface />
          </Suspense>
        )
      case 'File Summariser':
        return (
          <Suspense fallback={<LoadingIndicator text="Loading File Summariser..." />}>
            <FileAnalysisInterface />
          </Suspense>
        )
      case 'Contract Analysis':
        return (
          <Suspense fallback={<LoadingIndicator text="Loading Contract Analysis..." />}>
            <ContractAnalysisInterface />
          </Suspense>
        )
      case 'Document Comparison':
        return (
          <Suspense fallback={<LoadingIndicator text="Loading Document Comparison..." />}>
            <DocumentComparisonInterface />
          </Suspense>
        )
      case 'Document Library':
        return (
          <Suspense fallback={<LoadingIndicator text="Loading Document Library..." />}>
            <DocumentLibraryInterface />
          </Suspense>
        )
      case 'Agentic Search':
        return (
          <Suspense fallback={<LoadingIndicator text="Loading Agentic Search..." />}>
            <AgenticSearchInterface />
          </Suspense>
        )
      case 'Contract Search':
      case 'Laws & Regulations':
      case 'Case Law':
        return (
          <Suspense fallback={<LoadingIndicator text={`Loading ${activeFeature}...`} />}>
            <QueryInterface title={activeFeature} />
          </Suspense>
        )
      case 'My Drive':
        return (
          <Suspense fallback={<LoadingIndicator text="Loading My Drive..." />}>
            <MyDriveInterface />
          </Suspense>
        )
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