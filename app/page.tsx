import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Likkle Legends | The #1 Caribbean Education Mail Club for Kids",
  description: "Join 500+ families raising proud, confident Caribbean kids. Monthly cultural letters, activities, and AI-powered stories for ages 4-9.",
  alternates: {
    canonical: 'https://likklelegends.com',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto space-y-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-5xl lg:text-7xl font-black text-orange-950">
            🌴 Likkle Legends
          </h1>
          <p className="text-2xl text-orange-800 font-bold">
            Caribbean Culture for Caribbean Kids
          </p>
        </div>

        {/* Tagline */}
        <p className="text-lg text-orange-700 leading-relaxed">
          Join 500+ families raising <strong>proud, confident Caribbean kids</strong>.
          Monthly cultural letters, island adventures, and AI reading buddies for ages 4-9.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <a
            href="/signup"
            className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg"
          >
            Join the Legends 🚀
          </a>
          <a
            href="/characters"
            className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-500 rounded-full font-bold text-lg hover:bg-orange-50 transition-colors"
          >
            Meet Our Guides
          </a>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
          <div className="p-4">
            <div className="text-4xl mb-2">📬</div>
            <h3 className="font-bold text-orange-900">Monthly Mail</h3>
            <p className="text-sm text-orange-700">Real letters to your door</p>
          </div>
          <div className="p-4">
            <div className="text-4xl mb-2">🎭</div>
            <h3 className="font-bold text-orange-900">Island Adventures</h3>
            <p className="text-sm text-orange-700">Guided by Caribbean heroes</p>
          </div>
          <div className="p-4">
            <div className="text-4xl mb-2">🤖</div>
            <h3 className="font-bold text-orange-900">AI Buddy</h3>
            <p className="text-sm text-orange-700">Tanty Spice - always there</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="pt-8 border-t border-orange-200">
          <p className="text-sm text-orange-600 font-medium">
            ✅ Platform Live | 🚀 Ready to Launch | 💪 Fully Functional
          </p>
        </div>
      </div>
    </div>
  );
}
