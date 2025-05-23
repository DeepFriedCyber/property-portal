'use client'

import React, { useState } from 'react'

import logger from '@/lib/logging/logger'

import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import CallToAction from '../components/sections/CallToAction'
import Features from '../components/sections/Features'
import Hero from '../components/sections/Hero'
import SearchResults, { Property } from '../components/sections/SearchResults'

export default function HomePage() {
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Property[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Mock data for the components
  const navLinks = [
    { id: 'buy', label: 'Buy', href: '/buy' },
    { id: 'rent', label: 'Rent', href: '/rent' },
    { id: 'sell', label: 'Sell', href: '/sell' },
    { id: 'agents', label: 'Find Agents', href: '/agents' },
    { id: 'resources', label: 'Resources', href: '/resources' },
  ]

  const features = [
    {
      id: 'search',
      title: 'Advanced Search',
      description: 'Find properties that match your exact criteria with our powerful search tools.',
      icon: '🔍',
    },
    {
      id: 'virtual-tours',
      title: 'Virtual Tours',
      description: 'Explore properties from the comfort of your home with immersive virtual tours.',
      icon: '🏠',
    },
    {
      id: 'alerts',
      title: 'Property Alerts',
      description:
        'Get notified instantly when new properties matching your criteria become available.',
      icon: '🔔',
    },
    {
      id: 'mortgage',
      title: 'Mortgage Calculator',
      description:
        'Plan your finances with our easy-to-use mortgage calculator and affordability tools.',
      icon: '💰',
    },
    {
      id: 'agents',
      title: 'Expert Agents',
      description:
        'Connect with experienced real estate agents who can guide you through the process.',
      icon: '👤',
    },
    {
      id: 'market-insights',
      title: 'Market Insights',
      description: 'Access up-to-date market data and trends to make informed property decisions.',
      icon: '📊',
    },
  ]

  const footerColumns = [
    {
      id: 'buyers',
      title: 'For Buyers',
      links: [
        { id: 'buy-property', label: 'Buy Property', href: '/buy' },
        { id: 'mortgage', label: 'Mortgage Calculator', href: '/mortgage' },
        { id: 'buyer-guides', label: 'Buyer Guides', href: '/guides/buyers' },
        { id: 'saved-properties', label: 'Saved Properties', href: '/account/saved' },
      ],
    },
    {
      id: 'sellers',
      title: 'For Sellers',
      links: [
        { id: 'sell-property', label: 'Sell Property', href: '/sell' },
        { id: 'valuation', label: 'Property Valuation', href: '/valuation' },
        { id: 'seller-guides', label: 'Seller Guides', href: '/guides/sellers' },
        { id: 'find-agent', label: 'Find an Agent', href: '/agents' },
      ],
    },
    {
      id: 'company',
      title: 'Company',
      links: [
        { id: 'about', label: 'About Us', href: '/about' },
        { id: 'contact', label: 'Contact Us', href: '/contact' },
        { id: 'careers', label: 'Careers', href: '/careers' },
        { id: 'press', label: 'Press', href: '/press' },
      ],
    },
  ]

  const socialLinks = [
    { id: 'facebook', icon: '📘', href: 'https://facebook.com', label: 'Facebook' },
    { id: 'twitter', icon: '🐦', href: 'https://twitter.com', label: 'Twitter' },
    { id: 'instagram', icon: '📷', href: 'https://instagram.com', label: 'Instagram' },
    { id: 'linkedin', icon: '💼', href: 'https://linkedin.com', label: 'LinkedIn' },
  ]

  // Mock property search function
  const performSearch = (query: string) => {
    // Reset any previous errors
    setSearchError(null)
    setSearchQuery(query)
    setIsSearching(true)

    // Simulate API call with a delay
    setTimeout(() => {
      try {
        // Simulate a random error (10% chance) for demonstration purposes
        if (Math.random() < 0.1) {
          throw new Error('Unable to connect to search service. Please try again.')
        }

        // Mock data - in a real app, this would come from an API
        const mockResults: Property[] = [
          {
            id: '1',
            title: 'Modern Apartment in City Center',
            price: '£350,000',
            location: 'Cambridge, UK',
            bedrooms: 2,
            bathrooms: 1,
            area: '850 sq ft',
            description:
              'A beautiful modern apartment in the heart of Cambridge with easy access to shops, restaurants, and public transport.',
            imageUrl: 'https://placehold.co/600x400/png?text=Apartment',
          },
          {
            id: '2',
            title: 'Spacious Family Home with Garden',
            price: '£550,000',
            location: 'Cambridge, UK',
            bedrooms: 4,
            bathrooms: 2,
            area: '1,800 sq ft',
            description:
              'Perfect family home with a large garden in a quiet neighborhood. Close to excellent schools and parks.',
            imageUrl: 'https://placehold.co/600x400/png?text=Family+Home',
          },
          {
            id: '3',
            title: 'Luxury Penthouse with River View',
            price: '£750,000',
            location: 'Cambridge, UK',
            bedrooms: 3,
            bathrooms: 2,
            area: '1,200 sq ft',
            description:
              'Stunning penthouse apartment with panoramic views of the river. Features high-end finishes and a private terrace.',
            imageUrl: 'https://placehold.co/600x400/png?text=Penthouse',
          },
        ]

        // Filter results based on query for demonstration
        const filteredResults =
          query.length > 0
            ? mockResults.filter(
                property =>
                  property.title.toLowerCase().includes(query.toLowerCase()) ||
                  property.location.toLowerCase().includes(query.toLowerCase()) ||
                  property.description.toLowerCase().includes(query.toLowerCase())
              )
            : mockResults

        setSearchResults(filteredResults)
      } catch (error) {
        console.error('Search error:', error)
        setSearchError(error instanceof Error ? error.message : 'An unexpected error occurred')
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 1500)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearchError(null)
  }

  const handleViewDetails = (propertyId: string) => {
    logger.info('View details for property:', { propertyId })
    alert(`Viewing details for property ID: ${propertyId}`)
    // In a real app, you would navigate to a property details page
  }

  // Event handlers
  const handleLogin = () => {
    logger.info('Login clicked')
    alert('Login functionality disabled for testing')
  }

  const handleSignup = () => {
    logger.info('Signup clicked')
    alert('Signup functionality disabled for testing')
  }

  const handlePrimaryCTA = () => {
    logger.info('Primary CTA clicked')
    alert('Start your property journey!')
  }

  const handleSecondaryCTA = () => {
    logger.info('Secondary CTA clicked')
    alert('Contact an agent!')
  }

  return (
    <main>
      <Header navLinks={navLinks} onLogin={handleLogin} onSignup={handleSignup} />

      <Hero
        title="Find Your Dream Property"
        subtitle="Discover thousands of properties for sale and rent across the country"
        buttonText="Explore Properties"
        useInlineSearch={true}
        onInlineSearch={performSearch}
      />

      {/* Search Results Section - Only visible when there's a search query */}
      {searchQuery && (
        <SearchResults
          query={searchQuery}
          results={searchResults}
          isLoading={isSearching}
          error={searchError || undefined}
          onViewDetails={handleViewDetails}
          onClearSearch={clearSearch}
        />
      )}

      <Features
        title="Everything You Need in One Place"
        subtitle="Our platform offers comprehensive tools and resources for buyers, sellers, and renters"
        features={features}
        className="features-section"
      />

      <CallToAction
        title="Ready to Start Your Property Journey?"
        description="Whether you're buying, selling, or renting, we're here to help every step of the way."
        primaryButtonText="Get Started"
        secondaryButtonText="Contact an Agent"
        onPrimaryClick={handlePrimaryCTA}
        onSecondaryClick={handleSecondaryCTA}
      />

      <Footer
        columns={footerColumns}
        copyrightText="© 2023 Property Portal. All rights reserved."
        socialLinks={socialLinks}
      />
    </main>
  )
}
