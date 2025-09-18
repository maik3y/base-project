'use client'

import { useState } from 'react'
import ChatExample from './ChatExample'
import FormAIExample from './FormAIExample'
import ModelSelectorExample from './ModelSelectorExample'
import TextGenerationExample from './TextGenerationExample'

type ExampleType = 'chat' | 'text' | 'models' | 'forms'

export default function AIExamples() {
  const [activeExample, setActiveExample] = useState<ExampleType>('chat')

  const examples = [
    {
      id: 'chat',
      name: 'Chat Interface',
      description: 'Interactive chat with streaming responses',
    },
    {
      id: 'text',
      name: 'Text Generation',
      description: 'Simple text completion and generation',
    },
    {
      id: 'models',
      name: 'Multi-Model',
      description: 'Switch between different AI providers',
    },
    { id: 'forms', name: 'Form AI', description: 'AI-powered form assistance' },
  ]

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex flex-wrap justify-center gap-4">
        {examples.map(example => (
          <button
            key={example.id}
            onClick={() => setActiveExample(example.id as ExampleType)}
            className={`rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
              activeExample === example.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">{example.name}</div>
              <div className="text-xs opacity-75">{example.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Example Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {activeExample === 'chat' && <ChatExample />}
        {activeExample === 'text' && <TextGenerationExample />}
        {activeExample === 'models' && <ModelSelectorExample />}
        {activeExample === 'forms' && <FormAIExample />}
      </div>
    </div>
  )
}
