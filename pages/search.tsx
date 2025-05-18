import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Property } from '@/types/property'
import SearchInput from '@/components/SearchInput'
import PropertyCard from '@/components/PropertyCard'
import LoadMore from '@/components/LoadMore'
import Pagination from '@/components/Pagination'

interface SearchPageProps {
  properties: Property[]
  totalCount: number
  query: string
  page: number
  totalPages: number
}

export default function SearchPage({
  properties,
  totalCount,
  query,
  page,
  totalPages,
}: SearchPageProps) {
  const router = useRouter()
  const useInfiniteScroll = router.query.scroll === 'infinite'

  const toggleScrollMode = () => {
    const newQuery = { ...router.query }
    if (useInfiniteScroll) {
      delete newQuery.scroll
    } else {
      newQuery.scroll = 'infinite'
    }
    router.push({
      pathname: '/search',
      query: newQuery,
    })
  }

  return (
    <>
      <Head>
        <title>
          {query ? `Search results for "${query}"` : 'Search Properties'} | Property Portal
        </title>
        <meta
          name="description"
          content={`Search results for properties${query ? ` matching "${query}"` : ''}`}
        />
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>

        <SearchInput />

        <div className="mb-4 flex justify-between items-center">
          <div>
            {query ? (
              <p className="text-gray-600">
                Found {totalCount} properties matching{' '}
                <span className="font-semibold">"{query}"</span>
              </p>
            ) : (
              <p className="text-gray-600">Showing all properties</p>
            )}
          </div>

          <button
            onClick={toggleScrollMode}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            {useInfiniteScroll ? 'Switch to Pagination' : 'Switch to Infinite Scroll'}
          </button>
        </div>

        {properties.length === 0 ? (
          <p className="text-gray-500 py-10 text-center">
            No properties found. Try a different search term.
          </p>
        ) : useInfiniteScroll ? (
          <LoadMore initial={properties} query={query} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {properties.map(property => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={`/search?q=${encodeURIComponent(query)}&page=`}
              />
            )}
          </>
        )}
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  const query = (context.query.q as string) || ''
  const page = parseInt((context.query.page as string) || '1')
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

    return {
      props: {
        properties: data.properties || [],
        totalCount: data.totalCount || 0,
        query,
        page,
        totalPages: Math.ceil((data.totalCount || 0) / limit),
      },
    }
  } catch (error) {
    console.error('Error fetching properties:', error)
    return {
      props: {
        properties: [],
        totalCount: 0,
        query,
        page,
        totalPages: 0,
      },
    }
  }
}
