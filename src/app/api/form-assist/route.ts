import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

export async function POST(req: Request) {
  try {
    const { type, context } = await req.json()

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

    let prompt = ''
    if (type === 'improve_description') {
      prompt = `Please improve this project description to be more professional and compelling:
      
      Name: ${context.name || 'Not provided'}
      Company: ${context.company || 'Not provided'}
      Current Description: ${context.currentDescription || 'No description provided'}
      
      Please rewrite the description to be more engaging, professional, and clear. Keep it concise but informative.`
    }

    const result = await generateText({
      model: openai('openai/gpt-4o-mini'),
      prompt,
    })

    return Response.json({
      suggestion: result.text,
      type,
    })
  } catch (error) {
    console.error('Form assist API error:', error)
    return new Response('Error processing request', { status: 500 })
  }
}
