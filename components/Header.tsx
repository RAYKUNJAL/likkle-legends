import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import CountdownTimer from './CountdownTimer';
import { NAV_ITEMS } from '../data';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to generate correct link (hash for home, full path for others)
  const getLink = (link: string) => {
    if (link.startsWith('#')) {
      return isHome ? link : `/${link}`;
    }
    return link;
  };

  return (
    <>
      <div className="bg-secondary text-white text-center py-2 text-sm font-semibold tracking-wide flex justify-center items-center gap-2 flex-wrap px-4">
        <span>🎉 Limited Time: Get 15% OFF your first month</span>
        <div className="hidden sm:flex items-center">
          <span>ends in</span>
          <CountdownTimer />
        </div>
      </div>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-white py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                L
              </div>
              <span className={`font-heading font-bold text-xl md:text-2xl tracking-tight text-text`}>
                Likkle<span className="text-primary">Legends</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
               const href = getLink(item.link);
               const isHash = href.startsWith('#');
               return isHash ? (
                 <a 
                   key={item.label} 
                   href={href}
                   className="text-text font-medium hover:text-primary transition-colors text-sm uppercase tracking-wider"
                 >
                   {item.label}
                 </a>
               ) : (
                 <Link
                   key={item.label} 
                   to={href}
                   className="text-text font-medium hover:text-primary transition-colors text-sm uppercase tracking-wider"
                 >
                   {item.label}
                 </Link>
               );
            })}
            <Link to={isHome ? "#pricing" : "/#pricing"}>
               <Button size="sm">
                 Subscribe Now
               </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-text p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 py-6 px-4 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => {
               const href = getLink(item.link);
               const isHash = href.startsWith('#');
               return isHash ? (
                  <a 
                    key={item.label} 
                    href={href}
                    className="text-text font-medium text-lg py-2 border-b border-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
               ) : (
                  <Link
                    key={item.label} 
                    to={href}
                    className="text-text font-medium text-lg py-2 border-b border-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
               )
            })}
            <Link to={isHome ? "#pricing" : "/#pricing"} onClick={() => setMobileMenuOpen(false)}>
              <Button fullWidth>
                Subscribe Now
              </Button>
            </Link>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;