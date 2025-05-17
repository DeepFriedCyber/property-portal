'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface GitHubPagesLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * Custom Link component that handles GitHub Pages base path
 */
export default function GitHubPagesLink({
  href,
  children,
  className,
  ...props
}: GitHubPagesLinkProps) {
  const pathname = usePathname();
  
  // Check if we're on GitHub Pages
  const isGitHubPages = typeof window !== 'undefined' && 
    window.location.hostname.includes('github.io');
  
  // Adjust href for GitHub Pages
  let adjustedHref = href;
  if (isGitHubPages && href.startsWith('/') && !href.startsWith('/property-portal')) {
    adjustedHref = `/property-portal${href}`;
  }

  return (
    <Link href={adjustedHref} className={className} {...props}>
      {children}
    </Link>
  );
}