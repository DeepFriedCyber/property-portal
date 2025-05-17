import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent Profile',
  description: 'Update your agent profile, contact information, and professional details.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Agent Profile | Property Portal',
    description: 'Update your agent profile and professional details',
    images: [
      {
        url: 'https://property-portal.com/images/agent-profile-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Agent Profile',
      },
    ],
  },
}