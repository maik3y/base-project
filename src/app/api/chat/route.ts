import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Use OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return new Response('OpenRouter API key not configured', { status: 500 })
    }

    // Create OpenRouter instance (using OpenAI-compatible interface)
    const openai = createOpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'HTTP-Referer':
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Base Project AI App',
      },
    })

    const result = streamText({
      model: openai('openai/gpt-4o-mini'),
      messages,
    })

    return result.toTextStreamResponse({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
