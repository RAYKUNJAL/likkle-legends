import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold">L</div>
              <span className="font-heading font-bold text-xl">Likkle<span className="text-primary">Legends</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering the next generation with Caribbean pride, emotional intelligence, and endless joy.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-6 text-lg">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to={isHome ? "#pricing" : "/#pricing"} className="hover:text-white transition-colors">Subscribe</Link></li>
              <li><Link to="/gift" className="hover:text-white transition-colors">Gift A Subscription</Link></li>
              <li><Link to="/past-boxes" className="hover:text-white transition-colors">Past Boxes</Link></li>
              <li><Link to="/merch" className="hover:text-white transition-colors">Merchandise</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-6 text-lg">Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-6 text-lg">Join the Club</h4>
            <p className="text-gray-400 text-sm mb-4">Get the latest news and special offers.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-gray-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-primary outline-none"
              />
              <button className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                GO
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Likkle Legends. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed with ❤️ for the Culture.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;