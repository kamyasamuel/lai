import {
    FileText, FileSearch, MessageSquare, Layers, Gavel,
    Briefcase, Search, Globe, Copy, HardDrive, Link as LinkIcon, FileBox
  } from 'lucide-react';
  
  export const menuStructure = {
    'AI Assistant': [
      { name: 'Drafting', icon: FileText },
      { name: 'File Analysis', icon: FileSearch },
      { name: 'Chat', icon: MessageSquare },
    ],
    'Library': [{ name: 'Document Library', icon: Layers },],
    Tools: [
      { name: 'File Summariser', icon: FileText },
      { name: 'Contract Analysis', icon: Briefcase },
      { name: 'Contract Search', icon: Search },
      { name: 'Web & News', icon: Globe },
      { name: 'Document Comparison', icon: Copy },
    ],
    'My Drive': [{ name: 'My Drive', icon: HardDrive }],
  };