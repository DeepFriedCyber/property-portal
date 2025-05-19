// app/search/page.tsx
import SearchForm from '@/components/SearchForm'

export const metadata = {
  title: 'Semantic Property Search',
  description: 'Search for properties using natural language',
}

export default function SearchPage() {
  return <SearchForm />
}