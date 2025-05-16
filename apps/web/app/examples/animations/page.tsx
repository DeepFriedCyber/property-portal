'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';

import AnimatedComponent, {
  fadeInVariants,
  slideInVariants,
  scaleVariants,
} from '@/components/animations/AnimatedComponent';
import AnimatedModal from '@/components/animations/AnimatedModal';
import AnimatedPropertyCard from '@/components/animations/AnimatedPropertyCard';

// Sample property data
const sampleProperties = [
  {
    id: '1',
    address: '123 Main St, Anytown, USA',
    price: 350000,
    bedrooms: 3,
    type: 'House',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&q=80',
  },
  {
    id: '2',
    address: '456 Oak Ave, Somewhere, USA',
    price: 275000,
    bedrooms: 2,
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&q=80',
  },
  {
    id: '3',
    address: '789 Pine Rd, Nowhere, USA',
    price: 425000,
    bedrooms: 4,
    type: 'House',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80',
  },
  {
    id: '4',
    address: '101 Cedar Ln, Elsewhere, USA',
    price: 199000,
    bedrooms: 1,
    type: 'Condo',
    image: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=500&q=80',
  },
];

// Animation examples page
export default function AnimationExamplesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<(typeof sampleProperties)[0] | null>(
    null
  );

  // Open modal with selected property
  const handlePropertyClick = (property: (typeof sampleProperties)[0]) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <AnimatedComponent variants={fadeInVariants} transition={{ duration: 0.5 }} className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Animation Examples</h1>
        <p className="text-gray-600 mb-8">
          Demonstrating Framer Motion animations with proper cleanup to prevent memory leaks
        </p>
      </AnimatedComponent>

      {/* Basic animation examples */}
      <AnimatedComponent
        variants={slideInVariants}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-semibold mb-4">Basic Animations</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fade in */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-4">Fade In</h3>
            <AnimatedComponent
              variants={fadeInVariants}
              transition={{ duration: 0.5 }}
              className="bg-blue-100 p-4 rounded-lg"
            >
              <p>This content fades in smoothly</p>
            </AnimatedComponent>
          </div>

          {/* Slide in */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-4">Slide In</h3>
            <AnimatedComponent
              variants={slideInVariants}
              transition={{ duration: 0.5 }}
              className="bg-green-100 p-4 rounded-lg"
            >
              <p>This content slides in from the left</p>
            </AnimatedComponent>
          </div>

          {/* Scale */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-4">Scale</h3>
            <AnimatedComponent
              variants={scaleVariants}
              transition={{ duration: 0.5 }}
              className="bg-purple-100 p-4 rounded-lg"
            >
              <p>This content scales up</p>
            </AnimatedComponent>
          </div>
        </div>
      </AnimatedComponent>

      {/* Property cards with scroll animations */}
      <AnimatedComponent
        variants={fadeInVariants}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-semibold mb-4">Property Cards with Scroll Animations</h2>
        <p className="text-gray-600 mb-6">
          These cards animate as you scroll down the page. Click on a card to open the modal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleProperties.map((property, index) => (
            <AnimatedPropertyCard
              key={property.id}
              property={property}
              index={index}
              onClick={handlePropertyClick}
            />
          ))}
        </div>
      </AnimatedComponent>

      {/* Modal example */}
      <AnimatedComponent
        variants={slideInVariants}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-semibold mb-4">Modal with Animations</h2>
        <p className="text-gray-600 mb-6">
          Click the button below to open an animated modal with proper focus management and cleanup.
        </p>

        <motion.button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Open Modal
        </motion.button>
      </AnimatedComponent>

      {/* Animated modal */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProperty ? selectedProperty.address : 'Property Details'}
        ariaDescribedby="modal-description"
      >
        {selectedProperty ? (
          <div>
            {selectedProperty.image && (
              <img
                src={selectedProperty.image}
                alt={selectedProperty.address}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <div id="modal-description">
              <p className="text-2xl font-bold text-blue-600 mb-2">
                ${selectedProperty.price.toLocaleString()}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-semibold">{selectedProperty.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Bedrooms</p>
                  <p className="font-semibold">{selectedProperty.bedrooms}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                This is a beautiful {selectedProperty.bedrooms} bedroom{' '}
                {selectedProperty.type.toLowerCase()}
                located in a prime area. The property features modern amenities and is move-in
                ready.
              </p>

              <div className="flex justify-end space-x-4">
                <motion.button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  onClick={handleCloseModal}
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>

                <motion.button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  whileHover={{ backgroundColor: '#2563eb' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Agent
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <div id="modal-description">
            <p>Select a property to view details.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        )}
      </AnimatedModal>
    </div>
  );
}
