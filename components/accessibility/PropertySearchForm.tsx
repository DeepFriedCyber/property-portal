// PropertySearchForm.tsx
import React, { useState } from 'react'

import AccessibleForm from './AccessibleForm'

interface PropertySearchFormProps {
  onSearch: (searchParams: Record<string, string>) => void
  loading?: boolean
  className?: string
}

const PropertySearchForm: React.FC<PropertySearchFormProps> = ({
  onSearch,
  loading = false,
  className = '',
}) => {
  // Define form fields with validation
  const searchFields = [
    {
      id: 'location',
      label: 'Location',
      type: 'text',
      required: true,
      placeholder: 'City, neighborhood, or ZIP code',
      helpText: 'Enter a city, neighborhood, or ZIP code to search for properties',
      validation: (value: string) => {
        if (value.length < 2) {
          return 'Location must be at least 2 characters'
        }
        return undefined
      },
      autoComplete: 'address-level2',
    },
    {
      id: 'minPrice',
      label: 'Minimum Price',
      type: 'number',
      placeholder: 'Min price',
      helpText: 'Enter the minimum price for properties',
      validation: (value: string) => {
        if (value && parseInt(value) < 0) {
          return 'Price cannot be negative'
        }
        return undefined
      },
      min: 0,
    },
    {
      id: 'maxPrice',
      label: 'Maximum Price',
      type: 'number',
      placeholder: 'Max price',
      helpText: 'Enter the maximum price for properties',
      validation: (value: string) => {
        if (value && parseInt(value) < 0) {
          return 'Price cannot be negative'
        }
        return undefined
      },
      min: 0,
    },
    {
      id: 'bedrooms',
      label: 'Minimum Bedrooms',
      type: 'number',
      placeholder: 'Min bedrooms',
      helpText: 'Select the minimum number of bedrooms',
      min: 0,
      max: 10,
    },
    {
      id: 'bathrooms',
      label: 'Minimum Bathrooms',
      type: 'number',
      placeholder: 'Min bathrooms',
      helpText: 'Select the minimum number of bathrooms',
      min: 0,
      max: 10,
    },
    {
      id: 'propertyType',
      label: 'Property Type',
      type: 'text',
      placeholder: 'Any property type',
      helpText: 'Enter the type of property you are looking for (e.g., house, apartment, condo)',
    },
  ]

  // Handle form submission
  const handleSubmit = (formData: Record<string, string>) => {
    // Filter out empty values
    const filteredData = Object.entries(formData).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, string>
    )

    onSearch(filteredData)
  }

  return (
    <div className={`property-search-form ${className}`}>
      <AccessibleForm
        fields={searchFields}
        onSubmit={handleSubmit}
        submitLabel="Search Properties"
        title="Find Your Dream Property"
        description="Use the form below to search for properties that match your criteria."
        loading={loading}
      />
    </div>
  )
}

export default PropertySearchForm
