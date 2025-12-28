import React from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Button from './Button';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-scale-up"
        style={{ 
          // Using a vibrant Caribbean beach/tropical scene
          backgroundImage: 'url("https://images.unsplash.com/photo-1590523278135-1e992929db14?q=80&w=2670&auto=format&fit=crop")', 
        }}
      >
        {/* Adjusted gradient for better text readability on bright background */}
        <div className="absolute inset-0 bg-gradient-to-r from-deep/80 via-deep/50 to-deep/20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-10">
        <div className="max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white font-bold text-sm mb-6 tracking-wide backdrop-blur-md border border-white/20">
            AGES 4-8 • CARIBBEAN CULTURE & SEL
          </span>
          
          <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 drop-shadow-lg">
            Your Child Just Got a <span className="text-primary text-shadow-sm">Magical Letter</span> from a Likkle Legend!
          </h1>
          
          <p className="font-sans text-xl md:text-2xl text-gray-100 mb-10 leading-relaxed max-w-2xl drop-shadow-md">
            A monthly adventure in culture, confidence, and Caribbean fun — delivered straight to your mailbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" onClick={() => window.location.href = '#pricing'}>
              Start The Adventure <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = '#examples'}>
              <PlayCircle className="mr-2 w-5 h-5" /> See What's Inside
            </Button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/90 font-medium text-sm md:text-base">
            <span className="flex items-center drop-shadow-sm">✓ 500+ Happy Families</span>
            <span className="flex items-center drop-shadow-sm">✓ Cancel Anytime</span>
            <span className="flex items-center drop-shadow-sm">✓ Ships Worldwide</span>
          </div>
        </div>
      </div>
      
      {/* Decorative Wave at bottom */}
      <div className="absolute bottom-0 left-0 w-full leading-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto text-white fill-current">
          <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;