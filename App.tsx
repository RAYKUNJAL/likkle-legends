import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import ExitIntentModal from './components/ExitIntentModal';
import MobileFloatingCTA from './components/MobileFloatingCTA';
import UpgradeBanner from './components/UpgradeBanner';
import ScrollToTop from './components/ScrollToTop';

// Page Imports
import { PrivacyPolicy, ShippingReturns, FAQ, ContactUs } from './pages/LegalPages';
import { PastBoxes, Merchandise, GiftSubscription } from './pages/ShopPages';

function App() {
  return (
    <Router>
      <UserProvider>
        <div className="min-h-screen bg-white font-sans text-text antialiased selection:bg-primary/20 selection:text-primary flex flex-col">
          <ScrollToTop />
          <Header />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Legal & Support */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/shipping" element={<ShippingReturns />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<ContactUs />} />
              
              {/* Shop */}
              <Route path="/past-boxes" element={<PastBoxes />} />
              <Route path="/merch" element={<Merchandise />} />
              <Route path="/gift" element={<GiftSubscription />} />
            </Routes>
          </main>

          <Footer />
          
          {/* CRO Components - Only show on Home roughly, or manage visibility internally */}
          <ExitIntentModal />
          <MobileFloatingCTA />
          <UpgradeBanner />
        </div>
      </UserProvider>
    </Router>
  );
}

export default App;