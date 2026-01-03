'use client';

import React from 'react';
import { cn } from '../utils';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  rows?: number;
  className?: string;
}

export const TextArea = ({ label, rows = 5, className, ...props }: TextAreaProps) => (
  <div className="mb-3">
    {label && (
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <textarea 
      rows={rows}
      className={cn(
        'w-full px-4 py-3 rounded-lg border border-gray-300',
        'font-mono text-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        'transition-all duration-200',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        'resize-y',
        'placeholder:text-gray-400',
        className
      )}
      {...props}
    />
  </div>
);

