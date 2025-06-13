# Legal AI Africa

![Legal AI Africa](https://via.placeholder.com/800x200?text=Legal+AI+Africa)

A comprehensive platform that leverages artificial intelligence to provide legal professionals in Africa with powerful tools for legal research, document drafting, analysis, and management.

## Features

- **AI Chat Assistant**: Get answers to legal questions from an AI trained on African legal frameworks
- **Document Drafting**: Generate legal documents, contracts, and agreements with AI assistance
- **File Analysis**: Upload and analyze legal documents to extract key information
- **Contract Analysis**: Get AI-powered insights and risk assessments for contracts
- **Document Comparison**: Compare multiple documents to identify differences and similarities
- **Document Search**: Search through legal documents with intelligent semantic search
- **Document Library**: Access a growing library of legal templates and resources
- **Personal Cloud Storage**: Store and manage your legal documents securely

## Technology Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Python, Tornado
- **Database**: MongoDB
- **Vector Database**: FAISS for semantic search
- **AI Models**: OpenAI GPT-4o, Groq, Gemini, DeepSeek

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python 3.9+
- MongoDB
- API keys for OpenAI, Groq, and other AI providers

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/lai.git
   cd lai
   ```

2. Install frontend dependencies
   ```bash
   npm install
   ```

3. Create a Python virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install backend dependencies
   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Edit the .env file to add your API keys and configuration

6. Start the MongoDB service
   ```bash
   sudo systemctl start mongod
   ```

### Running the Application

1. Start the backend server
   ```bash
   cd backend
   python main.py
   ```

2. In a new terminal, start the frontend development server
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:5173` in your browser

## Project Structure

```
lai/
├── backend/              # Python backend
│   ├── main.py           # Main application entry point
│   ├── auth.py           # Authentication handlers
│   ├── vector_db.py      # FAISS vector database integration
│   └── mongo_db.py       # MongoDB connection and schemas
├── public/               # Static files
└── src/                  # React frontend
    ├── components/       # Reusable UI components
    ├── features/         # Feature-specific components
    │   ├── chat/         # Chat interface
    │   ├── drafting/     # Document drafting
    │   ├── fileanalysis/ # File analysis
    │   └── ...           # Other feature modules
    ├── constants/        # Application constants
    └── services/         # API service calls
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/draft` | POST | Generate legal drafts |
| `/api/analyze/*` | POST | Analyze documents |
| `/api/ws/chat` | WebSocket | Chat with AI assistant |
| `/api/compare-documents` | POST | Compare multiple documents |
| `/api/documents` | GET | Get document library |
| `/api/auth/*` | Various | Authentication endpoints |
| `/api/user-documents` | GET | Get user's documents |

## Contributing

We welcome contributions to Legal AI Africa!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all the open-source libraries that made this project possible
- Special thanks to the legal professionals who provided domain expertise

---

© 2025 Legal AI Africa. All rights reserved.
