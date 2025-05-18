import React from 'react'

import { FeatureCard } from './FeatureCard'

export interface FeatureItem {
  id: string
  title: string
  description: string
  icon:
    | string
    | React.ReactElement
    | {
        src: string
        alt?: string
      }
}

export interface FeaturesProps {
  title: string
  subtitle: string
  features: FeatureItem[]
  className?: string
}

export default function Features({ title, subtitle, features, className = '' }: FeaturesProps) {
  return (
    <section className={`py-16 bg-gray-50 px-6 ${className}`} aria-labelledby="features-heading">
      <div className="container mx-auto">
        <h2 id="features-heading" className="text-3xl font-bold text-center mb-4">
          {title}
        </h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10">{subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map(item => (
            <FeatureCard key={item.id} feature={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
