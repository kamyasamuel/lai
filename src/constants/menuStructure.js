import {
    FileText, FileSearch, MessageSquare, Layers, Gavel,
    Briefcase, Search, Sparkles, Copy, HardDrive, Link as LinkIcon, FileBox,
    Home
  } from 'lucide-react';
  
  export const menuStructure = {
    
    'AI Assistant': [
      { name: 'Chat', icon: MessageSquare, hideOnLanding: true },
      { name: 'Drafting', icon: FileText, hideOnLanding: true },
      { name: 'File Analysis', icon: FileSearch, hideOnLanding: true },
    ],
    'Library': [{ name: 'Document Library', icon: Layers, hideOnLanding: true }],
    Tools: [
      { name: 'Agentic Search', icon: Sparkles, hideOnLanding: true },
      { name: 'File Summariser', icon: FileText, hideOnLanding: true },
      { name: 'Contract Analysis', icon: Briefcase, hideOnLanding: true },
      { name: 'Contract Search', icon: Search, hideOnLanding: true },
      { name: 'Document Comparison', icon: Copy, hideOnLanding: true },
    ],
    'My Drive': [{ name: 'My Drive', icon: HardDrive, hideOnLanding: true }],
  };