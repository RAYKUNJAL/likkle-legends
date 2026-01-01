"use client";

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Wand2, Upload, Loader2 } from 'lucide-react';
import Button from './Button';
import { generateImageEdit } from '../lib/gemini';
import { useUser } from './UserContext';

const ImageEditor: React.FC = () => {
  const { canAccess } = useUser();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locked = !canAccess('legends_plus');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Base64 string for display
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setLoading(true);
    try {
      // Extract raw base64 without prefix
      const base64Data = selectedImage.split(',')[1];
      const result = await generateImageEdit(base64Data, prompt);
      setGeneratedImage(result);
    } catch (error) {
      alert("Oops! Something went wrong with the magic.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-purple-100 relative h-full flex flex-col">
      {locked && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-purple-600 text-white p-3 rounded-full mb-3 shadow-lg">
            <Wand2 size={24} />
          </div>
          <h3 className="font-heading font-bold text-xl text-deep mb-2">Upgrade to Unlock Creative Studio</h3>
          <p className="text-textLight text-sm mb-4 max-w-xs">Use AI magic to edit photos and create art!</p>
          <a href="/checkout?plan=legends_plus" className="px-4 py-2 bg-primary text-white rounded-lg font-bold">Unlock Now</a>
        </div>
      )}

      <div className="bg-purple-50 p-4 border-b border-purple-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center">
          <Wand2 size={20} />
        </div>
        <div>
          <h3 className="font-heading font-bold text-deep">Creative Studio</h3>
          <p className="text-xs text-textLight">Powered by Nano Banana AI</p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        {/* Image Area */}
        <div className="flex-1 min-h-[200px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden group">
          {!selectedImage ? (
            <div className="text-center p-4">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} className="mr-2" /> Upload Photo
              </Button>
              <p className="text-xs text-gray-400 mt-2">Upload a photo to add magic</p>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={generatedImage || selectedImage}
                alt="Workspace"
                className="max-h-full max-w-full object-contain"
              />
              {loading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                  <Loader2 size={40} className="animate-spin text-purple-600" />
                </div>
              )}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            aria-label="Upload photo"
            onChange={handleImageUpload}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., Make it look like a painting, Add fireworks..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!selectedImage || locked}
          />
          <button
            onClick={handleGenerate}
            disabled={!selectedImage || !prompt || loading || locked}
            aria-label="Generate image edit"
            title="Generate image edit"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 disabled:opacity-50 transition-colors"
          >
            <Wand2 size={20} />
          </button>
        </div>
        {selectedImage && !locked && (
          <button
            onClick={() => { setSelectedImage(null); setGeneratedImage(null); setPrompt(''); }}
            className="text-xs text-gray-400 hover:text-red-500 underline text-center"
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;