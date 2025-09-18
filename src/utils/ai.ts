// Utility function to make API calls to your AI endpoints
export async function callChatAPI(
  messages: Array<{ role: string; content: string }>
) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`)
  }

  return response
}

export async function callGenerateAPI<T = unknown>(
  prompt: string,
  schema?: object
): Promise<T> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      schema,
    }),
  })

  if (!response.ok) {
    throw new Error(`Generate API error: ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Generation failed')
  }

  return data.object
}
