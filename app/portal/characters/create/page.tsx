'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ISLAND_OPTIONS = [
  { value: 'jamaica', label: '🇯🇲 Jamaica' },
  { value: 'trinidad', label: '🇹🇹 Trinidad & Tobago' },
  { value: 'barbados', label: '🇧🇧 Barbados' },
  { value: 'haiti', label: '🇭🇹 Haiti' },
  { value: 'belize', label: '🇧🇿 Belize' },
  { value: 'dominica', label: '🇩🇲 Dominica' },
  { value: 'grenada', label: '🇬🇩 Grenada' },
  { value: 'stlucia', label: '🇱🇨 St. Lucia' },
  { value: 'suriname', label: '🇸🇷 Suriname' }
];

const COLORS = [
  { value: 'purple', label: '🟣 Purple', hex: '#a855f7' },
  { value: 'green', label: '🟢 Green', hex: '#22c55e' },
  { value: 'blue', label: '🔵 Blue', hex: '#3b82f6' },
  { value: 'yellow', label: '🟡 Yellow', hex: '#facc15' },
  { value: 'red', label: '🔴 Red', hex: '#ef4444' },
  { value: 'pink', label: '🩷 Pink', hex: '#ec4899' },
  { value: 'orange', label: '🟠 Orange', hex: '#f97316' }
];

export default function CreateCharacterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    ageRange: '7-8',
    island: 'jamaica',
    accent: 'jamaican',
    color: 'purple'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        setError('Character name is required');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/portal/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/portal?tab=characters');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create character');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/portal" className="text-purple-100 hover:text-white mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold">Create Your Character</h1>
          <p className="text-purple-100 mt-2">Design a fun Caribbean character to play with!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Character Name */}
          <div>
            <label htmlFor="name" className="block text-lg font-bold text-gray-900 mb-3">
              What's Your Character's Name? 🎭
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Asha, Kai, Luna"
              maxLength={30}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
            />
            <p className="text-sm text-gray-600 mt-2">{formData.name.length}/30 characters</p>
          </div>

          {/* Age Range */}
          <div>
            <label htmlFor="ageRange" className="block text-lg font-bold text-gray-900 mb-3">
              Character Age Range 🎂
            </label>
            <select
              id="ageRange"
              name="ageRange"
              value={formData.ageRange}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
            >
              <option value="3-4">3-4 years old</option>
              <option value="5-6">5-6 years old</option>
              <option value="7-8">7-8 years old</option>
              <option value="9+">9+ years old</option>
            </select>
          </div>

          {/* Island Heritage */}
          <div>
            <label htmlFor="island" className="block text-lg font-bold text-gray-900 mb-3">
              Island Heritage 🏝️
            </label>
            <select
              id="island"
              name="island"
              value={formData.island}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
            >
              {ISLAND_OPTIONS.map(island => (
                <option key={island.value} value={island.value}>
                  {island.label}
                </option>
              ))}
            </select>
          </div>

          {/* Accent/Dialect */}
          <div>
            <label htmlFor="accent" className="block text-lg font-bold text-gray-900 mb-3">
              Accent & Dialect 🗣️
            </label>
            <select
              id="accent"
              name="accent"
              value={formData.accent}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
            >
              <option value="jamaican">Jamaican Patois</option>
              <option value="trinidadian">Trinidadian English</option>
              <option value="haitian">Haitian Kreyòl</option>
              <option value="bajan">Bajan Dialect</option>
              <option value="standard">Standard English</option>
              <option value="spanish">Spanish</option>
            </select>
          </div>

          {/* Favorite Color */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4">
              Favorite Color 🎨
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COLORS.map(colorOption => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: colorOption.value }))}
                  className={`p-4 rounded-lg font-semibold transition-all ${
                    formData.color === colorOption.value
                      ? 'ring-4 ring-purple-500 scale-105'
                      : 'hover:scale-105'
                  } border-2 border-gray-200`}
                  style={{ backgroundColor: colorOption.hex + '20' }}
                >
                  {colorOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-all text-lg"
            >
              {loading ? 'Creating Character...' : '✨ Create Character'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Tips for Creating Your Character</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Choose a name that represents your character's personality</li>
            <li>✓ Pick an island heritage to celebrate Caribbean culture</li>
            <li>✓ Select a dialect to give your character a unique voice</li>
            <li>✓ Choose your favorite color for your character's special outfits</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
