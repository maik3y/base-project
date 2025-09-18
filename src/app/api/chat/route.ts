export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Use Azure OpenAI GPT-4o
    const apiKey = process.env.AZURE_OPENAI_GPT4O_KEY
    const endpoint = process.env.AZURE_OPENAI_GPT4O_ENDPOINT
    const apiVersion = process.env.AZURE_OPENAI_GPT4O_API_VERSION

    if (!apiKey || !endpoint) {
      return new Response('Azure OpenAI configuration not complete', {
        status: 500,
      })
    }

    console.log('Making request to Azure OpenAI...')
    console.log('Endpoint:', endpoint)

    // Make direct call to Azure OpenAI
    const response = await fetch(`${endpoint}?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages,
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    console.log('Azure response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        'Azure OpenAI error:',
        response.status,
        response.statusText,
        errorText
      )
      return new Response(`Azure OpenAI request failed: ${errorText}`, {
        status: response.status,
      })
    }

    // Return the streaming response with proper SSE headers
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response(`Internal Server Error: ${error}`, { status: 500 })
  }
}
