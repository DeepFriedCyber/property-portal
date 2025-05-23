'use client'

import { useState } from 'react'

import { addProperty } from '@/app/actions/properties'
import { CreatePropertyInput } from '@/lib/schemas/propertySchemas'

export default function AddPropertyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await addProperty(formData)

      if (result.success) {
        setSuccess(true)
        // Reset form
        ;(document.getElementById('property-form') as HTMLFormElement).reset()
      } else {
        setError(result.error?.message || 'Failed to add property')
        console.error('Validation errors:', result.error?.details)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Property</h2>

      {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}

      {success && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-md">
          Property added successfully!
        </div>
      )}

      <form id="property-form" action={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Property Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (£)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="1000"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="listingType" className="block text-sm font-medium text-gray-700">
                Listing Type
              </label>
              <select
                id="listingType"
                name="listingType"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
              Property Type
            </label>
            <select
              id="propertyType"
              name="propertyType"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="flat">Flat</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="bungalow">Bungalow</option>
              <option value="maisonette">Maisonette</option>
              <option value="cottage">Cottage</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address</h3>

          <div>
            <label htmlFor="address.line1" className="block text-sm font-medium text-gray-700">
              Address Line 1
            </label>
            <input
              type="text"
              id="address.line1"
              name="address.line1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="address.line2" className="block text-sm font-medium text-gray-700">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              id="address.line2"
              name="address.line2"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="address.town" className="block text-sm font-medium text-gray-700">
                Town/City
              </label>
              <input
                type="text"
                id="address.town"
                name="address.town"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="address.county" className="block text-sm font-medium text-gray-700">
                County (Optional)
              </label>
              <input
                type="text"
                id="address.county"
                name="address.county"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address.postcode" className="block text-sm font-medium text-gray-700">
              Postcode
            </label>
            <input
              type="text"
              id="address.postcode"
              name="address.postcode"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Property Details</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                min="0"
                step="0.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="receptionRooms" className="block text-sm font-medium text-gray-700">
                Reception Rooms
              </label>
              <input
                type="number"
                id="receptionRooms"
                name="receptionRooms"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700">
              Square Footage
            </label>
            <input
              type="number"
              id="squareFootage"
              name="squareFootage"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tenure" className="block text-sm font-medium text-gray-700">
                Tenure
              </label>
              <select
                id="tenure"
                name="tenure"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">-- Select --</option>
                <option value="freehold">Freehold</option>
                <option value="leasehold">Leasehold</option>
                <option value="share_of_freehold">Share of Freehold</option>
                <option value="commonhold">Commonhold</option>
              </select>
            </div>

            <div>
              <label htmlFor="councilTaxBand" className="block text-sm font-medium text-gray-700">
                Council Tax Band
              </label>
              <select
                id="councilTaxBand"
                name="councilTaxBand"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">-- Select --</option>
                <option value="A">Band A</option>
                <option value="B">Band B</option>
                <option value="C">Band C</option>
                <option value="D">Band D</option>
                <option value="E">Band E</option>
                <option value="F">Band F</option>
                <option value="G">Band G</option>
                <option value="H">Band H</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="epcRating" className="block text-sm font-medium text-gray-700">
              EPC Rating
            </label>
            <select
              id="epcRating"
              name="epcRating"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
            </select>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => (document.getElementById('property-form') as HTMLFormElement).reset()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Submitting...' : 'Add Property'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
