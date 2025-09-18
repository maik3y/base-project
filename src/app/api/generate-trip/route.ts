import { createAzure } from '@ai-sdk/azure'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { SEEKEND_SYSTEM_PROMPT } from '../../../lib/llm-prompts'
import { UserProfile, TripResult } from '../../../types/seekend'

const azure = createAzure({
  resourceName: 'aistudio-acc-openai',
  apiKey: process.env.AZURE_OPENAI_GPT4O_MINI_KEY!,
})

export interface SwipeAnswer {
  questionId: string
  answer: 'left' | 'right'
  question?: string
  leftOption?: string
  rightOption?: string
}

export interface TripGenerationRequest {
  userProfile: UserProfile
  swipeAnswers: SwipeAnswer[]
}

export interface TripGenerationResponse {
  type: 'result'
  tripResult: TripResult
}

export async function POST(request: NextRequest) {
  try {
    const body: TripGenerationRequest = await request.json()
    const { userProfile, swipeAnswers } = body

    // Build comprehensive context for trip generation
    const tripContext = `
Generate a personalized weekend getaway recommendation for this user:

USER PROFILE:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Location: ${userProfile.location}
- Budget: €${userProfile.budget.min}-${userProfile.budget.max} ${userProfile.budget.currency}
- Trip Purposes: ${userProfile.tripPurpose.join(', ')}

PREFERENCE ANSWERS:
${swipeAnswers
  .map(
    (answer, index) =>
      `${index + 1}. ${answer.question || 'Question'}: Chose "${
        answer.answer === 'left'
          ? answer.leftOption || 'Left option'
          : answer.rightOption || 'Right option'
      }"`
  )
  .join('\n')}

REQUIREMENTS:
- Weekend trip (1-3 days maximum)
- Stay within budget range strictly
- Consider travel distance from ${userProfile.location}
- Include 3-5 activities that match their preferences
- Suggest appropriate accommodation
- Provide practical travel information
- Consider the user's age and interests for ${userProfile.tripPurpose.join(', ')}

Please generate a complete trip recommendation that perfectly matches their profile and answers. Focus on realistic, achievable recommendations within their budget and location constraints.
`

    const { text } = await generateText({
      model: azure('gpt-4o-mini'),
      system: SEEKEND_SYSTEM_PROMPT,
      prompt: tripContext,
      temperature: 0.8,
      maxRetries: 2,
    })

    // Parse the JSON response - handle markdown code blocks if present
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const response: TripGenerationResponse = JSON.parse(jsonText)

    // Validate response structure
    if (response.type !== 'result' || !response.tripResult) {
      throw new Error('Invalid trip generation response format')
    }

    // Validate required fields
    const { tripResult } = response
    if (
      !tripResult.destination ||
      !tripResult.duration ||
      !tripResult.totalEstimatedCost ||
      !tripResult.activities ||
      tripResult.activities.length === 0
    ) {
      throw new Error('Incomplete trip result data')
    }

    return NextResponse.json({
      success: true,
      tripResult: tripResult,
      generatedAt: new Date().toISOString(),
      userLocation: userProfile.location,
      budgetRange: `€${userProfile.budget.min}-${userProfile.budget.max}`,
    })
  } catch (error) {
    console.error('Trip generation error:', error)

    // Provide fallback error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate trip recommendation',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallbackMessage:
          'Unable to generate personalized recommendations at the moment. Please try again later.',
      },
      { status: 500 }
    )
  }
}
