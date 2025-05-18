// PropertyCardSkeleton.tsx
import React from 'react'

import styles from './PropertyCardSkeleton.module.css'
import Skeleton from './Skeleton'

interface PropertyCardSkeletonProps {
  count?: number
}

const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.card}>
          {/* Image placeholder */}
          <Skeleton height={200} className={styles.image} />

          {/* Title placeholder */}
          <Skeleton height={24} width="80%" className={styles.title} />

          {/* Price placeholder */}
          <Skeleton height={20} width="60%" className={styles.price} />

          {/* Details placeholders */}
          <div className={styles.details}>
            <Skeleton height={16} width="30%" />
            <Skeleton height={16} width="30%" />
            <Skeleton height={16} width="30%" />
          </div>

          {/* Description placeholder */}
          <div className={styles.description}>
            <Skeleton height={12} />
            <Skeleton height={12} />
            <Skeleton height={12} width="80%" />
          </div>
        </div>
      ))}
    </>
  )
}

export default PropertyCardSkeleton
