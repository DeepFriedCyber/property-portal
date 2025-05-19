import { Metadata } from 'next'

import SearchPage from './SearchPage'

interface SearchPageProps {
  searchParams: {
    q?: string
    page?: string
    scroll?: string
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || ''

  return {
    title: query
      ? `Search results for "${query}" | Property Portal`
      : 'Search Properties | Property Portal',
    description: `Search results for properties${query ? ` matching "${query}"` : ''}`,
  }
}

export default async function Page({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''
  const page = parseInt(searchParams.page || '1')
  const limit = 6

  try {
    // Fetch properties from API
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/properties?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!res.ok) {
      throw new Error('Failed to fetch properties')
    }

    const data = await res.json()

    return (
      <SearchPage
        properties={data.properties || []}
        totalCount={data.totalCount || 0}
        query={query}
        page={page}
        totalPages={Math.ceil((data.totalCount || 0) / limit)}
      />
    )
  } catch (error) {
    console.error('Error fetching properties:', error)
    return <SearchPage properties={[]} totalCount={0} query={query} page={page} totalPages={0} />
  }
}
