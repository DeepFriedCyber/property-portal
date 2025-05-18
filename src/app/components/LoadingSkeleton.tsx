'use client'

import { Skeleton } from '@/app/components/ui/Skeleton'

export default function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Property cards skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="mt-8 flex justify-center">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  )
}

function PropertyCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden shadow-md">
      {/* Image skeleton */}
      <div className="aspect-w-16 aspect-h-9">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />

        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        <div className="flex space-x-2">
          <Skeleton className="h-6 rounded-full w-20" />
          <Skeleton className="h-6 rounded-full w-20" />
        </div>
      </div>
    </div>
  )
}
