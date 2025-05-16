'use client';

import { motion } from 'framer-motion';
import React from 'react';

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
  onClick: (property: Property) => void;
}

/**
 * An animated property card component with hover effects
 */
const AnimatedPropertyCard: React.FC<AnimatedPropertyCardProps> = ({
  property,
  index,
  onClick,
}) => {
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      onClick={() => onClick(property)}
    >
      {property.image && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={property.image}
            alt={property.address}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-3 py-1 text-sm font-semibold">
            {property.type}
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.address}</h3>
        <p className="text-blue-600 font-bold text-xl mb-2">${property.price.toLocaleString()}</p>
        <p className="text-gray-600">
          {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
        </p>
      </div>
    </motion.div>
  );
};

export default AnimatedPropertyCard;
