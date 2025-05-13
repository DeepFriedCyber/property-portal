'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from 'ui';

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  const handleEditProfile = () => {
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await user.update({
        firstName,
        lastName,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="bg-white rounded shadow p-6">
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
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <Button variant="primary" onClick={handleSaveProfile}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={handleCancelEdit}>
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
}