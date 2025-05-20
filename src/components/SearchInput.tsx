'use client'

import debounce from 'lodash.debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useTransition } from 'react'

import { useSearchStore } from '@/store/searchStore'

export default function SearchInput() {
  const [query, setQuery] = useState('')
  const { history, addQuery, clearHistory } = useSearchStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateQuery = useCallback(
    debounce((q: string) => {
      const params = new URLSearchParams(searchParams.toString())
      q ? params.set('q', q) : params.delete('q')
      startTransition(() => {
        router.push(`/search?${params.toString()}`)
        addQuery(q)
      })
    }, 300),
    []
  )

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    updateQuery(val)
  }

  return (
    <div className="mb-4 space-y-2">
      <input
        type="text"
        className="w-full p-3 border rounded"
        value={query}
        onChange={onChange}
        placeholder="Search properties..."
        aria-label="Search input"
      />
      {history.length > 0 && (
        <div className="text-sm text-gray-500">
          Recent:{' '}
          {history.map((q, idx) => (
            <button
              key={idx}
              className="underline mx-1 text-blue-600"
              onClick={() => {
                setQuery(q)
                updateQuery(q)
              }}
            >
              {q}
            </button>
          ))}
          <button className="ml-4 text-red-500" onClick={() => clearHistory()}>
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
