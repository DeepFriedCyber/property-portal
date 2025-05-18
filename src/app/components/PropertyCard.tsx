'use client'

import Image from 'next/image'
import React from 'react'

import { Property } from '@/types/property'

export default function PropertyCard({ id, title, location, price, imageUrl }: Property) {
  return (
    <div className="border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
      <Image
        src={imageUrl}
        alt={title}
        width={400}
        height={250}
        className="w-full h-64 object-cover"
        priority
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600">{location}</p>
        <p className="text-blue-600 font-bold mt-2">${price.toLocaleString()}</p>
      </div>
    </div>
  )
}
