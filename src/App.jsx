import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './features/landing/LandingPage';
import ChatInterface from './features/chat/ChatInterface';
import DraftingInterface from './features/drafting/DraftingInterface';
import DocumentLibraryInterface from './features/documentLibrary/DocumentLibraryInterface';
import FileAnalysisInterface from './features/fileanalysis/FileAnalysisInterface';
import ContractAnalysisInterface from './features/contractAnalysis/ContractAnalysisInterface';
import DocumentComparisonInterface from './features/documentComparison/DocumentComparisonInterface';
import MyDriveInterface from './features/myDrive/MyDriveInterface';
import AgenticSearchInterface from './features/agenticSearch/AgenticSearchInterface';
import QueryInterface from './features/query/QueryInterface';

const featureComponents = {
  'Landing Page': LandingPage,
  Chat: ChatInterface,
  Drafting: DraftingInterface,
  'Document Library': DocumentLibraryInterface,
  'File Analysis': FileAnalysisInterface,
  'Contract Analysis': ContractAnalysisInterface,
  'Document Comparison': DocumentComparisonInterface,
  'My Drive': MyDriveInterface,
  'Agentic Search': AgenticSearchInterface,
  Query: QueryInterface,
};

function App() {
  const [activeFeature, setActiveFeature] = useState('Landing Page');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const ActiveComponent = featureComponents[activeFeature] || LandingPage;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        open={sidebarOpen}
        toggle={toggleSidebar}
      />
      <main className="flex-1 overflow-y-auto">
        <ActiveComponent />
      </main>
    </div>
  );
}

export default App;
