import { useState } from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import CallToAction from '../components/sections/CallToAction';
import Footer from '../components/layout/Footer';
import SearchResults, { Property } from '../components/sections/SearchResults';

export default function HomePage() {
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock property search function
  const performSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
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
          description: 'A beautiful modern apartment in the heart of Cambridge with easy access to shops, restaurants, and public transport.',
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
          description: 'Perfect family home with a large garden in a quiet neighborhood. Close to excellent schools and parks.',
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
          description: 'Stunning penthouse apartment with panoramic views of the river. Features high-end finishes and a private terrace.',
          imageUrl: 'https://placehold.co/600x400/png?text=Penthouse',
        },
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleViewDetails = (propertyId: string) => {
    console.log('View details for property:', propertyId);
    alert(`Viewing details for property ID: ${propertyId}`);
    // In a real app, you would navigate to a property details page
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
    // Handle sign up logic or navigation
  };

  const handleLogin = () => {
    console.log('Login clicked');
    // Handle login logic or navigation
  };

  // Navigation links for the header
  const navLinks = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'buy', label: 'Buy', href: '/buy' },
    { id: 'rent', label: 'Rent', href: '/rent' },
    { id: 'agents', label: 'Agents', href: '/agents' },
  ];

  // Features for the Features section
  const features = [
    {
      id: 'feature-1',
      title: 'Natural Language Search',
      description: 'Type plain English. Our AI understands and finds matching homes.',
      icon: '💬',
    },
    {
      id: 'feature-2',
      title: 'Location Intelligence',
      description: 'Discover nearby amenities like shops, schools, and transport links.',
      icon: '📍',
    },
    {
      id: 'feature-3',
      title: 'Smart Comparison',
      description: 'Compare homes intelligently and highlight what matters most.',
      icon: '📊',
    }
  ];
  
  // Footer data
  const footerColumns = [
    {
      id: 'company',
      title: 'Company',
      links: [
        { id: 'about', label: 'About Us', href: '/about' },
        { id: 'careers', label: 'Careers', href: '/careers' },
        { id: 'contact', label: 'Contact Us', href: '/contact' },
      ],
    },
    {
      id: 'resources',
      title: 'Resources',
      links: [
        { id: 'blog', label: 'Blog', href: '/blog' },
        { id: 'guides', label: 'Guides', href: '/guides' },
        { id: 'help', label: 'Help Center', href: '/help' },
      ],
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { id: 'terms', label: 'Terms of Service', href: '/terms' },
        { id: 'privacy', label: 'Privacy Policy', href: '/privacy' },
        { id: 'cookies', label: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ];

  const socialLinks = [
    { id: 'facebook', icon: '📘', href: 'https://facebook.com', label: 'Facebook' },
    { id: 'twitter', icon: '🐦', href: 'https://twitter.com', label: 'Twitter' },
    { id: 'instagram', icon: '📷', href: 'https://instagram.com', label: 'Instagram' },
    { id: 'linkedin', icon: '💼', href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <>
      <Header 
        logoText="PropNexus"
        navLinks={navLinks}
        onLogin={handleLogin}
        onSignup={handleSignUp}
      />
      
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
          onViewDetails={handleViewDetails}
          onClearSearch={clearSearch}
        />
      )}
      
      <Features 
        title="Why Choose PropNexus"
        subtitle="Our innovative features help you find the perfect property faster"
        features={features}
      />
      
      <CallToAction 
        title="Ready to find your dream home?"
        description="Join thousands of seekers who found their perfect match with PropNexus."
        primaryButtonText="Create an Account"
        secondaryButtonText="Login"
        onPrimaryClick={handleSignUp}
        onSecondaryClick={handleLogin}
      />
      
      <Footer 
        columns={footerColumns}
        copyrightText="© 2024 PropNexus. All rights reserved."
        socialLinks={socialLinks}
      />
    </>
  );
}