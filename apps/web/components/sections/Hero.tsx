import { Button } from 'ui';
import React, { useState } from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onSearch: (searchTerm: string) => void;
}

export default function Hero({ title, subtitle, ctaText, onSearch }: HeroProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-20 px-6 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">
        {title}
      </h1>
      <p className="text-lg max-w-xl mx-auto mb-8">
        {subtitle}
      </p>
      <div className="bg-white text-black p-4 rounded-lg max-w-3xl mx-auto shadow-md flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded border w-full"
          placeholder="e.g. 'Modern flat near Cambridge with a garden'"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="primary" onClick={handleSearch}>{ctaText}</Button>
      </div>
    </section>
  );
}