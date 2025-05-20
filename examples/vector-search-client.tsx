// examples/vector-search-client.tsx
import React, { useState } from 'react';
import axios from 'axios';

// Define types
interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: string;
  status: string;
  similarity?: number;
}

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
}

interface SearchOptions {
  limit?: number;
  offset?: number;
  similarityThreshold?: number;
}

// Example component for semantic search
const SemanticSearchExample: React.FC = () => {
  // State
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [options, setOptions] = useState<SearchOptions>({ limit: 10 });
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/search/semantic', {
        query,
        filters,
        options
      });

      setResults(response.data.data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Convert numeric values
    const parsedValue = type === 'number' && value ? parseFloat(value) : value;
    
    setFilters(prev => ({
      ...prev,
      [name]: parsedValue === '' ? undefined : parsedValue
    }));
  };

  return (
    <div className="semantic-search">
      <h2>Semantic Property Search</h2>
      
      {/* Search query input */}
      <div className="search-input">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your ideal property..."
          className="query-input"
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="search-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {/* Filters */}
      <div className="filters">
        <h3>Filters</h3>
        <div className="filter-grid">
          <div className="filter-item">
            <label htmlFor="minPrice">Min Price</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice || ''}
              onChange={handleFilterChange}
              placeholder="Min Price"
            />
          </div>
          
          <div className="filter-item">
            <label htmlFor="maxPrice">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice || ''}
              onChange={handleFilterChange}
              placeholder="Max Price"
            />
          </div>
          
          <div className="filter-item">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={filters.location || ''}
              onChange={handleFilterChange}
              placeholder="Location"
            />
          </div>
          
          <div className="filter-item">
            <label htmlFor="bedrooms">Bedrooms</label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={filters.bedrooms || ''}
              onChange={handleFilterChange}
              placeholder="Min Bedrooms"
            />
          </div>
          
          <div className="filter-item">
            <label htmlFor="bathrooms">Bathrooms</label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={filters.bathrooms || ''}
              onChange={handleFilterChange}
              placeholder="Min Bathrooms"
            />
          </div>
          
          <div className="filter-item">
            <label htmlFor="propertyType">Property Type</label>
            <select
              id="propertyType"
              name="propertyType"
              value={filters.propertyType || ''}
              onChange={handleFilterChange}
            >
              <option value="">Any Type</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="land">Land</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Results */}
      <div className="search-results">
        <h3>Results ({results.length})</h3>
        
        {results.length === 0 && !loading && !error ? (
          <p className="no-results">No properties found. Try a different search.</p>
        ) : (
          <div className="results-grid">
            {results.map(property => (
              <div key={property.id} className="property-card">
                <h4>{property.title}</h4>
                <p className="property-location">{property.location}</p>
                <p className="property-price">${property.price.toLocaleString()}</p>
                <p className="property-details">
                  {property.bedrooms} beds • {property.bathrooms} baths • {property.squareFeet} sq ft
                </p>
                {property.similarity !== undefined && (
                  <div className="similarity-score">
                    {Math.round(property.similarity * 100)}% match
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .semantic-search {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .search-input {
          display: flex;
          margin-bottom: 20px;
        }
        
        .query-input {
          flex: 1;
          padding: 12px;
          font-size: 16px;
          border: 1px solid #ddd;
          border-radius: 4px 0 0 4px;
        }
        
        .search-button {
          padding: 12px 24px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
        }
        
        .search-button:disabled {
          background-color: #ccc;
        }
        
        .filters {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .filter-item {
          display: flex;
          flex-direction: column;
        }
        
        .filter-item label {
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .filter-item input,
        .filter-item select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .error-message {
          padding: 10px;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .property-card {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 15px;
          position: relative;
        }
        
        .property-card h4 {
          margin-top: 0;
          margin-bottom: 10px;
        }
        
        .property-location {
          color: #666;
          margin-bottom: 10px;
        }
        
        .property-price {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 10px;
        }
        
        .property-details {
          color: #666;
          margin-bottom: 0;
        }
        
        .similarity-score {
          position: absolute;
          top: 15px;
          right: 15px;
          background-color: #0070f3;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .no-results {
          text-align: center;
          padding: 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

// Example component for similar properties
const SimilarPropertiesExample: React.FC<{ propertyId: string }> = ({ propertyId }) => {
  // State
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch similar properties
  const fetchSimilarProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/search/similar/${propertyId}?limit=4`);
      setSimilarProperties(response.data.data.similarProperties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  React.useEffect(() => {
    if (propertyId) {
      fetchSimilarProperties();
    }
  }, [propertyId]);

  if (loading) {
    return <div className="loading">Loading similar properties...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="similar-properties">
      <h3>Similar Properties</h3>
      
      {similarProperties.length === 0 ? (
        <p>No similar properties found.</p>
      ) : (
        <div className="similar-grid">
          {similarProperties.map(property => (
            <div key={property.id} className="similar-card">
              <h4>{property.title}</h4>
              <p className="property-location">{property.location}</p>
              <p className="property-price">${property.price.toLocaleString()}</p>
              <p className="property-details">
                {property.bedrooms} beds • {property.bathrooms} baths
              </p>
              {property.similarity !== undefined && (
                <div className="similarity-badge">
                  {Math.round(property.similarity * 100)}% similar
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .similar-properties {
          margin-top: 30px;
        }
        
        .similar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .similar-card {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 15px;
          position: relative;
        }
        
        .similar-card h4 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .similarity-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: #4caf50;
          color: white;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 11px;
        }
        
        .loading, .error {
          padding: 20px;
          text-align: center;
        }
        
        .error {
          color: #c62828;
        }
      `}</style>
    </div>
  );
};

export { SemanticSearchExample, SimilarPropertiesExample };