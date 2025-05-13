import React from 'react';
import './globals.css';

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
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}