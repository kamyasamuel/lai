
import React, { useState } from 'react'
import { draftAPI } from './draftingService'
import LoadingIndicator from '../../components/LoadingIndicator'
// src/features/drafting/DraftingInterface.jsx
export default function DraftingInterface() {
  const [input, setInput] = useState('')
  const [generated, setGenerated] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!input.trim()) return
    setSubmitted(true)
    setLoading(true)
    try {
      const { draft } = await fetch('https://lawyers.legalaiafrica.com/api/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: input }) }).then(res => res.json());
      setGenerated(draft || 'No draft returned.')
    } catch (err) {
      setGenerated(`Error generating draft: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full p-8 text-white flex flex-col">
      {!submitted ? (
        // initial prompt UI
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <h2 className="text-xl mb-4">Generate a Legal Draft</h2>
          <p className="text-gray-400 mb-6">
            e.g., "Draft a lease agreement for residential property in Lagos."
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full max-w-xl p-3 rounded bg-[#111] border border-[#333] mb-4"
            placeholder="Enter your drafting prompt..."
            rows={4}
          />
          <button
            onClick={handleGenerate}
            className="custom-button px-6 py-2 rounded text-white"
          >
            Generate
          </button>
        </div>
      ) : (
        // result + actions UI
        <div className="flex-1 flex flex-col justify-between">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Draft Output:</h3>
            <div className="bg-[#333] p-4 rounded whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {loading ? (
                <LoadingIndicator text="Generating draft..." />
              ) : (
                generated
              )}
            </div>
          </div>

          <div className="p-4 flex items-center gap-4">
            <textarea
              className="flex-1 p-2 rounded bg-[#111] text-white border border-[#333]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="custom-button px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Generating…' : 'Regenerate'}
            </button>
            <button
              onClick={() => {
                const blob = new Blob([generated], { type: 'text/plain' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = 'legal_draft.txt'
                a.click()
                URL.revokeObjectURL(a.href)
              }}
              className="custom-button px-4 py-2 rounded flex items-center gap-2"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}