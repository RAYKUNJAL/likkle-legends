import React from 'react';
import { UserProvider } from './components/UserContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Gallery from './components/Gallery';
import DigitalPortal from './components/DigitalPortal';
import Characters from './components/Characters';
import ParentDashboard from './components/ParentDashboard';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ExitIntentModal from './components/ExitIntentModal';
import MobileFloatingCTA from './components/MobileFloatingCTA';
import UpgradeBanner from './components/UpgradeBanner';

function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-white font-sans text-text antialiased selection:bg-primary/20 selection:text-primary">
        <Header />
        <main>
          <Hero />
          <Features />
          <DigitalPortal />
          <ParentDashboard />
          <Gallery />
          <Characters />
          <Pricing />
          <Testimonials />
        </main>
        <Footer />
        
        {/* CRO Components */}
        <ExitIntentModal />
        <MobileFloatingCTA />
        <UpgradeBanner />
      </div>
    </UserProvider>
  );
}

export default App;