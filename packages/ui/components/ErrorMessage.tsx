'use client';

import React from 'react';
import { cn } from '../utils';

export interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage = ({ message, className }: ErrorMessageProps) => {
  return (
    <div
      className={cn(
        'bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md',
        'text-sm font-medium',
        className
      )}
      role="alert"
    >
      {message}
    </div>
  );
};

