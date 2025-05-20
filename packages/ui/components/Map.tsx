import React from 'react';

interface MapProps {
  center?: [number, number];
  zoom?: number;
}

/**
 * A simple Map component placeholder
 * This is a simplified version that doesn't require Leaflet
 */
export function Map({ center = [51.505, -0.09], zoom = 13 }: MapProps) {
  return (
    <div
      className="bg-gray-200 rounded-md p-4 w-full h-[400px] flex items-center justify-center"
      data-testid="map-container"
    >
      <div className="text-center">
        <p className="text-lg font-semibold">Map Component</p>
        <p>
          Center: {center[0]}, {center[1]}
        </p>
        <p>Zoom: {zoom}</p>
      </div>
    </div>
  );
}
