'use client';

import React from 'react';
import { cn } from '../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Input = ({ label, className, ...props }: InputProps) => (
  <div className="mb-3">
    {label && (
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input 
      className={cn(
        'w-full px-4 py-3 rounded-lg border border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        'transition-all duration-200',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        'placeholder:text-gray-400',
        className
      )}
      {...props}
    />
  </div>
);

