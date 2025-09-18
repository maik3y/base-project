import AIExamples from '../components/AIExamples'

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black">AI SDK Examples</h1>
          <p className="mt-4 text-lg text-black opacity-70">
            Comprehensive examples using Next.js AI SDK
          </p>
        </div>

        <AIExamples />
      </main>
    </div>
  )
}
