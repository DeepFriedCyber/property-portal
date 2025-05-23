'use client'

import React from 'react'

/**
 * Simple form example for testing tab navigation
 */
export default function FormPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Form submitted!')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Simple Form Example</h1>
        <p className="text-gray-600">This form is used for testing tab navigation in Cypress.</p>
      </div>

      <div className="p-6 bg-gray-100 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1 font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-2 border rounded"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2 border rounded"
              placeholder="Enter email"
            />
          </div>

          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
