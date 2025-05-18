// components/animations/AnimatedModal.tsx
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import React, { useEffect, useRef } from 'react'

interface AnimatedModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  ariaDescribedby?: string
  className?: string
  showCloseButton?: boolean
  closeOnEsc?: boolean
  closeOnOutsideClick?: boolean
  animationDuration?: number
}

/**
 * An accessible modal component with Framer Motion animations
 * and proper cleanup to prevent memory leaks
 */
const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  ariaDescribedby,
  className = '',
  showCloseButton = true,
  closeOnEsc = true,
  closeOnOutsideClick = true,
  animationDuration = 0.3,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const backdropControls = useAnimation()
  const modalControls = useAnimation()

  // Animation state tracking to prevent memory leaks
  const animationState = useRef({
    isAnimating: false,
    isMounted: false,
  })

  // Store the element that had focus before opening the modal
  useEffect(() => {
    animationState.current.isMounted = true

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }

    return () => {
      animationState.current.isMounted = false
    }
  }, [isOpen])

  // Handle keyboard navigation and focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on ESC key
      if (closeOnEsc && event.key === 'Escape') {
        onClose()
        return
      }

      // Trap focus inside modal
      if (event.key === 'Tab') {
        if (!modalRef.current) return

        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        // Shift + Tab
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            event.preventDefault()
          }
        }
        // Tab
        else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            event.preventDefault()
          }
        }
      }
    }

    // Set focus to the first focusable element in the modal
    const setInitialFocus = () => {
      if (!modalRef.current || !animationState.current.isMounted) return

      const focusableElement = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement

      if (focusableElement) {
        focusableElement.focus()
      } else {
        // If no focusable element, focus the modal itself
        modalRef.current.focus()
      }
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)

    // Set initial focus after a short delay to ensure the modal is fully rendered
    const focusTimer = setTimeout(setInitialFocus, 100)

    // Prevent scrolling of the body when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(focusTimer)

      // Restore body scrolling when modal closes
      document.body.style.overflow = ''

      // Restore focus to the element that had focus before the modal was opened
      if (previousFocusRef.current && animationState.current.isMounted) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, onClose, closeOnEsc])

  // Handle animations
  useEffect(() => {
    const animateModal = async () => {
      if (!animationState.current.isMounted) return

      if (isOpen) {
        animationState.current.isAnimating = true

        // Animate backdrop first
        await backdropControls.start({
          opacity: 1,
          transition: { duration: animationDuration * 0.5 },
        })

        if (!animationState.current.isMounted) return

        // Then animate modal
        await modalControls.start({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: animationDuration * 0.5,
            type: 'spring',
            damping: 25,
            stiffness: 300,
          },
        })

        if (!animationState.current.isMounted) return
        animationState.current.isAnimating = false
      } else {
        animationState.current.isAnimating = true

        // Animate modal out first
        await modalControls.start({
          opacity: 0,
          y: 20,
          scale: 0.95,
          transition: { duration: animationDuration * 0.5 },
        })

        if (!animationState.current.isMounted) return

        // Then animate backdrop
        await backdropControls.start({
          opacity: 0,
          transition: { duration: animationDuration * 0.5 },
        })

        if (!animationState.current.isMounted) return
        animationState.current.isAnimating = false
      }
    }

    animateModal()

    return () => {
      // Stop animations on unmount to prevent memory leaks
      backdropControls.stop()
      modalControls.stop()
    }
  }, [isOpen, backdropControls, modalControls, animationDuration])

  // Handle outside click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen && !animationState.current.isAnimating) return null

  return (
    <AnimatePresence>
      {(isOpen || animationState.current.isAnimating) && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={backdropControls}
          onClick={handleBackdropClick}
          role="presentation"
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby={ariaDescribedby}
            className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto ${className}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={modalControls}
            tabIndex={-1} // Make the modal focusable but not in the tab order
          >
            <div className="flex justify-between items-center border-b p-4">
              <h2 id="modal-title" className="text-xl font-semibold">
                {title}
              </h2>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
                  aria-label="Close modal"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedModal
