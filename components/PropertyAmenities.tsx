'use client'
import { useEffect, useState } from 'react'

import type { Amenity } from '../lib/amenities'

export default function PropertyAmenities({ lat, lng }: { lat: number; lng: number }) {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  useEffect(() => {
    fetch(`/api/amenities?lat=${lat}&lng=${lng}`)
      .then(res => res.json())
      .then(setAmenities)
      .catch(console.error)
  }, [lat, lng])
  if (!amenities.length) return null
  return (
    <ul className="text-sm text-gray-600 mt-2">
      <li className="font-semibold mb-1">Nearby Amenities:</li>
      {amenities.map((a, i) => (
        <li key={i}>
          🏙️ {a.name} – {a.category}
        </li>
      ))}
    </ul>
  )
}
