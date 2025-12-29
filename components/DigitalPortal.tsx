import React from 'react';
import StorybookWidget from './StorybookWidget';
import CharacterBuilder from './CharacterBuilder';
import ReadingBuddy from './ReadingBuddy';
import FeelingsCoach from './FeelingsCoach';
import ImageEditor from './ImageEditor';
import ActivityPack from './ActivityPack';
import { Sparkles, Laptop, Download } from 'lucide-react';

const DigitalPortal: React.FC = () => {
  return (
    <section id="digital-portal" className="py-24 bg-indigo-50 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-4">
            <Laptop size={16} className="text-deep" />
            <span className="text-deep font-bold text-xs uppercase tracking-widest">Included in Subscription</span>
          </div>
          <h2 className="font-heading font-bold text-4xl text-text mb-4">
            The Legend's Digital Playground
          </h2>
          <p className="text-textLight text-lg">
            Every box unlocks exclusive access to our safe, ad-free digital portal where the stories come alive.
          </p>
        </div>

        {/* AI Features Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 items-start">
            <ReadingBuddy />
            <FeelingsCoach />
            <ImageEditor />
        </div>

        {/* Content Row: Storybook & Downloads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-12">
          {/* Feature 1: Interactive Story (Takes up 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-2xl text-text">Interactive Storybooks</h3>
                <p className="text-sm text-textLight">Click to hear sounds and learn fun facts!</p>
              </div>
            </div>
            <StorybookWidget />
          </div>

          {/* Feature 2: Downloads (Takes up 1 column) */}
          <div className="space-y-4 flex flex-col">
             <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                <Download size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-2xl text-text">Activity Corner</h3>
                <p className="text-sm text-textLight">Offline fun to print & play.</p>
              </div>
            </div>
            <div className="flex-1">
               <ActivityPack />
            </div>
          </div>
        </div>

        {/* Feature 3: Character Builder (Full width) */}
        <div className="space-y-4">
             <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-2xl text-text">Build Your Legend</h3>
                <p className="text-sm text-textLight">Design your own explorer to join the crew.</p>
              </div>
            </div>
            <CharacterBuilder />
        </div>
      </div>
    </section>
  );
};

export default DigitalPortal;