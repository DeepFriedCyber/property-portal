import React from 'react';
import { Button } from 'ui';

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
  onViewDetails?: (propertyId: string) => void;
  onClearSearch?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isLoading,
  onViewDetails,
  onClearSearch
}) => {
  if (!query) return null;

  return (
    <section className="py-12 px-6 bg-gray-50" id="search-results">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {results.length > 0 
              ? `Found ${results.length} properties matching "${query}"`
              : `No properties found for "${query}"`}
          </h2>
          {onClearSearch && (
            <Button 
              variant="secondary" 
              onClick={onClearSearch}
              className="text-sm"
            >
              Clear Search
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                <div className="h-48 bg-gray-200">
                  <img 
                    src={property.imageUrl} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                  <p className="text-blue-600 font-bold mb-2">{property.price}</p>
                  <p className="text-gray-600 mb-2">{property.location}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>{property.bedrooms} beds</span>
                    <span>{property.bathrooms} baths</span>
                    <span>{property.area}</span>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-2">{property.description}</p>
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => onViewDetails && onViewDetails(property.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
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