'use client';

import React from 'react';
import { cn } from '../utils';

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterProps {
  links?: FooterLink[];
  copyright?: string;
  className?: string;
  LinkComponent?: React.ComponentType<any>;
}

export const Footer = ({ 
  links = [], 
  copyright = `© ${new Date().getFullYear()} DestinyAI. All rights reserved.`,
  className,
  LinkComponent
}: FooterProps) => {
  const Link = LinkComponent || (({ href, className: linkClassName, children: linkChildren }) => (
    <a href={href} className={linkClassName}>{linkChildren}</a>
  ));

  return (
    <footer className={cn(
      'mt-10 pt-5 border-t border-gray-200',
      'text-sm text-gray-600 text-center',
      className
    )}>
      {links.length > 0 && (
        <div className="flex justify-center gap-5 flex-wrap mb-2.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 no-underline hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
      <p className="m-0">{copyright}</p>
    </footer>
  );
};

