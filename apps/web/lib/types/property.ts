/**
 * Property-related type definitions
 */

/**
 * Property interface representing a real estate property
 */
export interface Property {
  id: string;
  uploadId: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  description?: string;
  features?: string[];
  status?: 'available' | 'pending' | 'sold' | 'deleted';
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  images?: PropertyImage[];
  metadata?: Record<string, any>;
}

/**
 * Property image interface
 */
export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  caption?: string;
  isPrimary?: boolean;
  order?: number;
  createdAt: string;
}

/**
 * Input for creating a new property
 */
export type CreatePropertyInput = Omit<Property, 'id' | 'createdAt' | 'images'> & {
  images?: Omit<PropertyImage, 'id' | 'propertyId' | 'createdAt'>[];
};

/**
 * Input for updating an existing property
 */
export type UpdatePropertyInput = Partial<Omit<Property, 'id' | 'createdAt' | 'createdBy' | 'images'>> & {
  images?: Omit<PropertyImage, 'id' | 'propertyId' | 'createdAt'>[];
};

/**
 * Property search filters
 */
export interface PropertySearchFilters {
  city?: string;
  state?: string;
  zipCode?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minSquareFeet?: number;
  status?: Property['status'];
  createdAfter?: string;
  createdBefore?: string;
}

/**
 * Property search result
 */
export interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}