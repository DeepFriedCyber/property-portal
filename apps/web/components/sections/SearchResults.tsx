import React from 'react';
import { Button } from '../../src/ui';

export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  description: string;
  imageUrl: string;
}

interface SearchResultsProps {
  query: string;
  results: Property[];
  isLoading: boolean;
  error?: string;
  onViewDetails?: (propertyId: string) => void;
  onClearSearch?: () => void;
}

// Skeleton loader for property cards
const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-300"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-5 bg-gray-300 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-2/4 mb-2"></div>
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-gray-300 rounded w-1/6"></div>
        <div className="h-4 bg-gray-300 rounded w-1/6"></div>
        <div className="h-4 bg-gray-300 rounded w-1/6"></div>
      </div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
      <div className="h-10 bg-gray-300 rounded w-full"></div>
    </div>
  </div>
);

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isLoading,
  error,
  onViewDetails,
  onClearSearch
}) => {
  if (!query) return null;

  return (
    <section 
      className="py-12 px-6 bg-gray-50" 
      id="search-results"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold" id="search-results-heading">
            {isLoading 
              ? `Searching for "${query}"...`
              : results.length > 0 
                ? `Found ${results.length} properties matching "${query}"`
                : `No properties found for "${query}"`}
          </h2>
          {onClearSearch && (
            <Button 
              variant="secondary" 
              onClick={onClearSearch}
              className="text-sm"
              aria-label="Clear search results"
            >
              Clear Search
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div aria-label="Loading search results">
            <div className="flex justify-center items-center mb-8">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-white bg-indigo-600">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching for properties...
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-labelledby="search-results-heading"
          >
            {results.map((property) => (
              <article 
                key={property.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
                aria-labelledby={`property-title-${property.id}`}
              >
                <div className="h-48 bg-gray-200">
                  <img 
                    src={property.imageUrl} 
                    alt={`Property: ${property.title}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 
                    id={`property-title-${property.id}`}
                    className="text-xl font-semibold mb-2"
                  >
                    {property.title}
                  </h3>
                  <p className="text-blue-600 font-bold mb-2">{property.price}</p>
                  <p className="text-gray-600 mb-2">{property.location}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span aria-label={`${property.bedrooms} bedrooms`}>{property.bedrooms} beds</span>
                    <span aria-label={`${property.bathrooms} bathrooms`}>{property.bathrooms} baths</span>
                    <span aria-label={`Area: ${property.area}`}>{property.area}</span>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-2">{property.description}</p>
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => onViewDetails && onViewDetails(property.id)}
                    aria-label={`View details for ${property.title}`}
                  >
                    View Details
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div 
            className="text-center py-12 bg-white rounded-lg shadow-sm"
            role="status"
            aria-live="polite"
          >
            <h3 className="text-xl font-semibold mb-2">No properties match your search</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your search criteria or explore our featured properties below.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchResults;