import React, { useState } from 'react'
import { connectDrive } from './driveService'
import { FileBox, Link as LinkIcon } from 'lucide-react'

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

  const handleConnect = async (providerName) => {
    setStatus('')
    setLoading(providerName)

    try {
      const msg = await connectDrive(providerName)
      setStatus(msg)
    } catch (err) {
      setStatus(`Error connecting to ${providerName}: ${err.message}`)
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="flex flex-col items-center p-6 text-white">
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
              flex items-center gap-2 px-4 py-2 rounded text-white
              ${loading === name
                ? 'bg-[#444] cursor-wait'
                : 'bg-[#8c00cc] hover:bg-[#9c38d0]'}
            `}
          >
            <Icon size={16} />
            {loading === name ? 'Connecting…' : name}
          </button>
        ))}
      </div>

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