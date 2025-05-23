import React, { useState } from 'react'
import { connectDrive } from './driveService'
import { FileBox, Link as LinkIcon, Download, Eye } from 'lucide-react'

const PROVIDERS = [
  { name: 'Google Drive', icon: FileBox },
  { name: 'OneDrive',      icon: FileBox },
  { name: 'Legal AI Africa', icon: LinkIcon },
]

const USE_CASES = [
  'Access contracts saved on Google Drive.',
  'Upload a local legal brief to Legal AI Africa’s storage.',
  'Sync recent folders from OneDrive for analysis.',
]

export default function MyDriveInterface() {
  // status message shown below the buttons
  const [status, setStatus] = useState('')
  // name of the provider currently loading (or empty string)
  const [loading, setLoading] = useState('')
  const [legalAiAfricaFiles, setLegalAiAfricaFiles] = useState([]);

  const handleConnect = async (providerName) => {
    setStatus('')
    setLoading(providerName)

    try {
      const msg = await connectDrive(providerName)
      if (providerName === 'Legal AI Africa') {
        const response = await fetch('https://lawyers.legalaiafrica.com/mydrive/legal-ai-africa/docs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const files = await response.json();
        setLegalAiAfricaFiles(files);
        setStatus('Files loaded successfully.');
      } else {
        setStatus(msg)
      }
    } catch (err) {
 setLegalAiAfricaFiles([]);
      setStatus(`Error connecting to ${providerName}: ${err.message}`)
    } finally {
      setLoading('')
    }
  }

  return (
    // Main container with padding and centering
    <div className="flex flex-col items-center p-6 text-white">
      {/* Title and description */}
      <h2 className="text-xl font-semibold mb-2">My Drive</h2>
      <p className="text-gray-400 text-sm mb-4">
        Access and sync cloud‑based storage from multiple providers.
      </p>

      {/* Example use‑cases */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {USE_CASES.map((ex, i) => (
          <span
            key={i}
            className="bg-[#2c2c2c] text-sm px-3 py-1 rounded-full text-gray-300"
          >
            {ex}
          </span>
        ))}
      </div>

      {/* Connect buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {PROVIDERS.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => handleConnect(name)}
            disabled={loading && loading !== name}
            className={`
              flex items-center gap-2 px-4 py-2 rounded text-white custom-button
              ${loading === name
                ? 'bg-[#444] cursor-wait'
                : 'bg-[#111] hover:bg-[#222]'}
            `}
          >
            <Icon size={16} />
            {loading === name ? 'Connecting…' : name}
          </button>
        ))}
      </div>

      {/* Display Legal AI Africa files */}
      {legalAiAfricaFiles.length > 0 && (
        <div className="w-full max-w-2xl mt-6">
          <h3 className="text-lg font-semibold mb-3 border-b border-[#333] pb-2">
            Legal AI Africa Files
          </h3>
          <ul className="space-y-3">
            {legalAiAfricaFiles.map((filename, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-[#222] border border-[#333] p-3 rounded"
              >
                <span>{filename}</span>
                <div className="flex gap-2">
                  <a
                    href={`https://lawyers.legalaiafrica.com/uploads/${filename}`}

                    className="flex items-center text-sm text-gray-400 hover:text-white"
                  >
                    <Download size={16} className="mr-1" /> Download
                  </a>
                  {/* The "Open" action can be implemented later */}
                  <button className="flex items-center text-sm text-gray-400 hover:text-white">
                    <Eye size={16} className="mr-1" /> Open
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status message */}
      {status && (
        <div className="text-sm text-gray-300 bg-[#222] border border-[#333]
                        px-4 py-2 rounded max-w-md text-center">
          {status}
        </div>
      )}
    </div>
  )
}