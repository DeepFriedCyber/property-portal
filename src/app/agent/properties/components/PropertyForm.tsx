'use client'

import React, { useState } from 'react'
import { z } from 'zod'

import {
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
  FormError,
  PostcodeLookup,
} from '../../../../../components/forms'
import { useFormValidation } from '../../../../../hooks/useFormValidation'

// Define the form schema using Zod
const propertyFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  location: z.string().min(1, 'Location is required'),
  postcode: z
    .string()
    .min(1, 'Postcode is required')
    .refine(val => /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(val), {
      message: 'Postcode must be in a valid UK format (e.g., SW1A 1AA)',
    }),
  // Geolocation coordinates
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  price: z
    .union([z.number().positive('Price must be greater than zero'), z.undefined()])
    .optional(),
  bedrooms: z
    .union([
      z.number().int('Bedrooms must be a whole number').nonnegative('Bedrooms cannot be negative'),
      z.undefined(),
    ])
    .optional(),
  bathrooms: z
    .union([z.number().nonnegative('Bathrooms cannot be negative'), z.undefined()])
    .optional(),
  squareFeet: z
    .union([z.number().positive('Square feet must be greater than zero'), z.undefined()])
    .optional(),
  propertyType: z.enum(['house', 'apartment', 'condo', 'townhouse', 'land', 'other'], {
    errorMap: () => ({ message: 'Please select a property type' }),
  }),
  listingType: z.enum(['sale', 'rent'], {
    errorMap: () => ({ message: 'Please select a listing type' }),
  }),

  // UK-specific fields
  councilTaxBand: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '']).optional(),
  tenure: z.enum(['Freehold', 'Leasehold', 'Share of Freehold', '']).optional(),
  epcRating: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', '']).optional(),

  // Image URL
  imageUrl: z.string().optional(),

  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
})

// Infer the form data type from the schema
type PropertyFormData = z.infer<typeof propertyFormSchema>

// Initial form values
const initialValues: PropertyFormData = {
  title: '',
  description: '',
  address: '',
  city: '',
  location: '',
  postcode: '',
  lat: undefined,
  lng: undefined,
  price: undefined,
  bedrooms: undefined,
  bathrooms: undefined,
  squareFeet: undefined,
  propertyType: 'house',
  listingType: 'sale',
  councilTaxBand: '',
  tenure: '',
  epcRating: '',
  imageUrl: '',
  agreeToTerms: false,
}

// Property type options
const propertyTypeOptions = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'other', label: 'Other' },
]

// Listing type options
const listingTypeOptions = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
]

// UK Council Tax Band options
const councilTaxBandOptions = [
  { value: '', label: 'Select Council Tax Band' },
  { value: 'A', label: 'Band A' },
  { value: 'B', label: 'Band B' },
  { value: 'C', label: 'Band C' },
  { value: 'D', label: 'Band D' },
  { value: 'E', label: 'Band E' },
  { value: 'F', label: 'Band F' },
  { value: 'G', label: 'Band G' },
  { value: 'H', label: 'Band H' },
]

// UK Tenure options
const tenureOptions = [
  { value: '', label: 'Select Tenure' },
  { value: 'Freehold', label: 'Freehold' },
  { value: 'Leasehold', label: 'Leasehold' },
  { value: 'Share of Freehold', label: 'Share of Freehold' },
]

// UK EPC Rating options
const epcRatingOptions = [
  { value: '', label: 'Select EPC Rating' },
  { value: 'A', label: 'A (Most efficient)' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'G', label: 'G (Least efficient)' },
]

interface PropertyFormProps {
  onSubmit?: (data: PropertyFormData) => Promise<void>
  initialData?: Partial<PropertyFormData>
}

/**
 * Property form with validation for agent to add or edit properties
 */
export function PropertyForm({ onSubmit, initialData }: PropertyFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Merge initial data with default values
  const mergedInitialValues = {
    ...initialValues,
    ...initialData,
  }

  // Custom handler for numeric fields
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const parsedValue = value === '' ? undefined : Number(value)
    setFieldValue(name as keyof PropertyFormData, parsedValue)
  }

  // Use our form validation hook
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormValidation({
    initialValues: mergedInitialValues,
    schema: propertyFormSchema,
    onSubmit: async (data: PropertyFormData) => {
      setServerError(null)
      setSubmitSuccess(false)

      try {
        if (onSubmit) {
          await onSubmit(data)
        } else {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          // Form data submitted successfully
        }

        setSubmitSuccess(true)
        resetForm()
      } catch (error) {
        console.error('Form submission error:', error)
        setServerError(
          error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
        )
      }
    },
  })

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Form-level errors */}
      <FormError error={errors._form || serverError} />

      {/* Success message */}
      {submitSuccess && (
        <div
          className="p-3 mb-4 bg-green-50 border border-green-200 text-green-700 rounded-md"
          role="alert"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Property submitted successfully!</p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Property Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 gap-4">
          <TextField
            id="title"
            name="title"
            label="Property Title"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.title}
            touched={touched.title}
            required
            placeholder="Spacious 3-bedroom house in London"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              id="propertyType"
              name="propertyType"
              label="Property Type"
              value={values.propertyType}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.propertyType}
              touched={touched.propertyType}
              required
              options={propertyTypeOptions}
            />

            <SelectField
              id="listingType"
              name="listingType"
              label="Listing Type"
              value={values.listingType}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.listingType}
              touched={touched.listingType}
              required
              options={listingTypeOptions}
            />
          </div>

          <TextAreaField
            id="description"
            name="description"
            label="Description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.description}
            touched={touched.description}
            required
            rows={4}
            placeholder="Describe the property..."
            helpText="Provide a detailed description of the property to attract potential buyers or renters."
          />
        </div>
      </div>

      {/* Property Location */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Property Location</h2>

        <div className="grid grid-cols-1 gap-4">
          <TextField
            id="address"
            name="address"
            label="Street Address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.address}
            touched={touched.address}
            required
            placeholder="123 Main St"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              id="city"
              name="city"
              label="City"
              value={values.city}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.city}
              touched={touched.city}
              required
              placeholder="London"
            />

            <TextField
              id="location"
              name="location"
              label="Location/Area"
              value={values.location}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.location}
              touched={touched.location}
              required
              placeholder="Westminster"
            />
          </div>

          <PostcodeLookup
            postcode={values.postcode || ''}
            onPostcodeChange={handleChange}
            onCoordinatesFound={(lat, lng) => {
              setFieldValue('lat', lat)
              setFieldValue('lng', lng)
              setServerError(null)
            }}
            error={errors.postcode}
            touched={touched.postcode}
          />

          {/* Display coordinates if available */}
          {values.lat !== undefined &&
            values.lat !== null &&
            values.lng !== undefined &&
            values.lng !== null && (
              <div className="text-sm text-gray-600 mt-1">
                <p>
                  Coordinates: {values.lat.toFixed(6)}, {values.lng.toFixed(6)}
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Property Details</h2>

        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextField
              id="price"
              name="price"
              label="Price"
              type="number"
              value={values.price === undefined ? '' : values.price}
              onChange={handleNumericChange}
              onBlur={handleBlur}
              error={errors.price}
              touched={touched.price}
              required
              placeholder="300000"
              min={0}
              step={1000}
            />

            <TextField
              id="bedrooms"
              name="bedrooms"
              label="Bedrooms"
              type="number"
              value={values.bedrooms === undefined ? '' : values.bedrooms}
              onChange={handleNumericChange}
              onBlur={handleBlur}
              error={errors.bedrooms}
              touched={touched.bedrooms}
              required
              placeholder="3"
              min={0}
              step={1}
            />

            <TextField
              id="bathrooms"
              name="bathrooms"
              label="Bathrooms"
              type="number"
              value={values.bathrooms === undefined ? '' : values.bathrooms}
              onChange={handleNumericChange}
              onBlur={handleBlur}
              error={errors.bathrooms}
              touched={touched.bathrooms}
              required
              placeholder="2"
              min={0}
              step={0.5}
            />

            <TextField
              id="squareFeet"
              name="squareFeet"
              label="Square Feet"
              type="number"
              value={values.squareFeet === undefined ? '' : values.squareFeet}
              onChange={handleNumericChange}
              onBlur={handleBlur}
              error={errors.squareFeet}
              touched={touched.squareFeet}
              required
              placeholder="1500"
              min={0}
              step={10}
            />
          </div>

          {/* UK-specific property details */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">UK Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                id="councilTaxBand"
                name="councilTaxBand"
                label="Council Tax Band"
                value={values.councilTaxBand}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.councilTaxBand}
                touched={touched.councilTaxBand}
                options={councilTaxBandOptions}
                helpText="UK property tax band"
              />

              <SelectField
                id="tenure"
                name="tenure"
                label="Tenure"
                value={values.tenure}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.tenure}
                touched={touched.tenure}
                options={tenureOptions}
                helpText="Ownership type"
              />

              <SelectField
                id="epcRating"
                name="epcRating"
                label="EPC Rating"
                value={values.epcRating}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.epcRating}
                touched={touched.epcRating}
                options={epcRatingOptions}
                helpText="Energy Performance Certificate rating"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Property Image */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Property Image</h2>

        <div className="grid grid-cols-1 gap-4">
          <TextField
            id="imageUrl"
            name="imageUrl"
            label="Image URL"
            value={values.imageUrl || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.imageUrl}
            touched={touched.imageUrl}
            placeholder="https://example.com/property-image.jpg"
            helpText="Enter a URL for the main property image"
          />

          {values.imageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
              <img
                src={values.imageUrl}
                alt="Property preview"
                className="max-w-full h-auto max-h-64 rounded-md border border-gray-200"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Terms and submission */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <CheckboxField
          id="agreeToTerms"
          name="agreeToTerms"
          label="I confirm that all information provided is accurate and I have permission to list this property"
          checked={values.agreeToTerms}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.agreeToTerms}
          touched={touched.agreeToTerms}
          required
        />

        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => resetForm()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Reset
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Property'}
          </button>
        </div>
      </div>
    </form>
  )
}
