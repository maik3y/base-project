'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { UserProfile, TripResult } from '../types/swipe-away'

interface Question {
  id: string
  text: string
  leftOption: string
  rightOption: string
}

interface Answer {
  questionId: string
  answer: 'left' | 'right'
}

interface SwipeWizardProps {
  userProfile: UserProfile
  onTripGenerated?: (tripResult: TripResult) => void
}

export default function SwipeWizard({
  userProfile,
  onTripGenerated,
}: SwipeWizardProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Current question index is based on the number of answers given
  const currentIndex = answers.length
  const currentQuestion = questions[currentIndex]

  const generateNextQuestion = useCallback(async () => {
    // Prevent duplicate API calls
    if (isLoading) {
      console.log('⚠️ Preventing duplicate question generation')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          previousAnswers: answers,
          questionCount: answers.length,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setQuestions(prev => [...prev, data.question])
      } else {
        console.error('Failed to generate question:', data.error)
        // Fallback to completing if we can't generate more questions
        if (answers.length >= 3) {
          setIsComplete(true)
        }
      }
    } catch (error) {
      console.error('Error generating question:', error)
      // Fallback to completing if we can't generate questions
      if (answers.length >= 3) {
        setIsComplete(true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [userProfile, answers, isLoading])

  const generateTripRecommendation = useCallback(
    async (finalAnswers: Answer[]) => {
      setIsLoading(true)
      try {
        // Prepare answers with question context for better LLM understanding
        const answersWithContext = finalAnswers.map((answer, index) => ({
          questionId: answer.questionId,
          answer: answer.answer,
          question: questions[index]?.text,
          leftOption: questions[index]?.leftOption,
          rightOption: questions[index]?.rightOption,
        }))

        const response = await fetch('/api/generate-trip', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userProfile,
            swipeAnswers: answersWithContext,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setIsComplete(true)
          onTripGenerated?.(data.tripResult)
        } else {
          console.error('Failed to generate trip:', data.error)
          // Still complete but with error state
          setIsComplete(true)
        }
      } catch (error) {
        console.error('Error generating trip:', error)
        // Still complete but with error state
        setIsComplete(true)
      } finally {
        setIsLoading(false)
      }
    },
    [userProfile, questions, onTripGenerated]
  )

  // Generate the first question when component mounts
  useEffect(() => {
    if (!isInitialized && questions.length === 0 && !isLoading) {
      setIsInitialized(true)
      generateNextQuestion()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty - only run once on mount to prevent duplicate calls

  const handleAnswer = async (answer: 'left' | 'right') => {
    // Prevent multiple clicks during processing
    if (isLoading) return

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer,
    }

    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    // Reset drag state
    setDragOffset({ x: 0, y: 0 })

    // Check if we should generate another question or complete
    if (updatedAnswers.length >= 6) {
      // Generate trip recommendation
      await generateTripRecommendation(updatedAnswers)
    } else {
      // Generate next question (the loading state will show until it's ready)
      await generateNextQuestion()
    }
  }

  const resetWizard = () => {
    setAnswers([])
    setQuestions([])
    setIsComplete(false)
    setIsInitialized(false)
    setDragOffset({ x: 0, y: 0 })
    // Regenerate first question
    generateNextQuestion()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleMouseUp = () => {
    if (!isDragging) return

    const threshold = 120 // Increased threshold - requires more swipe distance
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        handleAnswer('right')
      } else {
        handleAnswer('left')
      }
    }

    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  const getCardStyle = () => {
    const rotation = dragOffset.x * 0.1
    const opacity = 1 - Math.abs(dragOffset.x) / 300

    return {
      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
      opacity: Math.max(opacity, 0.5),
    }
  }

  const getIndicatorOpacity = (side: 'left' | 'right') => {
    if (side === 'left' && dragOffset.x < -40) {
      return Math.min(Math.abs(dragOffset.x) / 120, 1)
    }
    if (side === 'right' && dragOffset.x > 40) {
      return Math.min(dragOffset.x / 120, 1)
    }
    return 0
  }

  if (isComplete) {
    return (
      <div className="text-center select-none">
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/90 to-white/70 p-8 shadow-2xl backdrop-blur-sm select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-blue-400/10"></div>
          <div className="relative z-10">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-2xl font-bold text-white shadow-lg">
              ✓
            </div>
            <h2 className="mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-3xl font-bold text-transparent">
              Preferences Complete!
            </h2>
            <p className="mb-8 text-gray-700 opacity-80">
              Your personalized results are ready
            </p>

            <div className="space-y-4">
              {questions.map((question, index) => {
                const answerObj = answers.find(
                  a => a.questionId === question.id
                )
                const selectedOption =
                  answerObj?.answer === 'left'
                    ? question.leftOption
                    : question.rightOption

                return (
                  <div
                    key={question.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-r from-white/80 to-white/60 p-4 backdrop-blur-sm transition-all duration-300 hover:from-white/90 hover:to-white/80"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideInUp 0.6s ease-out forwards',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {question.text}
                      </span>
                      <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-1 text-sm font-semibold text-white shadow-md">
                        {selectedOption}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={resetWizard}
              className="group mt-10 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-purple-400/50 focus:outline-none"
            >
              <svg
                className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state if no current question (either initial load or between questions)
  if (
    !currentQuestion &&
    (isLoading || questions.length < answers.length + 1)
  ) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
          <p className="text-white/80">
            {questions.length === 0
              ? 'Generating personalized questions...'
              : 'Loading next question...'}
          </p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <p className="text-white/80">
            Unable to generate questions. Please try again.
          </p>
          <button
            onClick={resetWizard}
            className="mt-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-3 font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[600px] select-none">
      {/* Progress indicator */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex space-x-3 rounded-full border border-white/30 bg-white/60 p-2 backdrop-blur-sm">
          {/* Show completed answers */}
          {answers.map((_, index) => (
            <div
              key={`completed-${index}`}
              className="h-3 w-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-md transition-all duration-500"
            />
          ))}
          {/* Show current question */}
          <div className="h-3 w-3 scale-125 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transition-all duration-500" />
          {/* Show remaining slots (up to 6 total) */}
          {Array.from({ length: Math.max(0, 6 - answers.length - 1) }).map(
            (_, index) => (
              <div
                key={`remaining-${index}`}
                className="h-3 w-3 rounded-full bg-gray-300/70 transition-all duration-500"
              />
            )
          )}
        </div>
      </div>

      {/* Swipe indicators */}
      <div
        className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 px-6 py-3 font-bold text-white shadow-2xl backdrop-blur-sm transition-all duration-200"
        style={{
          opacity: getIndicatorOpacity('left'),
          transform: `translate(-16px, -50%) scale(${getIndicatorOpacity('left') * 0.3 + 0.7})`,
        }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-2xl">✗</span>
          <span>{currentQuestion?.leftOption}</span>
        </div>
      </div>

      <div
        className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-bold text-white shadow-2xl backdrop-blur-sm transition-all duration-200"
        style={{
          opacity: getIndicatorOpacity('right'),
          transform: `translate(16px, -50%) scale(${getIndicatorOpacity('right') * 0.3 + 0.7})`,
        }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-2xl">✓</span>
          <span>{currentQuestion?.rightOption}</span>
        </div>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className="hover:shadow-3xl absolute inset-x-4 top-12 cursor-grab rounded-3xl border border-white/20 bg-white/95 px-6 py-8 shadow-2xl backdrop-blur-lg transition-all duration-300 select-none active:cursor-grabbing"
        style={getCardStyle()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex flex-col items-center text-center">
          <h3 className="mb-8 text-2xl leading-tight font-bold text-gray-800">
            {currentQuestion?.text}
          </h3>

          <div className="mb-8 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="border-red-100/50px-4 flex w-full flex-col items-center rounded-2xl border py-6 text-center text-black transition-transform hover:scale-105">
              <div className="mb-2 text-3xl text-black">
                {currentQuestion?.leftOption.split(' ')[1] || '❄️'}
              </div>
              <div className="text-xs font-semibold text-red-600">
                {currentQuestion?.leftOption}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-2xl font-bold text-transparent">
              VS
            </div>

            <div className="flex w-full flex-col items-center rounded-2xl border px-4 py-6 text-center text-black transition-transform hover:scale-105">
              <div className="mb-2 text-3xl text-black">
                {currentQuestion?.rightOption.split(' ')[1] || '☀️'}
              </div>
              <div className="text-xs font-semibold text-green-600">
                {currentQuestion?.rightOption}
              </div>
            </div>
          </div>

          <p className="text-sm font-medium text-gray-500">
            Drag left or right, or use the buttons below
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 space-x-8">
        <button
          onClick={() => handleAnswer('left')}
          className="group hover:shadow-3xl relative rounded-full bg-gradient-to-r from-red-500 to-pink-600 p-5 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <svg
            className="relative h-7 w-7 transition-transform duration-300 group-hover:rotate-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <button
          onClick={() => handleAnswer('right')}
          className="group hover:shadow-3xl relative rounded-full bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <svg
            className="relative h-7 w-7 transition-transform duration-300 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
