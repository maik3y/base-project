'use client'

import { useState } from 'react'

export default function TextGenerationExample() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data.text || data.result || 'No response')
      }
    } catch (error) {
      console.error('Generation error:', error)
      setResult('Error generating text')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Text Generation</h3>
      <p className="text-black">
        Generate text completions using AI. Enter a prompt and get an
        AI-generated response.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Your Prompt
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Write a creative story about..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm ring-1 focus:ring-blue-500 focus:outline-none"
            rows={3}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white ring-2 hover:bg-green-700 focus:ring-green-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Text'}
        </button>

        {result && (
          <div className="rounded-md border border-gray-300 bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-black">
              Generated Text:
            </h4>
            <div className="text-sm whitespace-pre-wrap text-black">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
