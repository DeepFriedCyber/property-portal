import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'

import { useDebounce } from '../../hooks/useDebounce'
import { Button } from '../../src/ui'

interface HeroProps {
  title?: string
  subtitle?: string
  buttonText?: string
  useInlineSearch?: boolean
  onInlineSearch?: (query: string) => void
}

export default function Hero({
  title = 'Find Your Perfect UK Home',
  subtitle = 'Search smarter with AI-powered property matching and location insights',
  buttonText = 'Search',
  useInlineSearch = false,
  onInlineSearch,
}: HeroProps) {
  const [input, setInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  // Debounce the search input with a 500ms delay
  const debouncedInput = useDebounce(input, 500)

  // Effect to trigger search when debounced input changes
  useEffect(() => {
    if (debouncedInput && debouncedInput.trim() && useInlineSearch && onInlineSearch) {
      handleSearch(true)
    }
  }, [debouncedInput])

  const handleSearch = (isDebounced = false) => {
    if (!input.trim()) return

    if (useInlineSearch && onInlineSearch) {
      // Only set isSearching if this isn't from the debounce effect
      // (to avoid UI flicker when typing quickly)
      if (!isDebounced) {
        setIsSearching(true)
      }

      onInlineSearch(input.trim())

      // Scroll to results
      setTimeout(() => {
        const searchResults = document.getElementById('search-results')
        if (searchResults) {
          searchResults.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
        setIsSearching(false)
      }, 100)
    } else {
      const encoded = encodeURIComponent(input.trim())
      router.push(`/search?query=${encoded}`)
    }
  }

  return (
    <section
      className="bg-gradient-to-br from-purple-700 via-indigo-700 to-indigo-900 text-white py-24 px-6 text-center"
      aria-labelledby="hero-heading"
    >
      <h1 id="hero-heading" className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6">
        {title}
      </h1>
      <p className="text-xl max-w-lg mx-auto mb-10 leading-relaxed">{subtitle}</p>

      <div
        className="bg-white text-black p-5 rounded-2xl max-w-4xl mx-auto shadow-lg"
        role="search"
        aria-label="Property search"
      >
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <div className="w-full flex-1 relative">
            <label
              htmlFor="property-search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search for properties
            </label>
            <input
              id="property-search"
              type="search"
              className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 'Modern flat near Cambridge with a garden'"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              aria-describedby="search-description"
            />
            <div id="search-description" className="mt-1 text-xs text-gray-500">
              Enter location, property type, or features to find your ideal property
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => handleSearch()}
            disabled={!input.trim() || isSearching}
            className="w-full sm:w-auto px-8 py-3 font-semibold rounded-lg transition-transform hover:scale-105 disabled:opacity-50"
            aria-label={isSearching ? 'Searching...' : 'Search for properties'}
          >
            {isSearching ? (
              <>
                <span className="inline-block mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Searching...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
