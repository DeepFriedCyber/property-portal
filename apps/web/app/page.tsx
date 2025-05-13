'use client';

import React from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import CallToAction from '../components/sections/CallToAction';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function HomePage() {
  // Mock data for the components
  const navLinks = [
    { id: 'buy', label: 'Buy', href: '/buy' },
    { id: 'rent', label: 'Rent', href: '/rent' },
    { id: 'sell', label: 'Sell', href: '/sell' },
    { id: 'agents', label: 'Find Agents', href: '/agents' },
    { id: 'resources', label: 'Resources', href: '/resources' },
  ];

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
      description: 'Get notified instantly when new properties matching your criteria become available.',
      icon: '🔔',
    },
    {
      id: 'mortgage',
      title: 'Mortgage Calculator',
      description: 'Plan your finances with our easy-to-use mortgage calculator and affordability tools.',
      icon: '💰',
    },
    {
      id: 'agents',
      title: 'Expert Agents',
      description: 'Connect with experienced real estate agents who can guide you through the process.',
      icon: '👤',
    },
    {
      id: 'market-insights',
      title: 'Market Insights',
      description: 'Access up-to-date market data and trends to make informed property decisions.',
      icon: '📊',
    },
  ];

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
  ];

  const socialLinks = [
    { id: 'facebook', icon: '📘', href: 'https://facebook.com', label: 'Facebook' },
    { id: 'twitter', icon: '🐦', href: 'https://twitter.com', label: 'Twitter' },
    { id: 'instagram', icon: '📷', href: 'https://instagram.com', label: 'Instagram' },
    { id: 'linkedin', icon: '💼', href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  // Event handlers
  const handleSearch = (searchTerm: string) => {
    console.log('Searching for:', searchTerm);
    alert(`Searching for: ${searchTerm}`);
  };

  const handleLogin = () => {
    console.log('Login clicked');
    alert('Login clicked');
  };

  const handleSignup = () => {
    console.log('Signup clicked');
    alert('Signup clicked');
  };

  const handlePrimaryCTA = () => {
    console.log('Primary CTA clicked');
    alert('Start your property journey!');
  };

  const handleSecondaryCTA = () => {
    console.log('Secondary CTA clicked');
    alert('Contact an agent!');
  };

  return (
    <main>
      <Header 
        navLinks={navLinks} 
        onLogin={handleLogin} 
        onSignup={handleSignup} 
      />
      
      <Hero 
        title="Find Your Dream Property"
        subtitle="Discover thousands of properties for sale and rent across the country"
        ctaText="Explore Properties"
        onSearch={handleSearch}
      />
      
      <Features 
        title="Everything You Need in One Place"
        subtitle="Our platform offers comprehensive tools and resources for buyers, sellers, and renters"
        features={features}
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
  );
}