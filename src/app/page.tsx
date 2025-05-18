import PropertyCard from '@/app/components/PropertyCard'
import { fetchProperties } from '@/lib/api'
import { Property } from '@/types/property'

export const metadata = {
  title: 'Home | Property Portal',
  description: 'Discover featured real estate listings',
}

export default async function HomePage() {
  let properties: Property[] = []

  try {
    const result = await fetchProperties()
    properties = result.properties
  } catch (error) {
    console.error('Error fetching properties:', error)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Featured Properties</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {properties.map(property => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
    </main>
  )
}
