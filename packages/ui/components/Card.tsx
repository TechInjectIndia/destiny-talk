'use client';

import React from 'react';
import { cn } from '../utils';

export interface CardProps {
  children?: React.ReactNode;
  title: string;
  className?: string;
}

export const Card = ({ children, title, className }: CardProps) => (
  <div className={cn(
    'border border-gray-200 rounded-2xl p-6 my-4 bg-white shadow-md',
    'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
    'backdrop-blur-sm',
    className
  )}>
    <h3 className="card-title mt-0 mb-4">{title}</h3>
    {children}
  </div>
);

