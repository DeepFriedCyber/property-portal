import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from './Hero';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the useDebounce hook
jest.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: any) => value, // Return the value immediately for testing
}));

describe('Hero Component', () => {
  it('renders with default props', () => {
    render(<Hero />);
    
    // Check if the default title and subtitle are rendered
    expect(screen.getByText('Find Your Perfect UK Home')).toBeInTheDocument();
    expect(
      screen.getByText('Search smarter with AI-powered property matching and location insights')
    ).toBeInTheDocument();
    
    // Check if the search input is rendered
    expect(screen.getByLabelText('Search for properties')).toBeInTheDocument();
    
    // Check if the search button is rendered with default text
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    const customProps = {
      title: 'Custom Title',
      subtitle: 'Custom Subtitle',
      buttonText: 'Custom Button',
    };
    
    render(<Hero {...customProps} />);
    
    // Check if the custom title and subtitle are rendered
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
    
    // Check if the search button has the custom text
    expect(screen.getByRole('button', { name: /custom button/i })).toBeInTheDocument();
  });

  it('handles search input and button click', async () => {
    const mockOnInlineSearch = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Hero 
        useInlineSearch={true} 
        onInlineSearch={mockOnInlineSearch} 
      />
    );
    
    // Get the search input and button
    const searchInput = screen.getByLabelText('Search for properties');
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    // Type in the search input
    await user.type(searchInput, 'test search');
    
    // Click the search button
    await user.click(searchButton);
    
    // Check if the onInlineSearch function was called with the correct value
    expect(mockOnInlineSearch).toHaveBeenCalledWith('test search');
  });

  it('handles Enter key press in search input', async () => {
    const mockOnInlineSearch = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Hero 
        useInlineSearch={true} 
        onInlineSearch={mockOnInlineSearch} 
      />
    );
    
    // Get the search input
    const searchInput = screen.getByLabelText('Search for properties');
    
    // Type in the search input and press Enter
    await user.type(searchInput, 'test search{enter}');
    
    // Check if the onInlineSearch function was called with the correct value
    expect(mockOnInlineSearch).toHaveBeenCalledWith('test search');
  });

  it('disables the search button when input is empty', async () => {
    const user = userEvent.setup();
    render(<Hero />);
    
    // Get the search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    // Initially, the button should be disabled
    expect(searchButton).toBeDisabled();
    
    // Type in the search input
    const searchInput = screen.getByLabelText('Search for properties');
    await user.type(searchInput, 'test');
    
    // Now the button should be enabled
    expect(searchButton).not.toBeDisabled();
    
    // Clear the input
    await user.clear(searchInput);
    
    // The button should be disabled again
    expect(searchButton).toBeDisabled();
  });

  it('shows loading state when searching', async () => {
    const mockOnInlineSearch = jest.fn(() => {
      // Simulate a delay in the search
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    
    const user = userEvent.setup();
    
    render(
      <Hero 
        useInlineSearch={true} 
        onInlineSearch={mockOnInlineSearch} 
      />
    );
    
    // Get the search input and button
    const searchInput = screen.getByLabelText('Search for properties');
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    // Type in the search input
    await user.type(searchInput, 'test search');
    
    // Click the search button
    await user.click(searchButton);
    
    // Check if the loading state is shown
    expect(screen.getByText('Searching...')).toBeInTheDocument();
    
    // Wait for the search to complete
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });
  });
});