'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Map = dynamic(() => import('@property-portal/ui').then((mod) => mod.Map), {
  ssr: false,
  loading: () => <p className="text-center">Loading map...</p>,
});

export default function DynamicMap() {
  return (
    <Suspense fallback="Loading map...">
      <Map center={[40.71, -74.01]} zoom={12} />
    </Suspense>
  );
}