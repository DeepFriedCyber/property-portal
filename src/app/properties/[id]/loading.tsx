export default function PropertyDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button skeleton */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start animate-pulse">
        {/* Image skeleton */}
        <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-300"></div>

        {/* Content skeleton */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="mt-2 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="mt-2 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="mt-2 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>

          {/* Map skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-64 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Amenities skeleton */}
      <div className="mt-12">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="h-12 bg-gray-200 rounded-md"></div>
          <div className="h-12 bg-gray-200 rounded-md"></div>
          <div className="h-12 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* Nearby properties skeleton */}
      <div className="mt-12">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded-md"></div>
          <div className="h-64 bg-gray-200 rounded-md"></div>
          <div className="h-64 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  )
}
