"use client";

export default function AdminContestsPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Viral Contest Builder</h1>
        <p className="text-lg text-gray-500 mb-2">Coming Soon</p>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          The contest engine is being rebuilt with enhanced features.
          Check back soon for gamified referral loops!
        </p>
      </div>
    </div>
  );
}
