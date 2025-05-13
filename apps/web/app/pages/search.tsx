'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Button } from '../../src/ui';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  imageUrl: string;
  description: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('query') || '';
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Debounce API calls by 300ms
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    debounceTimeout.current = setTimeout(() => {
      const runSearch = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const res = await fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query }),
          });
          
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }
          
          const data = await res.json();
          setResults(data?.properties || []);
        } catch (err: any) {
          console.error('Search failed:', err);
          setError('Failed to load search results. Please try again.');
          setResults([]);
        } finally {
          setLoading(false);
        }
      };
      
      runSearch();
    }, 300);

    // Cleanup on unmount or query change
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        Search results for:{' '}
        <span className="text-purple-600">{query || '...'}</span>
      </h1>
      
      {!query && (
        <p className="text-gray-600">
          Please enter a search term to find properties.
        </p>
      )}
      
      {loading && (
        <div className="flex justify-center my-6">
          <svg
            className="animate-spin h-8 w-8 text-purple-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      )}
      
      {error && (
        <p className="text-red-600 font-semibold my-4" role="alert">
          {error}
        </p>
      )}
      
      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map((p) => (
            <div key={p.id} className="border rounded shadow-sm p-4">
              <img
                src={p.imageUrl}
                alt={p.title}
                className="rounded w-full h-40 object-cover"
              />
              <h2 className="text-xl font-bold mt-2">{p.title}</h2>
              <p className="text-sm text-gray-500">{p.location}</p>
              <p className="text-lg font-semibold text-blue-600">
                £{p.price.toLocaleString()}
              </p>
              <p className="mt-2 text-sm">{p.description}</p>
            </div>
          ))}
        </div>
      )}
      
      {!loading && !error && query && results.length === 0 && (
        <p>No matching properties found.</p>
      )}
    </div>
  );
}