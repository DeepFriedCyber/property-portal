import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent Dashboard',
  description: 'Manage your property listings, uploads, and agent profile.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Agent Dashboard | Property Portal',
    description: 'Manage your property listings and agent profile',
    images: [
      {
        url: 'https://property-portal.com/images/agent-dashboard-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Agent Dashboard',
      },
    ],
  },
}
