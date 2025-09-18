'use client'

import { useState, useRef } from 'react'

interface Question {
  id: number
  text: string
  leftOption: string
  rightOption: string
}

const questions: Question[] = [
  {
    id: 1,
    text: 'Weather Preference',
    leftOption: 'Cold Weather ❄️',
    rightOption: 'Hot Weather ☀️',
  },
  {
    id: 2,
    text: 'Coffee or Tea?',
    leftOption: 'Tea 🍵',
    rightOption: 'Coffee ☕',
  },
  {
    id: 3,
    text: 'Weekend Activity',
    leftOption: 'Indoor 🏠',
    rightOption: 'Outdoor 🌲',
  },
  {
    id: 4,
    text: 'Pet Preference',
    leftOption: 'Cats 🐱',
    rightOption: 'Dogs 🐶',
  },
  {
    id: 5,
    text: 'Movie Genre',
    leftOption: 'Comedy 😄',
    rightOption: 'Action 💥',
  },
  {
    id: 6,
    text: 'Food Style',
    leftOption: 'Sweet 🍰',
    rightOption: 'Savory 🍕',
  },
]

export default function SwipeWizard() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, 'left' | 'right'>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const currentQuestion = questions[currentIndex]

  const handleAnswer = (answer: 'left' | 'right') => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer,
    }))

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsComplete(true)
    }
  }

  const resetWizard = () => {
    setCurrentIndex(0)
    setAnswers({})
    setIsComplete(false)
    setDragOffset({ x: 0, y: 0 })
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
                const answer = answers[question.id]
                const selectedOption =
                  answer === 'left' ? question.leftOption : question.rightOption

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

  return (
    <div className="relative h-[600px] select-none">
      {/* Progress indicator */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex space-x-3 rounded-full border border-white/30 bg-white/60 p-2 backdrop-blur-sm">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-3 w-3 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? 'scale-125 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                  : index < currentIndex
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-md'
                    : 'bg-gray-300/70'
              }`}
            />
          ))}
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
            <div className="flex w-full flex-col items-center rounded-2xl border border-red-100/50 bg-gradient-to-br from-red-50 to-pink-50 px-4 py-6 text-center transition-transform hover:scale-105">
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

            <div className="flex w-full flex-col items-center rounded-2xl border border-green-100/50 bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-6 text-center transition-transform hover:scale-105">
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
