import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../src/ui';

interface HeroProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  useInlineSearch?: boolean;
  onInlineSearch?: (query: string) => void;
}

export default function Hero({
  title = "Find Your Perfect UK Home",
  subtitle = "Search smarter with AI-powered property matching and location insights",
  buttonText = "Search",
  useInlineSearch = false,
  onInlineSearch
}: HeroProps) {
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (!input.trim()) return;
    
    if (useInlineSearch && onInlineSearch) {
      setIsSearching(true);
      onInlineSearch(input.trim());
      setTimeout(() => {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
          searchResults.scrollIntoView({ behavior: 'smooth' });
        }
        setIsSearching(false);
      }, 100);
    } else {
      const encoded = encodeURIComponent(input.trim());
      router.push(`/search?query=${encoded}`);
    }
  };

  return (
    <section className="bg-gradient-to-br from-purple-700 via-indigo-700 to-indigo-900 text-white py-24 px-6 text-center">
      <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6">
        {title}
      </h1>
      <p className="text-xl max-w-lg mx-auto mb-10 leading-relaxed">
        {subtitle}
      </p>
      <div className="bg-white text-black p-5 rounded-2xl max-w-4xl mx-auto shadow-lg flex flex-col sm:flex-row gap-5 items-center">
        <input
          type="text"
          className="flex-1 px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. 'Modern flat near Cambridge with a garden'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          aria-label="Search for properties"
        />
        <Button
          variant="primary"
          onClick={handleSearch}
          disabled={!input.trim() || isSearching}
          className="h-full px-8 py-3 font-semibold rounded-lg transition-transform hover:scale-105 disabled:opacity-50"
        >
          {isSearching ? "Searching..." : buttonText}
        </Button>
      </div>
    </section>
  );
}
