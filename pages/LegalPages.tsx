import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MapPin, Send } from 'lucide-react';
import Button from '../components/Button';

// --- SHARED LAYOUT ---
const PageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="pt-10 pb-20 bg-background min-h-[60vh]">
    <div className="bg-primary py-12 mb-10">
      <div className="container mx-auto px-4">
        <h1 className="font-heading font-bold text-4xl text-white text-center">{title}</h1>
      </div>
    </div>
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100">
        {children}
      </div>
    </div>
  </div>
);

// --- PRIVACY POLICY ---
export const PrivacyPolicy: React.FC = () => (
  <PageLayout title="Privacy Policy">
    <div className="prose prose-lg max-w-none text-textLight">
      <h3 className="text-text font-heading font-bold">1. Introduction</h3>
      <p>Welcome to Likkle Legends. We respect your privacy and are committed to protecting the personal data of our little legends and their families.</p>
      
      <h3 className="text-text font-heading font-bold mt-6">2. Data We Collect</h3>
      <p>We collect information you provide directly to us, such as name, shipping address, and email address when you subscribe. For the digital portal, we store progress on missions and badges.</p>

      <h3 className="text-text font-heading font-bold mt-6">3. Children's Privacy</h3>
      <p>We do not collect personal information from children under 13 without parental consent. The digital portal is designed to be used with parent supervision.</p>

      <h3 className="text-text font-heading font-bold mt-6">4. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at support@likklelegends.com.</p>
    </div>
  </PageLayout>
);

// --- SHIPPING & RETURNS ---
export const ShippingReturns: React.FC = () => (
  <PageLayout title="Shipping & Returns">
     <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-heading font-bold text-deep mb-4 flex items-center gap-2">
            Shipping Information
          </h3>
          <ul className="space-y-3 text-textLight">
            <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Orders ship on the 4th of every month.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">✓</span> US Shipping: 3-5 Business Days.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">✓</span> International Shipping: 7-14 Business Days.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Free shipping on orders over $75.</li>
          </ul>
        </div>
        
        <div className="h-px bg-gray-100"></div>

        <div>
          <h3 className="text-2xl font-heading font-bold text-deep mb-4">
             Hassle-Free Returns
          </h3>
          <p className="text-textLight mb-4">
             We want you to love your Likkle Legends box. If you're not 100% satisfied, you can return your first box for a full refund within 30 days.
          </p>
          <p className="font-bold text-text">To start a return:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-2 text-textLight">
             <li>Email support@likklelegends.com with your Order #.</li>
             <li>We will send you a prepaid shipping label.</li>
             <li>Drop the box off at any local post office.</li>
          </ol>
        </div>
     </div>
  </PageLayout>
);

// --- FAQ ---
export const FAQ: React.FC = () => {
  const faqs = [
    { q: "What age range is this for?", a: "Likkle Legends is perfect for children ages 4-8. We have 'Mini' content for 4-5 year olds and 'Big' content for 6-8 year olds." },
    { q: "Can I cancel anytime?", a: "Yes! There are no commitments. You can pause or cancel your subscription directly from the Parent Dashboard at any time." },
    { q: "Do you ship internationally?", a: "Yes, we ship specifically to the US, UK, Canada, and throughout the Caribbean." },
    { q: "Is the digital content safe?", a: "Absolutely. Our portal is COPPA compliant, ad-free, and designed for safe, guided exploration." },
    { q: "What is in the box exactly?", a: "Every month includes a personalized letter, a cultural activity/craft, 2-3 collectible flashcards, stickers, and access to new digital stories." }
  ];

  return (
    <PageLayout title="Frequently Asked Questions">
      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <AccordionItem key={idx} question={item.q} answer={item.a} />
        ))}
      </div>
      <div className="mt-10 text-center bg-gray-50 p-6 rounded-2xl">
        <p className="text-text font-bold mb-2">Still have questions?</p>
        <Button onClick={() => window.location.href='/contact'}>Contact Support</Button>
      </div>
    </PageLayout>
  );
};

const AccordionItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 text-left"
      >
        <span className="font-heading font-bold text-deep text-lg">{question}</span>
        {isOpen ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-5 pt-0 bg-white text-textLight leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

// --- CONTACT US ---
export const ContactUs: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <PageLayout title="Contact Us">
         <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Send size={32} />
            </div>
            <h3 className="text-2xl font-bold text-deep mb-2">Message Sent!</h3>
            <p className="text-textLight mb-6">We'll get back to you within 24 hours.</p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="!text-deep !border-gray-300">Send Another</Button>
         </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Contact Us">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div>
            <h3 className="text-2xl font-heading font-bold text-deep mb-4">Get in Touch</h3>
            <p className="text-textLight mb-8">We'd love to hear from you! Whether you have a question about your subscription, feedback on a box, or just want to say hello.</p>
            
            <div className="space-y-4">
               <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                     <Mail size={20} />
                  </div>
                  <div>
                     <p className="font-bold text-text">Email</p>
                     <p className="text-textLight">support@likklelegends.com</p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="bg-secondary/10 p-3 rounded-full text-secondary">
                     <MapPin size={20} />
                  </div>
                  <div>
                     <p className="font-bold text-text">Headquarters</p>
                     <p className="text-textLight">Port of Spain, Trinidad & Tobago</p>
                  </div>
               </div>
            </div>
         </div>

         <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <div>
               <label className="block text-sm font-bold text-text mb-1">Name</label>
               <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div>
               <label className="block text-sm font-bold text-text mb-1">Email</label>
               <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div>
               <label className="block text-sm font-bold text-text mb-1">Message</label>
               <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none" required></textarea>
            </div>
            <Button fullWidth type="submit">Send Message</Button>
         </form>
      </div>
    </PageLayout>
  );
};