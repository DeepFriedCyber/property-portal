'use client'

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react'

import { Button } from '../../src/ui'

interface FileValidationResult {
  valid: boolean
  message: string
}

interface UploadZoneProps {
  onUpload: (file: File) => void
  acceptedFileTypes?: string | string[]
  maxSizeInMB?: number
  multiple?: boolean
  disabled?: boolean
  showPreview?: boolean
  customValidator?: (file: File) => Promise<FileValidationResult> | FileValidationResult
  className?: string
  description?: string
}

export default function UploadZone({
  onUpload,
  acceptedFileTypes = '.csv',
  maxSizeInMB = 10,
  multiple = false,
  disabled = false,
  showPreview = false,
  customValidator,
  className = '',
  description,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Convert acceptedFileTypes to array for easier handling
  const acceptedTypesArray = Array.isArray(acceptedFileTypes)
    ? acceptedFileTypes
    : [acceptedFileTypes]

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Handle drag events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const validateFileType = (file: File): boolean => {
    // If no specific types are required, accept all
    if (acceptedTypesArray.length === 0 || acceptedTypesArray[0] === '*') {
      return true
    }

    // Check if file extension or MIME type matches any accepted type
    return acceptedTypesArray.some(type => {
      // Check by extension (e.g., .csv)
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      // Check by MIME type (e.g., text/csv)
      return file.type === type
    })
  }

  const validateFileSize = (file: File): boolean => {
    const fileSizeInMB = file.size / (1024 * 1024)
    return fileSizeInMB <= maxSizeInMB
  }

  const processFile = async (file: File) => {
    setValidationError(null)

    // Validate file type
    if (!validateFileType(file)) {
      setValidationError(
        `Invalid file type. Please upload ${acceptedTypesArray.join(' or ')} files.`
      )
      return
    }

    // Validate file size
    if (!validateFileSize(file)) {
      setValidationError(`File is too large. Maximum size is ${maxSizeInMB}MB.`)
      return
    }

    // Run custom validator if provided
    if (customValidator) {
      try {
        const result = await Promise.resolve(customValidator(file))
        if (!result.valid) {
          setValidationError(result.message)
          return
        }
      } catch (err) {
        setValidationError('File validation failed.')
        return
      }
    }

    // Create preview for image files
    if (showPreview && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }

    setSelectedFile(file)
    onUpload(file)
  }

  const handleButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }



  return (
    <div className={`${className}`}>
      <div
        ref={dropZoneRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            handleButtonClick()
          }
        }}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
            : isDragging
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={
            Array.isArray(acceptedFileTypes) ? acceptedFileTypes.join(',') : acceptedFileTypes
          }
          multiple={multiple}
          disabled={disabled}
          className="hidden"
        />

        {/* Preview area */}
        {showPreview && previewUrl && (
          <div className="mb-4">
            <img
              src={previewUrl}
              alt="File preview"
              className="max-h-40 max-w-full mx-auto rounded"
            />
          </div>
        )}

        <div className="flex flex-col items-center justify-center">
          {!selectedFile ? (
            <>
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-gray-700">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {Array.isArray(acceptedFileTypes)
                  ? acceptedFileTypes.join(', ')
                  : acceptedFileTypes}{' '}
                files up to {maxSizeInMB}MB
              </p>
              {description && <p className="mt-2 text-xs text-gray-500">{description}</p>}
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-2">
                <svg
                  className="w-8 h-8 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  if (fileInputRef.current) {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    fileInputRef.current.value = ''
                  }
                }}
                disabled={disabled}
              >
                Choose Different File
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {validationError && <div className="mt-2 text-sm text-red-600">{validationError}</div>}
    </div>
  )
}
