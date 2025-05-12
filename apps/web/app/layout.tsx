import React from 'react';

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
      <body>{children}</body>
    </html>
  );
}