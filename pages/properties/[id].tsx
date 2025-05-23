// pages/properties/[id].tsx
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

// Import the SimilarProperties component
const SimilarProperties = dynamic(() => import('../../components/search/SimilarProperties'), {
  ssr: false,
})

// Define Property type
interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  squareFeet: number
  propertyType: string
  status: string
  images?: string[]
  features?: string[]
  createdAt: string
}

export default function PropertyDetailPage() {
  const router = useRouter()
  const { id } = router.query

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch when we have an ID
    if (!id) return

    const fetchProperty = async () => {
      setLoading(true)
      setError(null)

      try {
        // In a real app, this would be an API call
        // For now, we'll simulate fetching property data
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock property data
        const mockProperty: Property = {
          id: id as string,
          title: `Luxury ${id === 'prop-123' ? 'Penthouse' : 'Property'} with Amazing Views`,
          description: `This stunning ${id === 'prop-123' ? 'penthouse' : 'property'} offers breathtaking views and luxurious amenities. Located in a prime area, it features high-end finishes, spacious rooms, and modern design. Perfect for those seeking comfort and elegance in urban living.`,
          price: 1150000,
          location: 'London, UK',
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1850,
          propertyType: id === 'prop-123' ? 'penthouse' : 'apartment',
          status: 'available',
          images: [
            'https://placehold.co/600x400?text=Property+Image+1',
            'https://placehold.co/600x400?text=Property+Image+2',
            'https://placehold.co/600x400?text=Property+Image+3',
          ],
          features: [
            'Floor-to-ceiling windows',
            'Private balcony',
            'Gourmet kitchen',
            'Hardwood floors',
            'Smart home technology',
            'In-unit laundry',
            'Central air conditioning',
            'Walk-in closets',
          ],
          createdAt: new Date().toISOString(),
        }

        setProperty(mockProperty)
      } catch (err) {
        console.error('Error fetching property:', err)
        setError('Failed to load property details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button onClick={() => router.reload()} className="mt-2 text-blue-500 hover:underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700">Property Not Found</h2>
          <p className="mt-2 text-gray-600">
            The property you&#39;re looking for doesn&#39;t exist or has been removed.
          </p>
          <Link href="/search">
            <a className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Back to Search
            </a>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/search">
          <a className="text-blue-500 hover:underline flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Search
          </a>
        </Link>
      </div>

      {/* Property title and status */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.status === 'available'
              ? 'bg-green-100 text-green-800'
              : property.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
        </span>
      </div>

      {/* Property location */}
      <p className="text-gray-600 text-lg mb-6">{property.location}</p>

      {/* Property images */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {property.images &&
            property.images.map((image, index) => (
              <div
                key={index}
                className={`${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} h-64 bg-gray-200`}
              >
                <img
                  src={image}
                  alt={`${property.title} #${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
        </div>
      </div>

      {/* Property details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {property.features &&
                property.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Price and details card */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-4">
            <div className="text-3xl font-bold text-gray-900 mb-4">
              £{property.price.toLocaleString()}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-gray-500 text-sm">Bedrooms</div>
                <div className="font-bold text-lg">{property.bedrooms}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-gray-500 text-sm">Bathrooms</div>
                <div className="font-bold text-lg">{property.bathrooms}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-gray-500 text-sm">Area</div>
                <div className="font-bold text-lg">{property.squareFeet} sq ft</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-gray-500 text-sm">Type</div>
                <div className="font-bold text-lg capitalize">{property.propertyType}</div>
              </div>
            </div>

            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium">
              Contact Agent
            </button>

            <button className="w-full mt-3 border border-blue-500 text-blue-500 hover:bg-blue-50 py-3 px-4 rounded-lg font-medium">
              Schedule Viewing
            </button>
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {id && <SimilarProperties propertyId={id as string} />}
    </div>
  )
}
