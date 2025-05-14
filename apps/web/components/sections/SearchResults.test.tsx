import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchResults, { Property } from './SearchResults';

describe('SearchResults Component', () => {
  // Mock data for testing
  const mockProperties = [
    {
      id: '1',
      title: 'Modern Apartment',
      price: '£350,000',
      location: 'Cambridge, UK',
      bedrooms: 2,
      bathrooms: 1,
      area: '850 sq ft',
      description: 'A beautiful modern apartment in the heart of Cambridge.',
      imageUrl: '/mock-image-1.jpg',
    },
    {
      id: '2',
      title: 'Family Home',
      price: '£550,000',
      location: 'London, UK',
      bedrooms: 4,
      bathrooms: 2,
      area: '1,800 sq ft',
      description: 'Perfect family home with a large garden in a quiet neighborhood.',
      imageUrl: '/mock-image-2.jpg',
    },
  ];

  it('renders nothing when query is empty', () => {
    const { container } = render(
      <SearchResults 
        query="" 
        results={[]} 
        isLoading={false} 
      />
    );
    
    // The component should not render anything
    expect(container.firstChild).toBeNull();
  });

  it('renders loading state correctly', () => {
    render(
      <SearchResults 
        query="test" 
        results={[]} 
        isLoading={true} 
      />
    );
    
    // Check if the loading indicator is shown
    expect(screen.getByText('Searching for properties...')).toBeInTheDocument();
    
    // Check if the loading text is shown in the heading
    expect(screen.getByText('Searching for "test"...')).toBeInTheDocument();
  });

  it('renders results correctly', () => {
    render(
      <SearchResults 
        query="test" 
        results={mockProperties} 
        isLoading={false} 
      />
    );
    
    // Check if the results heading is shown
    expect(screen.getByText('Found 2 properties matching "test"')).toBeInTheDocument();
    
    // Check if all property titles are shown
    expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
    expect(screen.getByText('Family Home')).toBeInTheDocument();
    
    // Check if property details are shown
    expect(screen.getByText('£350,000')).toBeInTheDocument();
    expect(screen.getByText('Cambridge, UK')).toBeInTheDocument();
    expect(screen.getByText('2 beds')).toBeInTheDocument();
    
    // Check if all "View Details" buttons are shown
    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
    expect(viewDetailsButtons).toHaveLength(2);
  });

  it('renders no results message correctly', () => {
    render(
      <SearchResults 
        query="nonexistent" 
        results={[]} 
        isLoading={false} 
      />
    );
    
    // Check if the no results heading is shown
    expect(screen.getByText('No properties found for "nonexistent"')).toBeInTheDocument();
    
    // Check if the no results message is shown
    expect(screen.getByText('No properties match your search')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search criteria or explore our featured properties below.')
    ).toBeInTheDocument();
  });

  it('renders error message correctly', () => {
    render(
      <SearchResults 
        query="test" 
        results={[]} 
        isLoading={false} 
        error="An error occurred while searching" 
      />
    );
    
    // Check if the error message is shown
    expect(screen.getByText('An error occurred while searching')).toBeInTheDocument();
  });

  it('calls onViewDetails when View Details button is clicked', async () => {
    const mockOnViewDetails = jest.fn();
    const user = userEvent.setup();
    
    render(
      <SearchResults 
        query="test" 
        results={mockProperties} 
        isLoading={false} 
        onViewDetails={mockOnViewDetails} 
      />
    );
    
    // Get the first View Details button
    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
    
    // Click the first View Details button
    await user.click(viewDetailsButtons[0]);
    
    // Check if onViewDetails was called with the correct property ID
    expect(mockOnViewDetails).toHaveBeenCalledWith('1');
  });

  it('calls onClearSearch when Clear Search button is clicked', async () => {
    const mockOnClearSearch = jest.fn();
    const user = userEvent.setup();
    
    render(
      <SearchResults 
        query="test" 
        results={mockProperties} 
        isLoading={false} 
        onClearSearch={mockOnClearSearch} 
      />
    );
    
    // Get the Clear Search button
    const clearSearchButton = screen.getByRole('button', { name: /clear search/i });
    
    // Click the Clear Search button
    await user.click(clearSearchButton);
    
    // Check if onClearSearch was called
    expect(mockOnClearSearch).toHaveBeenCalled();
  });
});