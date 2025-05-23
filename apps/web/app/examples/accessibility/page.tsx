import { PropertyCard } from '../../../components/PropertyCard'

export default function AccessibilityExamplesPage() {
  // Sample property data
  const properties = [
    { id: '1', title: 'Modern Downtown Apartment', price: 1500 },
    { id: '2', title: 'Cozy Suburban House', price: 2200 },
    { id: '3', title: 'Luxury Penthouse', price: 3500 },
    { id: '4', title: 'Studio near University', price: 950 },
  ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Accessible Property Cards</h1>
      <p className="mb-6">These property cards are built with accessibility in mind, featuring:</p>
      <ul className="list-disc pl-6 mb-8">
        <li>Proper semantic HTML with role=&quot;article&quot;</li>
        <li>Descriptive aria-labels</li>
        <li>Keyboard navigation support</li>
        <li>Focus indicators</li>
        <li>Proper heading hierarchy</li>
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <PropertyCard key={property.id} title={property.title} price={property.price} />
        ))}
      </div>
    </div>
  )
}
