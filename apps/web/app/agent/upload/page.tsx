import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import PropertyUploadForm from '../../../components/PropertyUploadForm'

export const metadata = {
  title: 'Upload Properties',
  description: 'Upload property listings via CSV',
}

export default async function UploadPage() {
  // Server-side authentication check
  const { userId } = await auth()

  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/sign-in?redirect_url=/agent/upload')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Property Upload</h1>
      <PropertyUploadForm />

      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">CSV Format Instructions</h2>
        <p className="mb-4">Your CSV file should include the following columns:</p>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Column</th>
                <th className="py-2 px-4 border-b text-left">Required</th>
                <th className="py-2 px-4 border-b text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">address</td>
                <td className="py-2 px-4 border-b">Yes</td>
                <td className="py-2 px-4 border-b">Full property address</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">city</td>
                <td className="py-2 px-4 border-b">No</td>
                <td className="py-2 px-4 border-b">City name</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">state</td>
                <td className="py-2 px-4 border-b">No</td>
                <td className="py-2 px-4 border-b">State or province</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">zipCode</td>
                <td className="py-2 px-4 border-b">No</td>
                <td className="py-2 px-4 border-b">ZIP or postal code</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">price</td>
                <td className="py-2 px-4 border-b">No</td>
                <td className="py-2 px-4 border-b">Property price (numeric)</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">bedrooms</td>
                <td className="py-2 px-4 border-b">No</td>
                <td className="py-2 px-4 border-b">Number of bedrooms (numeric)</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">bathrooms</td>
                <td className="py-2 px-4 border-b">No</td>
                <td className="py-2 px-4 border-b">Number of bathrooms (numeric)</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">squareFeet</td>
                <td className="py-2 px-4 border-b">No</td>
                <td className="py-2 px-4 border-b">Property area in square feet (numeric)</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">description</td>
                <td className="py-2 px-4 border-b">No</td>
                <td className="py-2 px-4 border-b">Property description</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">type</td>
                <td className="py-2 px-4 border-b">No</td>
                <td className="py-2 px-4 border-b">
                  Property type (e.g., House, Apartment, Condo)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Tips:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Make sure your CSV file has a header row with the column names</li>
            <li>The address field is required for all properties</li>
            <li>Numeric fields (price, bedrooms, etc.) should contain only numbers</li>
            <li>You can download a sample CSV file using the link above the upload button</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
