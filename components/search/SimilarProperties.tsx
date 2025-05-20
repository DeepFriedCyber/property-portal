import React, { useState, useEffect } from 'react';
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

interface SimilarPropertiesProps {
  propertyId: string;
  limit?: number;
}

// Similar Properties Component
const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ propertyId, limit = 4 }) => {
  // State
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch similar properties
  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (!propertyId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/search/similar/${propertyId}?limit=${limit}`);
        setSimilarProperties(response.data.data.similarProperties);
      } catch (err: any) {
        setError(err.message || 'Failed to load similar properties');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProperties();
  }, [propertyId, limit]);

  // If loading
  if (loading) {
    return <div className="loading">Loading similar properties...</div>;
  }

  // If error
  if (error) {
    return <div className="error">{error}</div>;
  }

  // If no similar properties
  if (similarProperties.length === 0) {
    return null;
  }

  return (
    <div className="similar-properties" data-testid="similar-properties">
      <h3>Similar Properties</h3>
      
      <div className="similar-grid">
        {similarProperties.map(property => (
          <div key={property.id} className="similar-card" data-testid="similar-property-card">
            <h4>{property.title}</h4>
            <p className="property-location">{property.location}</p>
            <p className="property-price">£{property.price.toLocaleString()}</p>
            <p className="property-details">
              {property.bedrooms} beds • {property.bathrooms} baths
            </p>
            {property.similarity !== undefined && (
              <div className="similarity-badge" data-testid="similarity-score">
                {Math.round(property.similarity * 100)}% similar
              </div>
            )}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .similar-properties {
          margin-top: 30px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        
        .similar-properties h3 {
          margin-top: 0;
          margin-bottom: 20px;
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
          background-color: white;
        }
        
        .similar-card h4 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 16px;
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

export default SimilarProperties;