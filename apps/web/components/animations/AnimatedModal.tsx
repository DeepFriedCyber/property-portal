'use client'

import { motion, AnimatePresence } from 'framer-motion'
import React, { useEffect, useRef } from 'react'

interface AnimatedModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  ariaDescribedby?: string
}

/**
 * An accessible animated modal component with proper focus management
 */
const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  ariaDescribedby,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Manage focus and keyboard events
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement

      // Add keyboard event listener
      window.addEventListener('keydown', handleKeyDown)

      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus()
      }

      // Prevent body scrolling
      document.body.style.overflow = 'hidden'
    } else {
      // Remove keyboard event listener
      window.removeEventListener('keydown', handleKeyDown)

      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }

      // Restore body scrolling
      document.body.style.overflow = ''
    }

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // Modal animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby={ariaDescribedby}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 id="modal-title" className="text-xl font-semibold">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedModal
