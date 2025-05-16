'use client';

import React from 'react';

import ApiFormExample from '@/components/examples/ApiFormExample';
import PropertyForm from '@/components/examples/PropertyForm';

/**
 * Form validation example page
 */
export default function FormValidationPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Form Validation Examples</h1>
        <p className="text-gray-600">
          These examples demonstrate form validation using Zod schemas with detailed error messages.
        </p>
      </div>

      {/* API Form Example */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">API Validation Example</h2>
        <p className="text-gray-600 mb-6">
          This example shows how to handle API validation errors in a login form.
        </p>

        <ApiFormExample />
      </div>

      <hr className="my-12 border-gray-200" />

      {/* Property Form Example */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Complex Form Example</h2>
        <p className="text-gray-600 mb-4">
          This example demonstrates validation for a more complex form with different field types.
        </p>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Try the following:</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Submit the form without filling any fields to see validation errors</li>
            <li>Enter an invalid ZIP code (e.g., "abc" or "123")</li>
            <li>Enter a negative number for bedrooms or price</li>
            <li>Try submitting without checking the terms checkbox</li>
          </ul>
        </div>

        <PropertyForm
          onSubmit={async (data) => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));
            console.log('Form submitted:', data);

            // Randomly throw an error to demonstrate error handling
            if (Math.random() > 0.7) {
              throw new Error('Random server error occurred. Please try again.');
            }
          }}
        />
      </div>
    </div>
  );
}
