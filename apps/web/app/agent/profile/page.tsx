'use client';

import { useState } from 'react';

import { Button } from '../../../src/ui';

import { useAuthentication, AuthRequired } from '@/lib/auth/clerk-wrapper';

// Profile editor component
const ProfileEditor = () => {
  const { user } = useAuthentication();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset success/error messages when editing state changes
  const handleEditProfile = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  // Save profile with error handling and retry logic
  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await user.update({
        firstName,
        lastName,
      });

      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retry profile update
  const handleRetry = () => {
    handleSaveProfile();
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="bg-white rounded shadow p-6">
        {/* Show success message if present */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Show error message if present */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={handleRetry}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <Button variant="primary" onClick={handleSaveProfile} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="secondary" onClick={handleCancelEdit} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl mr-4">
                {user.firstName?.[0] || user.emailAddresses[0].emailAddress[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">{user.emailAddresses[0].emailAddress}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{user.emailAddresses[0].emailAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="secondary" onClick={handleEditProfile}>
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main profile page with authentication required
export default function ProfilePage() {
  return (
    <AuthRequired
      requiredRoles={['agent', 'admin']}
      fallback={
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">Agent Access Required</h2>
            <p className="text-yellow-600 mb-4">
              You need to be registered as an agent to access this page.
            </p>
            <a
              href="/"
              className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Go to Home
            </a>
          </div>
        </div>
      }
    >
      <ProfileEditor />
    </AuthRequired>
  );
}
