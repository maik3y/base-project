'use client'

import { useState } from 'react'

export default function ChatExample() {
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; content: string }>
  >([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      console.log('Sending message:', userMessage)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      console.log('Response status:', response.status)
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      )

      if (response.ok && response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let aiContent = ''

        // Add the AI message placeholder
        const aiMessageId = (Date.now() + 1).toString()
        setMessages(prev => [
          ...prev,
          {
            id: aiMessageId,
            role: 'assistant',
            content: '',
          },
        ])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          console.log('Received chunk:', chunk)

          // Parse SSE format from Azure OpenAI
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const jsonStr = line.substring(6) // Remove 'data: ' prefix
                const parsed = JSON.parse(jsonStr)

                // Extract content from Azure OpenAI response
                if (
                  parsed.choices &&
                  parsed.choices[0] &&
                  parsed.choices[0].delta &&
                  parsed.choices[0].delta.content
                ) {
                  aiContent += parsed.choices[0].delta.content

                  // Update the message in real-time
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === aiMessageId
                        ? { ...msg, content: aiContent }
                        : msg
                    )
                  )
                }
              } catch (e) {
                console.log('Failed to parse SSE line:', line)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, there was an error processing your message.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Interactive Chat</h3>
      <p className="text-black">
        Chat with AI using streaming responses. Messages are processed in
        real-time.
      </p>

      <div className="rounded-lg border border-gray-300 bg-gray-50">
        <div className="h-64 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-black">
              Start a conversation with the AI
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-black shadow-sm'
                    }`}
                  >
                    <div className="mb-1 text-xs opacity-70">
                      {message.role === 'user' ? 'You' : 'AI'}
                    </div>
                    <div className="whitespace-pre-wrap">
                      {typeof message.content === 'string'
                        ? message.content
                        : JSON.stringify(message.content)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-white px-3 py-2 text-black shadow-sm">
                    <div className="mb-1 text-xs opacity-70">AI</div>
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-300 p-4">
          <div className="flex space-x-2">
            <input
              value={input}
              placeholder="Type your message..."
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
