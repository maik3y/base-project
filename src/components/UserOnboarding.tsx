'use client'

import { useState } from 'react'
import {
  UserProfile,
  BUDGET_RANGES,
  TRIP_PURPOSES,
  AGE_RANGES,
} from '../types/seekend'

interface UserOnboardingProps {
  onComplete: (profile: UserProfile) => void
}

export default function UserOnboarding({ onComplete }: UserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    gender: 'prefer-not-to-say',
    budget: { min: 150, max: 300, currency: 'EUR' },
    tripPurpose: [],
  })

  const totalSteps = 4

  const setBudgetRange = (range: (typeof BUDGET_RANGES)[number]) => {
    setProfile(prev => ({
      ...prev,
      budget: {
        min: range.min,
        max: range.max,
        currency: 'EUR',
      },
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    } else if (isProfileComplete()) {
      onComplete(profile as UserProfile)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const isProfileComplete = () => {
    return (
      profile.name &&
      profile.age &&
      profile.location &&
      profile.tripPurpose &&
      profile.tripPurpose.length > 0
    )
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profile.name && profile.age && profile.gender
      case 2:
        return profile.location
      case 3:
        return profile.budget
      case 4:
        return profile.tripPurpose && profile.tripPurpose.length > 0
      default:
        return false
    }
  }

  const toggleTripPurpose = (purpose: string) => {
    const current = profile.tripPurpose || []
    const updated = current.includes(purpose)
      ? current.filter(p => p !== purpose)
      : [...current, purpose]

    setProfile(prev => ({ ...prev, tripPurpose: updated }))
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Progress indicator */}
      <div className="mb-8 flex justify-center">
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-3 w-8 rounded-full transition-all duration-500 ${
                i + 1 === currentStep
                  ? 'scale-110 bg-gradient-to-r from-purple-500 to-blue-600'
                  : i + 1 < currentStep
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gray-300/70'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-lg select-none">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="text-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Tell us about yourself
            </h2>

            <div className="space-y-4 text-left">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={e =>
                    setProfile(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-black transition-all outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  placeholder="Your first name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  min={AGE_RANGES.MIN}
                  max={AGE_RANGES.MAX}
                  value={profile.age || ''}
                  onChange={e =>
                    setProfile(prev => ({
                      ...prev,
                      age: parseInt(e.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-black transition-all outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  placeholder={`${AGE_RANGES.MIN}-${AGE_RANGES.MAX} years old`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  value={profile.gender}
                  onChange={e =>
                    setProfile(prev => ({
                      ...prev,
                      gender: e.target.value as UserProfile['gender'],
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-black transition-all outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="text-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Where are you located?
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                City/Country
              </label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={e =>
                  setProfile(prev => ({ ...prev, location: e.target.value }))
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-black transition-all outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="e.g., Amsterdam, Netherlands"
              />
              <p className="mt-2 text-sm text-gray-500">
                This helps us suggest nearby destinations within your budget
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {currentStep === 3 && (
          <div className="text-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              What&apos;s your budget?
            </h2>

            <div className="space-y-3">
              {BUDGET_RANGES.map(range => (
                <button
                  key={range.label}
                  onClick={() => setBudgetRange(range)}
                  className={`w-full rounded-2xl border-2 p-4 text-black transition-all ${
                    profile.budget?.min === range.min &&
                    profile.budget?.max === range.max
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="font-semibold">{range.label}</div>
                  <div className="text-sm text-gray-600">
                    Perfect for weekend getaways
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Trip Purpose */}
        {currentStep === 4 && (
          <div className="text-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              What are you looking for?
            </h2>
            <p className="mb-6 text-gray-600">Select all that interest you</p>

            <div className="grid grid-cols-2 gap-3">
              {TRIP_PURPOSES.map(purpose => (
                <button
                  key={purpose}
                  onClick={() => toggleTripPurpose(purpose)}
                  className={`rounded-xl border-2 p-3 text-sm transition-all ${
                    profile.tripPurpose?.includes(purpose)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  {purpose}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`rounded-2xl px-6 py-3 font-medium transition-all ${
              currentStep === 1
                ? 'cursor-not-allowed text-gray-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`rounded-2xl px-8 py-3 font-semibold transition-all ${
              canProceed()
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg hover:scale-105'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            {currentStep === totalSteps ? 'Start Adventure!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
