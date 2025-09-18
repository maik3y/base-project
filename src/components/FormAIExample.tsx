'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().min(1, 'Company is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

type FormData = z.infer<typeof formSchema>

export default function FormAIExample() {
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const description = watch('description')

  const getAISuggestion = async () => {
    const formData = watch()
    setIsGettingSuggestion(true)

    try {
      const response = await fetch('/api/form-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'improve_description',
          context: {
            name: formData.name,
            company: formData.company,
            currentDescription: formData.description,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestion(data.suggestion)
      }
    } catch (error) {
      console.error('AI suggestion error:', error)
    } finally {
      setIsGettingSuggestion(false)
    }
  }

  const applyAISuggestion = () => {
    setValue('description', aiSuggestion)
    setAiSuggestion('')
  }

  const onSubmit = async (data: FormData) => {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Form submitted successfully!')
    console.log('Form data:', data)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">AI-Powered Form</h3>
      <p className="text-black">
        Form with AI assistance. Get suggestions to improve your input using AI.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              {...register('name')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:outline-none"
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:outline-none"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Company
          </label>
          <input
            {...register('company')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:outline-none"
            placeholder="Your company name"
          />
          {errors.company && (
            <p className="mt-1 text-xs text-red-600">
              {errors.company.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Project Description
            </label>
            <button
              type="button"
              onClick={getAISuggestion}
              disabled={!description || isGettingSuggestion}
              className="rounded bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGettingSuggestion ? 'Getting AI help...' : '✨ AI Improve'}
            </button>
          </div>
          <textarea
            {...register('description')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:outline-none"
            rows={4}
            placeholder="Describe your project or requirements..."
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {aiSuggestion && (
          <div className="rounded-md border border-indigo-200 bg-indigo-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium text-indigo-900">
                AI Suggestion:
              </h4>
              <button
                type="button"
                onClick={applyAISuggestion}
                className="rounded bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700"
              >
                Apply Suggestion
              </button>
            </div>
            <p className="text-sm text-indigo-800">{aiSuggestion}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </button>
      </form>
    </div>
  )
}
