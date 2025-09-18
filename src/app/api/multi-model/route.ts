import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json()

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return new Response('OpenRouter API key not configured', { status: 500 })
    }

    const openai = createOpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'HTTP-Referer':
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Base Project AI App',
      },
    })

    // Use different models based on selection (all via OpenRouter for simplicity)
    let modelId = 'openai/gpt-4o-mini'
    if (model === 'azure-gpt4o') {
      modelId = 'openai/gpt-4o'
    } else if (model === 'azure-gpt4o-mini') {
      modelId = 'openai/gpt-4o-mini'
    }

    const result = await generateText({
      model: openai(modelId),
      prompt: `[Using ${model}] ${prompt}`,
    })

    return Response.json({
      text: result.text,
      model,
      usage: result.usage,
    })
  } catch (error) {
    console.error('Multi-model API error:', error)
    return new Response('Error processing request', { status: 500 })
  }
}
