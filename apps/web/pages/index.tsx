import { useState } from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import CallToAction from '../components/sections/CallToAction';
import Footer from '../components/layout/Footer';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    console.log('Searching for:', term);
    // Here you would typically navigate to search results or filter properties
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
        ctaText="Explore Properties"
        onSearch={handleSearch}
      />
      
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