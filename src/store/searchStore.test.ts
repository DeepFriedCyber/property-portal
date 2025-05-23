import { describe, it, expect, beforeEach } from 'vitest'

import { useSearchStore } from './searchStore'

describe('Search Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    useSearchStore.setState({ history: [] })
  })

  it('adds a query to the history', () => {
    // Add a query
    useSearchStore.getState().addQuery('london apartment')

    // Verify the history
    expect(useSearchStore.getState().history).toEqual(['london apartment'])
  })

  it('adds multiple queries to the history', () => {
    // Add multiple queries
    useSearchStore.getState().addQuery('london apartment')
    useSearchStore.getState().addQuery('manchester house')
    useSearchStore.getState().addQuery('birmingham flat')

    // Verify the history (newest first)
    expect(useSearchStore.getState().history).toEqual([
      'birmingham flat',
      'manchester house',
      'london apartment',
    ])
  })

  it('prevents duplicate queries', () => {
    // Add the same query multiple times
    useSearchStore.getState().addQuery('london apartment')
    useSearchStore.getState().addQuery('manchester house')
    useSearchStore.getState().addQuery('london apartment')

    // Verify the history (duplicates removed, newest first)
    expect(useSearchStore.getState().history).toEqual(['london apartment', 'manchester house'])
  })

  it('limits the history to 10 items', () => {
    // Add more than 10 queries
    for (let i = 1; i <= 12; i++) {
      useSearchStore.getState().addQuery(`query ${i}`)
    }

    // Verify the history is limited to 10 items
    const history = useSearchStore.getState().history
    expect(history).toHaveLength(10)
    expect(history[0]).toBe('query 12') // Newest first
    expect(history[9]).toBe('query 3') // Oldest last
  })

  it('clears the history', () => {
    // Add some queries
    useSearchStore.getState().addQuery('london apartment')
    useSearchStore.getState().addQuery('manchester house')

    // Clear the history
    useSearchStore.getState().clearHistory()

    // Verify the history is empty
    expect(useSearchStore.getState().history).toEqual([])
  })
})
