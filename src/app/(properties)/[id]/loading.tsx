import { Skeleton } from '@/app/components/ui/Skeleton'

export default function PropertyDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
        {/* Image skeleton */}
        <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Content skeleton */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/3" />

          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="flex space-x-2">
            <Skeleton className="h-6 rounded-full w-20" />
            <Skeleton className="h-6 rounded-full w-20" />
            <Skeleton className="h-6 rounded-full w-20" />
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <Skeleton className="h-4 w-1/2" />
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-1/2" />
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
