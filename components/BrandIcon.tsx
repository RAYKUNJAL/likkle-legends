import React from 'react';

interface BrandIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const BrandIcon: React.FC<BrandIconProps> = ({ className = "", size = 'md' }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
    '2xl': "w-24 h-24"
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden shrink-0 border-2 border-yellow-200 group`}
      role="img"
      aria-label="Likkle Legends Logo"
    >
       {/* Sun Glare */}
       <div className="absolute top-1 right-2 w-1/3 h-1/3 bg-white/20 rounded-full blur-[2px]"></div>
       
       {/* Icon */}
       <svg viewBox="0 0 24 24" className="w-[60%] h-[60%] text-blue-950 relative z-10" fill="currentColor" aria-hidden="true">
         {/* Stylized Palm Tree */}
         <path d="M12.0002 2C12.0002 2 13.5002 8 13.0002 11C13.0002 11 18.0002 8 19.0002 12C19.0002 12 16.0002 14 14.0002 14C14.0002 14 19.0002 17 17.0002 20C17.0002 20 14.0002 17 13.0002 16C13.0002 16 14.0002 22 14.0002 22H10.0002C10.0002 22 11.0002 16 11.0002 16C10.0002 17 7.00023 20 7.00023 20C7.00023 20 5.00023 14 10.0002 14C8.00023 14 5.00023 12 5.00023 12C6.00023 8 11.0002 11 11.0002 11C10.5002 8 12.0002 2 12.0002 2Z" />
       </svg>
    </div>
  );
};
