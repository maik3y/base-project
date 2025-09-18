import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

// Example schema for structured generation
const responseSchema = z.object({
  title: z.string().describe('A title for the response'),
  content: z.string().describe('The main content of the response'),
  category: z
    .enum(['general', 'technical', 'creative', 'business'])
    .describe('Category of the response'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence level of the response'),
})

export async function POST(req: Request) {
  try {
    const { prompt, schema } = await req.json()

    // Use OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return new Response('OpenRouter API key not configured', { status: 500 })
    }

    // Create OpenRouter instance
    const openai = createOpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'HTTP-Referer':
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Base Project AI App',
      },
    })

    // Use custom schema if provided, otherwise use default
    const generationSchema = schema || responseSchema

    const result = await generateObject({
      model: openai('openai/gpt-4o-mini'),
      schema: generationSchema,
      prompt,
    })

    return Response.json({
      success: true,
      object: result.object,
      usage: result.usage,
    })
  } catch (error) {
    console.error('Generate API Error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
