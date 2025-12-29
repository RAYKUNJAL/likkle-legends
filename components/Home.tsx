import React from 'react';
import Hero from './Hero';
import Features from './Features';
import FlashCardShowcase from './FlashCardShowcase';
import DigitalPortal from './DigitalPortal';
import Gallery from './Gallery';
import Characters from './Characters';
import ParentDashboard from './ParentDashboard';
import Pricing from './Pricing';
import Testimonials from './Testimonials';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <FlashCardShowcase />
      <DigitalPortal />
      <ParentDashboard />
      <Gallery />
      <Characters />
      <Pricing />
      <Testimonials />
    </>
  );
};

export default Home;