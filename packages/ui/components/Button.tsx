'use client';

import React from 'react';
import { cn } from '../utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 shadow-lg hover:shadow-xl',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg',
  success: 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg',
};

export const Button = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false, 
  className,
  title, 
  type, 
  ...props 
}: ButtonProps) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={title}
      type={type || 'button'}
      {...props}
      className={cn(
        'px-5 py-2.5 rounded-lg font-medium w-full mb-2',
        'transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

