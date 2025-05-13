import React from 'react';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Property Portal',
  description: 'A modern property listing and management portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-50">{children}</body>
      </html>
    </ClerkProvider>
  );
}