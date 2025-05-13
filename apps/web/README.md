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