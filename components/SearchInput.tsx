import debounce from 'lodash.debounce'
import { useRouter } from 'next/router'
import { useState, useCallback, useEffect } from 'react'

import { useSearchStore } from '../store/searchStore'

export default function SearchInput() {
  const [query, setQuery] = useState('')
  const { history, addQuery, clearHistory } = useSearchStore()
  const router = useRouter()

  // Initialize query from URL
  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q as string)
    }
  }, [router.query.q])

  const updateQuery = useCallback(
    debounce((q: string) => {
      const query = { ...router.query }
      if (q) {
        query.q = q
      } else {
        delete query.q
      }

      router.push(
        {
          pathname: '/search',
          query,
        },
        undefined,
        { shallow: true }
      )

      if (q) {
        addQuery(q)
      }
    }, 300),
    [router, addQuery]
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
