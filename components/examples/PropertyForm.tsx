'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { useFormValidation } from '@/hooks/useFormValidation';
import { 
  TextField, 
  TextAreaField, 
  SelectField, 
  CheckboxField,
  FormError
} from '@/components/forms';

// Define the form schema using Zod
const propertyFormSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789'),
  price: z.preprocess(
    (val) => val === '' ? undefined : Number(val),
    z.number({ invalid_type_error: 'Price must be a number' })
      .positive('Price must be greater than zero')
      .optional()
      .or(z.literal(undefined))
  ),
  bedrooms: z.preprocess(
    (val) => val === '' ? undefined : Number(val),
    z.number({ invalid_type_error: 'Bedrooms must be a number' })
      .int('Bedrooms must be a whole number')
      .nonnegative('Bedrooms cannot be negative')
      .optional()
      .or(z.literal(undefined))
  ),
  bathrooms: z.preprocess(
    (val) => val === '' ? undefined : Number(val),
    z.number({ invalid_type_error: 'Bathrooms must be a number' })
      .nonnegative('Bathrooms cannot be negative')
      .optional()
      .or(z.literal(undefined))
  ),
  propertyType: z.enum(['house', 'apartment', 'condo', 'townhouse', 'land', 'other'], {
    errorMap: () => ({ message: 'Please select a property type' })
  }),
  description: z.string().optional(),
  featured: z.boolean().optional().default(false),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' })
  })
});

// Infer the form data type from the schema
type PropertyFormData = z.infer<typeof propertyFormSchema>;

// Initial form values
const initialValues: PropertyFormData = {
  address: '',
  city: '',
  state: '',
  zipCode: '',
  price: undefined,
  bedrooms: undefined,
  bathrooms: undefined,
  propertyType: 'house',
  description: '',
  featured: false,
  agreeToTerms: false
};

// Property type options
const propertyTypeOptions = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'other', label: 'Other' }
];

// State options (abbreviated)
const stateOptions = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  { value: 'WA', label: 'Washington' }
];

interface PropertyFormProps {
  onSubmit?: (data: PropertyFormData) => Promise<void>;
  initialData?: Partial<PropertyFormData>;
}

/**
 * Property form with validation
 */
const PropertyForm: React.FC<PropertyFormProps> = ({
  onSubmit,
  initialData
}) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Merge initial data with default values
  const mergedInitialValues = {
    ...initialValues,
    ...initialData
  };
  
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
    resetForm
  } = useFormValidation({
    initialValues: mergedInitialValues,
    schema: propertyFormSchema,
    onSubmit: async (data) => {
      setServerError(null);
      setSubmitSuccess(false);
      
      try {
        if (onSubmit) {
          await onSubmit(data);
        } else {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('Form submitted:', data);
        }
        
        setSubmitSuccess(true);
        resetForm();
      } catch (error) {
        console.error('Form submission error:', error);
        setServerError(
          error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred. Please try again.'
        );
      }
    }
  });
  
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Form-level errors */}
      <FormError error={errors._form || serverError} />
      
      {/* Success message */}
      {submitSuccess && (
        <div className="p-3 mb-4 bg-green-50 border border-green-200 text-green-700 rounded-md" role="alert">
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
      
      {/* Property address section */}
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              placeholder="New York"
            />
            
            <SelectField
              id="state"
              name="state"
              label="State"
              value={values.state}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.state}
              touched={touched.state}
              required
              options={stateOptions}
              placeholder="Select a state"
            />
            
            <TextField
              id="zipCode"
              name="zipCode"
              label="ZIP Code"
              value={values.zipCode}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.zipCode}
              touched={touched.zipCode}
              required
              placeholder="12345"
            />
          </div>
        </div>
      </div>
      
      {/* Property details section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Property Details</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              id="price"
              name="price"
              label="Price"
              type="number"
              value={values.price === undefined ? '' : values.price}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.price}
              touched={touched.price}
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
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.bedrooms}
              touched={touched.bedrooms}
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
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.bathrooms}
              touched={touched.bathrooms}
              placeholder="2"
              min={0}
              step={0.5}
            />
          </div>
          
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
          
          <TextAreaField
            id="description"
            name="description"
            label="Description"
            value={values.description || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.description}
            touched={touched.description}
            rows={4}
            placeholder="Describe the property..."
            helpText="Provide a detailed description of the property to attract potential buyers."
          />
          
          <CheckboxField
            id="featured"
            name="featured"
            label="Feature this property in search results"
            checked={values.featured}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.featured}
            touched={touched.featured}
            helpText="Featured properties appear at the top of search results."
          />
        </div>
      </div>
      
      {/* Terms and submission */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <CheckboxField
          id="agreeToTerms"
          name="agreeToTerms"
          label="I agree to the terms and conditions"
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
  );
};

export default PropertyForm;