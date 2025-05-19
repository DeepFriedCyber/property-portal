import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UK Location Search Example',
  description: 'Example of UK location and postcode search with autocomplete',
}

export default function LocationSearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}