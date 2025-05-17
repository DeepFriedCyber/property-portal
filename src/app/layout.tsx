import { Inter } from 'next/font/google';
import { ThemeProvider } from './providers/ThemeProvider';
import ThemeScript from './components/ThemeScript';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Property Portal',
  description: 'Find your dream property',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.className} bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-dark-text-primary min-h-screen transition-colors duration-300`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}