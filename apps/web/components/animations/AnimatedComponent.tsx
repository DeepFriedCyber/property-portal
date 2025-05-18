'use client'

import { motion, Variants } from 'framer-motion'
import React, { ReactNode } from 'react'

// Common animation variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const slideInVariants: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1 },
}

export const scaleVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
}

interface AnimatedComponentProps {
  children: ReactNode
  className?: string
  variants: Variants
  transition?: {
    duration?: number
    delay?: number
    ease?: string | number[]
  }
}

/**
 * A reusable animated component that wraps content with Framer Motion animations
 */
const AnimatedComponent: React.FC<AnimatedComponentProps> = ({
  children,
  className = '',
  variants,
  transition = { duration: 0.5 },
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedComponent
