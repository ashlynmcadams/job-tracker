export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Tracker</h1>
        <p className="text-gray-500 mb-8">Your job search, finally organized.</p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <p className="text-blue-700 font-medium">👋 Welcome — let's get you set up.</p>
        </div>
      </div>
    </main>
  )
}
