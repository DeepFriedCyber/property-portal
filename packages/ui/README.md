# Property Portal UI Components [![CI Status](https://github.com/DeepFriedCyber/property-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/DeepFriedCyber/property-portal/actions) [![Version](https://img.shields.io/npm/v/@property-portal/ui)](https://npmjs.com/package/@property-portal/ui)

Reusable UI components for the property portal.

## 📦 Installation

```bash
pnpm add @property-portal/ui
<<<<<<< HEAD
```
=======
```

## 🚀 Usage

```jsx
import { PropertyCard, SearchBar } from '@property-portal/ui'

export default function Home() {
  const properties = [
    { id: '1', title: 'Luxury Villa', price: 1500, location: 'Miami' },
    { id: '2', title: 'Cozy Apartment', price: 800, location: 'New York' },
  ]

  return (
    <div>
      <SearchBar onSearch={query => console.log(query)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map(prop => (
          <PropertyCard key={prop.id} {...prop} />
        ))}
      </div>
    </div>
  )
}
```

## 🛠️ Development

```bash
# Run Storybook for component testing
pnpm run storybook

# Build package for production
pnpm run build
```
>>>>>>> clean-branch
