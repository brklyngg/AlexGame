import React from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success';
}

const PixelButton: React.FC<PixelButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseStyles = "px-6 py-3 font-bold text-xl border-b-4 border-r-4 active:border-b-0 active:border-r-0 active:mt-1 active:ml-1 transition-all uppercase tracking-widest";
  
  const variants = {
    primary: "bg-blue-600 border-blue-900 text-white hover:bg-blue-500",
    danger: "bg-red-600 border-red-900 text-white hover:bg-red-500",
    success: "bg-green-600 border-green-900 text-white hover:bg-green-500",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PixelButton;