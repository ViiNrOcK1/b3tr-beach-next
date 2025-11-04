// app/page.tsx
export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-green-500 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-2xl p-12 text-center max-w-md">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">MOBILE TEST</h1>
        <p className="text-lg text-gray-700 mb-6">
          If you see this, your site is working on mobile!
        </p>
        <div className="text-sm text-gray-500">
          Layout: OK<br />
          Viewport: OK<br />
          Next.js: OK
        </div>
      </div>
    </div>
  );
}