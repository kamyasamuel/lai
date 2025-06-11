import {
  MessageSquare,
  FileText,
  FilePlus,
  Search,
  Book,
  GitCompare,
  Database,
  SearchCode,
  FileQuestion,
} from 'lucide-react';

export const menuStructure = {
  'AI Features': [
    { name: 'Chat', icon: MessageSquare },
    { name: 'Drafting', icon: FilePlus },
    { name: 'File Analysis', icon: FileQuestion },
    { name: 'Contract Analysis', icon: SearchCode },
    { name: 'Document Comparison', icon: GitCompare },
    { name: 'Agentic Search', icon: Search },
    { name: 'Query', icon: Database },
  ],
  'Library': [
    { name: 'Document Library', icon: Book },
    { name: 'My Drive', icon: FileText },
  ],
};
