# Property Portal Web Application

This is the web frontend for the Property Portal project, built with Next.js and Tailwind CSS.

## Project Structure

```
apps/web/
├── app/                  # Next.js app directory
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Homepage component
├── components/           # Reusable components
│   ├── layout/           # Layout components
│   │   ├── Header.tsx    # Site header with navigation
│   │   └── Footer.tsx    # Site footer
│   └── sections/         # Page sections
│       ├── Hero.tsx      # Hero section with search
│       ├── Features.tsx  # Features grid section
│       └── CallToAction.tsx # CTA section
├── public/               # Static assets
└── ...                   # Configuration files
```

## Components

### Layout Components

- **Header**: Navigation bar with responsive mobile menu
- **Footer**: Site footer with multiple columns and social links

### Section Components

- **Hero**: Main hero section with search functionality
- **Features**: Grid of feature cards
- **CallToAction**: CTA section with primary and secondary buttons

## Getting Started

1. Install dependencies:

   ```
   pnpm install
   ```

2. Run the development server:

   ```
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```
pnpm build
```

## Running Production Build

```
pnpm start
```

## Testing

This project uses Vitest for unit and integration testing, and Cypress for end-to-end and accessibility testing.

### Running Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### Running Cypress Tests

```bash
# Open Cypress test runner
pnpm cypress

# Run all Cypress tests headlessly
pnpm cypress:run

# Run only accessibility tests
pnpm cypress:a11y
```

## Environment Variables

This project uses type-safe environment variables with `@t3-oss/env-nextjs`. See the `.env.example` file for required variables.

## Accessibility

The components in this application are built with accessibility in mind. Key features include:

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

### PropertyCard

The PropertyCard component displays property information in an accessible card format:

```tsx
<PropertyCard title="Modern Apartment" price={1500} />
```

Features:

- Semantic HTML with `role="article"`
- Descriptive ARIA labels
- Keyboard navigation support
- Focus indicators
