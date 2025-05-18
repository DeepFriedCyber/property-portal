'use client'
import debounce from 'lodash.debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'

export default function SearchInput() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useCallback(
    debounce((q: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (q) {
        params.set('q', q)
      } else {
        params.delete('q')
      }
      startTransition(() => {
        router.push(`/search?${params.toString()}`)
      })
    }, 400),
    []
  )

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    handleSearch(val)
  }

  return (
    <div className="mb-6">
      <input
        type="text"
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search by title or location..."
        onChange={onChange}
        value={query}
        aria-label="Search Properties"
      />
    </div>
  )
}
