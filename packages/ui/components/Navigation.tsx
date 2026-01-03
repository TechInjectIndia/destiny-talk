'use client';

import React from 'react';
import { cn } from '../utils';

export interface NavigationLink {
  href: string;
  label: string;
}

export interface NavigationProps {
  logo?: React.ReactNode;
  links?: NavigationLink[];
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  LinkComponent?: React.ComponentType<any>;
}

export const Navigation = ({ 
  logo, 
  links = [], 
  rightContent,
  children,
  className,
  LinkComponent
}: NavigationProps) => {
  const Link = LinkComponent || (({ href, className: linkClassName, children: linkChildren }) => (
    <a href={href} className={linkClassName}>{linkChildren}</a>
  ));

  return (
    <nav className={cn(
      'sticky top-0 z-[1000] bg-white/90 backdrop-blur-xl',
      'border-b border-gray-200/50 shadow-sm',
      'transition-all duration-300',
      className
    )}>
      <div className="max-w-7xl mx-auto px-5 py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          {/* Logo and Children (e.g., welcome text) */}
          {(logo || children) && (
            <div className="flex items-center gap-4 flex-wrap">
              {logo}
              {children}
            </div>
          )}

          {/* Navigation Links */}
          {links.length > 0 && (
            <div className="flex gap-2 items-center flex-wrap text-sm">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 no-underline px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 hover:text-primary-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Content */}
          {rightContent && (
            <div className="flex gap-3 items-center flex-wrap">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

