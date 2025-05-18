import { notFound } from 'next/navigation'

import { getProperty } from '@/app/actions/properties'
import { Property } from '@/types/property'

import PropertyDetailContent from './PropertyDetailContent'

interface PropertyResult {
  success: boolean
  data: Property
  error?: string
}

export default async function PropertyDetailData({ id }: { id: string }) {
  const result = (await getProperty(id)) as PropertyResult
  if (!result.success) notFound()
  return <PropertyDetailContent property={result.data} />
}
