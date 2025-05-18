import Link from 'next/link'
import Image from 'next/image'
import { Property } from '@/types/property'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { id, title, location, price, imageUrl } = property

  // Format price with commas
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)

  return (
    <Link href={`/properties/${id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-600">
            {title}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{location}</p>
          <p className="text-blue-600 font-bold">{formattedPrice}</p>
        </div>
      </div>
    </Link>
  )
}
