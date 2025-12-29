import React, { useState } from 'react';
import { MessageCircle, Send, Volume2, VolumeX } from 'lucide-react';
import { useUser } from './UserContext';
import { generateAIResponse } from '../lib/gemini'
import Button from './Button';
const FeelingsCoach: React.FC = () => {
  const { user, isLocked, upgradeTier } = useUser();
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: `Hello ${user.name}! It's Tanty Spice. How are you feeling today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  const locked = isLocked('legends_plus');

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const contextString = JSON.stringify({
      child_name: user.name,
      child_age_group: user.ageGroup === 'mini' ? 'Mini Legends (4-5)' : 'Big Legends (6-8)',
      role: 'child'
    });

    const responseText = await generateAIResponse(
      newMessages, 
      input, 
      contextString
    );
    
    const finalText = responseText || "I'm listening, my dear.";

    setMessages([...newMessages, { role: 'model', text: finalText }]);
    setIsLoading(false);

    if (voiceEnabled) {
      // Use 'Kore' for Tanty Spice (Warm female voice)
      await playTextToSpeech(finalText, 'Kore');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-accent/10 flex flex-col h-[500px] relative">
       {locked && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-accent text-white p-3 rounded-full mb-3 shadow-lg">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-heading font-bold text-xl text-deep mb-2">Upgrade to Chat with Tanty Spice</h3>
          <p className="text-textLight text-sm mb-4 max-w-xs">Unlock the Feelings & Culture Coach for emotional support and learning.</p>
          <Button size="sm" onClick={() => upgradeTier('legends_plus')}>Chat Now</Button>
        </div>
      )}

      <div className="bg-accent/10 p-4 border-b border-accent/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white">TS</div>
          <div>
             <h3 className="font-heading font-bold text-deep">Tanty Spice</h3>
             <p className="text-xs text-textLight">Feelings & Culture Coach</p>
          </div>
        </div>
        <button 
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-2 rounded-full transition-colors ${voiceEnabled ? 'bg-accent text-white' : 'bg-white text-gray-400'}`}
          title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
        >
          {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-deep text-white rounded-tr-none' 
                : 'bg-white border border-gray-100 text-text rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-gray-400 text-sm animate-pulse">
              Tanty Spice is thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            disabled={locked}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={locked || isLoading}
            className="bg-accent text-white p-3 rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-50 shadow-md shadow-accent/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeelingsCoach;
