import { createAzure } from '@ai-sdk/azure'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { SEEKEND_SYSTEM_PROMPT } from '../../../lib/llm-prompts'
import { UserProfile } from '../../../types/seekend'

const azure = createAzure({
  resourceName: 'aistudio-acc-openai',
  apiKey: process.env.AZURE_OPENAI_GPT4O_MINI_KEY!,
})

export interface SwipeQuestion {
  id: string
  text: string
  leftOption: string
  rightOption: string
}

export interface QuestionGenerationRequest {
  userProfile: UserProfile
  previousAnswers?: Array<{
    questionId: string
    answer: 'left' | 'right'
    question?: string
    leftOption?: string
    rightOption?: string
  }>
  questionCount?: number
}

export interface QuestionResponse {
  type: 'question'
  questionId: string
  question: string
  leftOption: string
  rightOption: string
  reasoning: string
  questionCount: number
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestionGenerationRequest = await request.json()
    const { userProfile, previousAnswers = [], questionCount = 0 } = body

    // Define the 6 question categories to ensure diversity
    const questionCategories = [
      'LOCATION TYPE (City vs Nature, Beach vs Mountains)',
      'ACCOMMODATION (Luxury vs Budget, Private vs Social)',
      'ACTIVITIES (Active/Adventure vs Relaxed/Cultural)',
      'SOCIAL STYLE (Solo vs Group, Busy vs Quiet)',
      'FOOD & DINING (Street food vs Fine dining, Cooking vs Restaurants)',
      'WEATHER PREFERENCE (Warm/Sunny vs Cool/Cozy)',
    ]

    const nextCategory =
      questionCategories[questionCount] || 'GENERAL TRAVEL PREFERENCE'

    // Build context from user profile and previous answers
    const userContext = `
User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Location: ${userProfile.location}
- Budget: €${userProfile.budget.min}-${userProfile.budget.max}
- Trip Purposes: ${userProfile.tripPurpose.join(', ')}

Previous Questions & Answers: ${
      previousAnswers.length > 0
        ? previousAnswers
            .map((answer, index) => {
              const selectedOption =
                answer.answer === 'left'
                  ? answer.leftOption
                  : answer.rightOption
              return `${index + 1}. ${answer.question || 'Question'}: Selected "${selectedOption || answer.answer + ' option'}"`
            })
            .join('\n')
        : 'None yet'
    }

Current question count: ${questionCount + 1}/6

IMPORTANT: Generate a question about "${nextCategory}". 
Make sure this question is DIFFERENT from previous topics and covers this specific category.
Avoid repeating similar concepts from previous questions.

Please generate the next preference question to better understand this user's travel preferences.

RESPOND WITH ONLY JSON - NO MARKDOWN OR CODE BLOCKS:
`

    const { text } = await generateText({
      model: azure('gpt-4o-mini'),
      system: SEEKEND_SYSTEM_PROMPT,
      prompt: userContext,
      temperature: 0.7,
    })

    // Parse the JSON response - handle markdown code blocks if present
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const response: QuestionResponse = JSON.parse(jsonText)

    // Validate response structure
    if (response.type !== 'question') {
      throw new Error('Expected question type response')
    }

    return NextResponse.json({
      success: true,
      question: {
        id: response.questionId,
        text: response.question,
        leftOption: response.leftOption,
        rightOption: response.rightOption,
      } as SwipeQuestion,
      reasoning: response.reasoning,
      questionCount: response.questionCount,
    })
  } catch (error) {
    console.error('Question generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate question',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
