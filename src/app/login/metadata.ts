import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Property Portal account to manage your properties, saved searches, and more.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Sign In | Property Portal',
    description: 'Access your Property Portal account',
    images: [
      {
        url: 'https://property-portal.com/images/login-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Property Portal Login',
      },
    ],
  },
}