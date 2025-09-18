import SwipeWizard from '../components/SwipeWizard'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-500/30 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-400/30 to-purple-500/30 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 h-48 w-48 rounded-full bg-gradient-to-r from-purple-300/20 to-indigo-300/20 blur-2xl"></div>
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-gradient-to-r from-purple-500 to-blue-600 shadow-2xl backdrop-blur-sm">
              <span className="text-3xl">✨</span>
            </div>

            <h1 className="mb-4 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-5xl leading-tight font-bold tracking-tight text-transparent">
              Seek-end
            </h1>

            <p className="text-lg leading-relaxed font-medium text-white/90">
              Discover your preferences through
              <br />
              <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text font-semibold text-transparent">
                intuitive swipe interactions
              </span>
            </p>
          </div>

          {/* Wizard Component */}
          <SwipeWizard />
        </div>
      </main>
    </div>
  )
}
