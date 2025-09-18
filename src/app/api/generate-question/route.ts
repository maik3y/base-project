import { createAzure } from '@ai-sdk/azure'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { SWIPE_AWAY_SYSTEM_PROMPT } from '../../../lib/llm-prompts'
import { UserProfile } from '../../../types/swipe-away'

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

    // Extract previously used terms and concepts to avoid duplicates
    const usedConcepts = previousAnswers
      .flatMap(answer => [
        answer.leftOption?.toLowerCase().split(' ') || [],
        answer.rightOption?.toLowerCase().split(' ') || [],
        answer.question
          ?.toLowerCase()
          .split(' ')
          .filter(word => word.length > 3) || [],
      ])
      .flat()

    const usedQuestionTopics = previousAnswers
      .map(answer => answer.question || '')
      .filter(Boolean)

    // Build context from user profile and previous answers
    const userContext = `
User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Location: ${userProfile.location}
- Budget: €${userProfile.budget.min}-${userProfile.budget.max}
- Trip Purposes: ${userProfile.tripPurpose.join(', ')}
 
Previous Questions Asked:
${
  previousAnswers.length > 0
    ? previousAnswers
        .map((answer, index) => {
          const selectedOption =
            answer.answer === 'left' ? answer.leftOption : answer.rightOption
          return `${index + 1}. QUESTION: "${answer.question || 'Unknown'}"
         OPTIONS: "${answer.leftOption || 'left'}" vs "${answer.rightOption || 'right'}"
         SELECTED: "${selectedOption || answer.answer + ' option'}"`
        })
        .join('\n')
    : 'None yet'
}
 
Used Concepts to AVOID: ${usedConcepts.length > 0 ? usedConcepts.join(', ') : 'None'}
 
Current question count: ${questionCount + 1}/6
REQUIRED CATEGORY: "${nextCategory}"
 
CRITICAL INSTRUCTIONS:
1. Generate a question about "${nextCategory}" that is COMPLETELY DIFFERENT from all previous questions
2. Do NOT use any of these words/concepts: ${usedConcepts.slice(0, 20).join(', ')}
3. Create entirely NEW and FRESH options that haven't appeared before
4. Make the question specific to "${nextCategory}" but use different terminology than previous questions
5. Ensure the left and right options are completely unique and not variations of previous options
 
Examples of what to AVOID if they were used before:
- If "beach" was used, don't use "coastline", "seaside", "ocean"
- If "luxury" was used, don't use "premium", "upscale", "high-end"
- If "hiking" was used, don't use "walking", "trekking", "trails"
 
Generate a FRESH, UNIQUE question for "${nextCategory}" with completely new vocabulary.
 
RESPOND WITH ONLY JSON - NO MARKDOWN OR CODE BLOCKS:
`

    const { text } = await generateText({
      model: azure('gpt-4o-mini'),
      system: SWIPE_AWAY_SYSTEM_PROMPT,
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
