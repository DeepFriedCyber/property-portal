// components/animations/AnimatedPropertyCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useAnimation';

interface Property {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  type: string;
  image?: string;
}

interface AnimatedPropertyCardProps {
  property: Property;
  index: number;
  onClick?: (property: Property) => void;
  className?: string;
}

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }),
  hover: {
    y: -10,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  tap: {
    y: -5,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: {
      duration: 0.1,
      ease: 'easeOut'
    }
  }
};

/**
 * Animated property card component with scroll-triggered animation
 * and proper cleanup to prevent memory leaks
 */
const AnimatedPropertyCard: React.FC<AnimatedPropertyCardProps> = ({
  property,
  index,
  onClick,
  className = ''
}) => {
  // Use scroll animation hook with proper cleanup
  const { ref, variants, animate, custom } = useScrollAnimation({
    variants: cardVariants,
    custom: index,
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });
  
  const handleClick = () => {
    if (onClick) {
      onClick(property);
    }
  };
  
  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      variants={variants}
      initial="hidden"
      animate={animate}
      custom={custom}
      whileHover="hover"
      whileTap="tap"
      onClick={handleClick}
      layout
    >
      {/* Property image */}
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        {property.image ? (
          <img
            src={property.image}
            alt={property.address}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
        
        {/* Price tag */}
        <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-tr-lg font-semibold">
          ${property.price.toLocaleString()}
        </div>
      </div>
      
      {/* Property details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{property.address}</h3>
        
        <div className="flex justify-between text-gray-600">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>{property.type}</span>
          </div>
          
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 00-1 1v12a1 1 0 002 0V4a1 1 0 00-1-1zm6 0a1 1 0 00-1 1v12a1 1 0 002 0V4a1 1 0 00-1-1z" />
              <path d="M3 7a1 1 0 00-1 1v8a1 1 0 002 0V8a1 1 0 00-1-1zm14 0a1 1 0 00-1 1v8a1 1 0 002 0V8a1 1 0 00-1-1z" />
            </svg>
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedPropertyCard;