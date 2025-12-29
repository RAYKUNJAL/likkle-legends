import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'white';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-heading font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Updated shadow colors to match new brand variables
  const variants = {
    primary: "bg-primary text-white hover:bg-orange-600 focus:ring-primary shadow-lg shadow-orange-500/20",
    secondary: "bg-secondary text-white hover:bg-cyan-600 focus:ring-secondary shadow-lg shadow-cyan-500/20",
    outline: "bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary",
    white: "bg-white text-primary hover:bg-gray-50 focus:ring-white shadow-lg"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;