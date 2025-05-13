import React from 'react';
import Image from 'next/image';
import { FeatureItem } from './Features';

interface FeatureCardProps {
  feature: FeatureItem;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, className = '' }) => {
  const renderIcon = (icon: FeatureItem['icon']) => {
    if (React.isValidElement(icon)) {
      return icon;
    } else if (typeof icon === 'string') {
      return <span className="text-blue-600 text-2xl" aria-hidden="true">{icon}</span>;
    } else if (icon && typeof icon === 'object' && 'src' in icon) {
      return (
        <Image 
          src={icon.src} 
          alt={icon.alt || feature.title} 
          width={24} 
          height={24} 
          className="w-6 h-6"
        />
      );
    }
    return null;
  };

  return (
    <div 
      className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col ${className}`}
      tabIndex={0}
    >
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        {renderIcon(feature.icon)}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
      <p className="text-gray-600 flex-grow">{feature.description}</p>
    </div>
  );
};