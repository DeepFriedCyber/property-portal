// components/ui/OptimizedImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  lowQualitySrc?: string;
  loadingColor?: string;
  aspectRatio?: number;
  className?: string;
}

/**
 * OptimizedImage component with progressive loading, blur-up effect, and error handling
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  lowQualitySrc,
  loadingColor = '#f3f4f6',
  aspectRatio,
  className = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  // Set the current source based on loading state
  useEffect(() => {
    if (hasError) {
      setCurrentSrc(fallbackSrc);
    } else if (isLoading && lowQualitySrc) {
      setCurrentSrc(lowQualitySrc);
    } else {
      setCurrentSrc(typeof src === 'string' ? src : '');
    }
  }, [isLoading, hasError, src, lowQualitySrc, fallbackSrc]);

  // Calculate padding based on aspect ratio for responsive sizing
  const paddingBottom = aspectRatio ? `${(1 / aspectRatio) * 100}%` : undefined;

  // Handle image load event
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handle image error event
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={paddingBottom ? { paddingBottom } : undefined}
    >
      {isLoading && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: loadingColor }}
        />
      )}
      
      <Image
        src={currentSrc || fallbackSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-60 blur-sm' : 'opacity-100 blur-0'
        }`}
        onLoadingComplete={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;