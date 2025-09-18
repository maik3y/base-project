'use client'

import { useState } from 'react'

type ModelProvider = 'openai' | 'azure-gpt4o' | 'azure-gpt4o-mini'

export default function ModelSelectorExample() {
  const [selectedModel, setSelectedModel] = useState<ModelProvider>('openai')
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const models = [
    {
      id: 'openai',
      name: 'OpenAI (OpenRouter)',
      description: 'GPT-4o via OpenRouter',
    },
    {
      id: 'azure-gpt4o',
      name: 'Azure GPT-4o',
      description: 'Direct Azure OpenAI connection',
    },
    {
      id: 'azure-gpt4o-mini',
      name: 'Azure GPT-4o Mini',
      description: 'Faster, cost-effective model',
    },
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/multi-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data.text || 'No response')
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
      <h3 className="text-xl font-semibold">Multi-Model Comparison</h3>
      <p className="text-black">
        Test different AI models and providers. Compare responses from OpenAI,
        Azure OpenAI, and other providers.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Select Model
          </label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id as ModelProvider)}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  selectedModel === model.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-black hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{model.name}</div>
                <div className="text-xs opacity-75">{model.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Your Prompt
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Compare how different models respond to this prompt..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:outline-none"
            rows={3}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? 'Generating...'
            : `Generate with ${models.find(m => m.id === selectedModel)?.name}`}
        </button>

        {result && (
          <div className="rounded-md border border-gray-300 bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-black">
              Response from {models.find(m => m.id === selectedModel)?.name}:
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
