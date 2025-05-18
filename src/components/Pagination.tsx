'use client'

import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null

  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always include first page, last page, current page, and pages adjacent to current
      pages.push(1)

      if (currentPage > 3) {
        pages.push(null) // Ellipsis
      }

      // Pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push(null) // Ellipsis
      }

      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className="flex justify-center mt-8" aria-label="Pagination">
      <ul className="flex items-center space-x-2">
        {/* Previous page button */}
        <li>
          <Link
            href={currentPage > 1 ? `${baseUrl}${currentPage - 1}` : '#'}
            className={`px-3 py-1 rounded border ${
              currentPage > 1
                ? 'border-gray-300 hover:bg-gray-100'
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
          >
            Previous
          </Link>
        </li>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === null) {
            return (
              <li key={`ellipsis-${index}`} className="px-3 py-1">
                ...
              </li>
            )
          }

          return (
            <li key={page}>
              <Link
                href={`${baseUrl}${page}`}
                className={`px-3 py-1 rounded border ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </Link>
            </li>
          )
        })}

        {/* Next page button */}
        <li>
          <Link
            href={currentPage < totalPages ? `${baseUrl}${currentPage + 1}` : '#'}
            className={`px-3 py-1 rounded border ${
              currentPage < totalPages
                ? 'border-gray-300 hover:bg-gray-100'
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
          >
            Next
          </Link>
        </li>
      </ul>
    </nav>
  )
}
