import React from 'react'

import { PropertyForm } from '../components/PropertyForm'

export const metadata = {
  title: 'Add New Property | Property Portal',
  description: 'Add a new property listing to the Property Portal',
}

export default function NewPropertyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Property</h1>
      <PropertyForm />
    </div>
  )
}
