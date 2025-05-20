'use client'

// External imports
import { FormEvent, useRef, useState } from 'react'

interface UploadResponse {
  message: string
  uploadId: string
  propertyCount: number
  invalidCount?: number
  invalidRows?: { row: number; errors: string[] }[]
}

interface UploadError {
  error: string
  message: string
  details?: string
}

export default function PropertyUploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [response, setResponse] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<UploadError | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!fileInputRef.current?.files?.length) {
      setError({
        error: 'No File',
        message: 'Please select a CSV file to upload',
      })
      return
    }

    const file = fileInputRef.current.files[0]

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError({
        error: 'Invalid File',
        message: 'Please upload a CSV file',
      })
      return
    }

    setIsUploading(true)
    setError(null)
    setResponse(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/agent/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data as UploadError)
      } else {
        setResponse(data as UploadResponse)
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (err) {
      setError({
        error: 'Upload Failed',
        message: 'Failed to upload file',
        details: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Upload Properties</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            CSV File
          </label>
          <input
            type="file"
            id="file"
            ref={fileInputRef}
            accept=".csv"
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            Upload a CSV file with property data.{' '}
            <a href="/sample-properties.csv" download className="text-blue-600 hover:underline">
              Download sample CSV
            </a>
          </p>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isUploading ? 'Uploading...' : 'Upload Properties'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-medium text-red-800">{error.error}</h3>
          <p className="mt-1 text-sm text-red-700">{error.message}</p>
          {error.details && <p className="mt-1 text-xs text-red-600">{error.details}</p>}
        </div>
      )}

      {response && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-sm font-medium text-green-800">Upload Successful</h3>
          <p className="mt-1 text-sm text-green-700">{response.message}</p>
          <div className="mt-2 text-xs text-green-600">
            <p>Upload ID: {response.uploadId}</p>
            <p>Properties processed: {response.propertyCount}</p>
            {response.invalidCount ? <p>Invalid rows: {response.invalidCount}</p> : null}
          </div>

          {response.invalidRows && response.invalidRows.length > 0 && (
            <div className="mt-2">
              <h4 className="text-xs font-medium text-red-800">Invalid Rows:</h4>
              <ul className="mt-1 text-xs text-red-600 list-disc list-inside">
                {response.invalidRows.map((row, index) => (
                  <li key={index}>
                    Row {row.row}: {row.errors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
