import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, StopCircle, Lock } from 'lucide-react';
import { useUser } from './UserContext';
import { getReadingFeedback, playTextToSpeech } from '../lib/gemini';
import Button from './Button';

const ReadingBuddy: React.FC = () => {
  const { user, canUseAI, incrementUsage, upgradeTier } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulated story text for the demo
  const storyText = "The sun dipped low over Pigeon Point, painting the sky in shades of mango and hibiscus. Little Jayden watched the waves dance.";

  const allowed = canUseAI();

  const handleStartRecording = () => {
    setIsRecording(true);
    setFeedback(null);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsLoading(true);
    
    // Simulate processing time then call API
    const response = await getReadingFeedback(
      user.ageGroup === 'mini' ? '4' : '7',
      storyText
    );
    
    setIsLoading(false);
    setFeedback(response || "You did amazing! Keep going!");
    incrementUsage(); // Deduct from quota

    // Automatically speak the encouragement (Using Puck for a younger/fun vibe, or Kore)
    // Let's use Kore to be consistent with the brand "Aunty" feel or Puck for a "Buddy"
    if (response) {
       await playTextToSpeech(response, 'Puck');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-primary/10 relative">
      {!allowed && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-deep text-white p-3 rounded-full mb-3 shadow-lg">
            <Lock size={24} />
          </div>
          <h3 className="font-heading font-bold text-xl text-deep mb-2">Monthly Limit Reached</h3>
          <p className="text-textLight text-sm mb-4 max-w-xs">You've used your free session for this month. Upgrade for unlimited AI reading!</p>
          <Button size="sm" onClick={() => upgradeTier('legends_plus')}>Upgrade Now</Button>
        </div>
      )}

      <div className="bg-gradient-to-r from-primary/10 to-orange-50 p-6 border-b border-primary/10 flex justify-between items-center">
        <h3 className="font-heading font-bold text-xl text-deep flex items-center gap-2">
          <Volume2 size={24} className="text-primary" /> 
          AI Reading Buddy
        </h3>
        <div className="flex gap-2">
           <span className="text-xs font-bold uppercase tracking-wider text-primary bg-white px-3 py-1 rounded-full">
             {user.ageGroup === 'mini' ? 'Level 1' : 'Level 2'}
           </span>
           {user.tier === 'mail_club' && (
             <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
               {user.sessionsUsed}/1 Used
             </span>
           )}
        </div>
      </div>

      <div className="p-8">
        <p className="font-heading text-lg md:text-xl text-text leading-relaxed mb-8 text-center">
          "{storyText}"
        </p>

        <div className="flex justify-center mb-6">
          {!isRecording ? (
            <button 
              onClick={handleStartRecording}
              disabled={!allowed}
              className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
            >
              <Mic size={32} />
            </button>
          ) : (
            <button 
              onClick={handleStopRecording}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse"
            >
              <StopCircle size={32} />
            </button>
          )}
        </div>
        
        <p className="text-center text-textLight text-sm mb-6">
          {isRecording ? "Listening... (Read the text above!)" : "Tap the mic and read the story aloud!"}
        </p>

        {isLoading && (
          <div className="text-center p-4 bg-gray-50 rounded-xl animate-pulse">
            <span className="text-primary font-bold">Dilly is listening and thinking...</span>
          </div>
        )}

        {feedback && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-6 animate-fade-in relative">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
               Dilly Says:
             </div>
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white rounded-full text-green-600 shadow-sm">
                 <Volume2 size={20} />
               </div>
               <p className="text-green-800 font-medium">
                 {feedback}
               </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingBuddy;