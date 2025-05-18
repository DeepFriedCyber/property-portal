// AccessibleModal.tsx
import React, { useEffect, useRef } from 'react'

interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  ariaDescribedby?: string
  className?: string
  showCloseButton?: boolean
  closeOnEsc?: boolean
  closeOnOutsideClick?: boolean
}

const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  ariaDescribedby,
  className = '',
  showCloseButton = true,
  closeOnEsc = true,
  closeOnOutsideClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Store the element that had focus before opening the modal
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
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
      if (modalRef.current) {
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
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)

    // Set initial focus after a short delay to ensure the modal is fully rendered
    setTimeout(setInitialFocus, 50)

    // Prevent scrolling of the body when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Restore body scrolling when modal closes
      document.body.style.overflow = ''

      // Restore focus to the element that had focus before the modal was opened
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, onClose, closeOnEsc])

  // Handle outside click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="presentation">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={ariaDescribedby}
        className={`modal ${className}`}
        tabIndex={-1} // Make the modal focusable but not in the tab order
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="modal-close-button"
              aria-label="Close modal"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          )}
        </div>

        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}

export default AccessibleModal
