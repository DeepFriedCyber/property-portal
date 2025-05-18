import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage users, properties, and system settings.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Admin Dashboard | Property Portal',
    description: 'Manage users, properties, and system settings',
    images: [
      {
        url: 'https://property-portal.com/images/admin-dashboard-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Admin Dashboard',
      },
    ],
  },
}
