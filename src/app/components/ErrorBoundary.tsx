'use client'

import { ReactNode } from 'react'
import ErrorDisplay from './ErrorDisplay'

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  return children
}

ErrorBoundary.displayName = 'ErrorBoundary'
