'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../src/ui';
import UploadZone from '@components/common/UploadZone';
import { useUser } from '@clerk/nextjs';

interface UploadRecord {
  id: string;
  filename: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  propertyCount: number;
}

interface Property {
  id: string;
  uploadId: string;
  address: string;
  price: number;
  bedrooms?: number;
  type?: string;
  dateSold?: Date;
}

export default function AgentDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    isUploading: boolean;
    success: boolean | null;
    message: string | null;
  }>({
    isUploading: false,
    success: null,
    message: null,
  });

  useEffect(() => {
    // Fetch agent's uploads and properties
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        // This would be replaced with actual API calls
        const uploadsResponse = await fetch('/api/agent/uploads');
        const propertiesResponse = await fetch('/api/agent/properties');
        
        if (!uploadsResponse.ok || !propertiesResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const uploadsData = await uploadsResponse.json();
        const propertiesData = await propertiesResponse.json();
        
        setUploads(uploadsData.uploads);
        setProperties(propertiesData.properties);
      } catch (err) {
        console.error('Error fetching agent data:', err);
        setError('Failed to load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploadStatus({
      isUploading: true,
      success: null,
      message: 'Uploading file...',
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/agent/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      
      // Add the new upload to the list
      setUploads([data.upload, ...uploads]);
      
      setUploadStatus({
        isUploading: false,
        success: true,
        message: `Successfully uploaded ${file.name}`,
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setUploadStatus(prev => ({
          ...prev,
          success: null,
          message: null,
        }));
      }, 5000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadStatus({
        isUploading: false,
        success: false,
        message: err.message || 'Failed to upload file. Please try again.',
      });
    }
  };

  const viewUploadDetails = (uploadId: string) => {
    // Navigate to upload details page
    window.location.href = `/agent/uploads/${uploadId}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        {isLoaded && isSignedIn && (
          <div className="flex items-center">
            <div className="mr-4">
              <p className="text-sm text-gray-600">Welcome,</p>
              <p className="font-medium">{user.firstName || user.emailAddresses[0].emailAddress}</p>
            </div>
            <Button 
              variant="secondary"
              size="small"
              onClick={() => window.location.href = "/sign-out"}
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
      
      {/* Upload Section */}
      <div className="bg-white rounded shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Properties</h2>
        <p className="text-gray-600 mb-4">
          Upload a CSV file containing property details. The file should include columns for address, price, bedrooms, type, etc.
        </p>
        
        <UploadZone onUpload={handleFileUpload} />
        
        {uploadStatus.isUploading && (
          <div className="mt-4 flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span>{uploadStatus.message}</span>
          </div>
        )}
        
        {uploadStatus.success === true && (
          <div className="mt-4 text-green-600">
            {uploadStatus.message}
          </div>
        )}
        
        {uploadStatus.success === false && (
          <div className="mt-4 text-red-600">
            {uploadStatus.message}
          </div>
        )}
      </div>
      
      {/* Uploads Table */}
      <div className="bg-white rounded shadow overflow-hidden mb-8">
        <h2 className="text-xl font-semibold p-4 border-b">Your Uploads</h2>
        
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 text-red-600" role="alert">
            {error}
          </div>
        )}
        
        {!loading && !error && uploads.length === 0 && (
          <div className="p-4 text-gray-600">
            You haven't uploaded any property files yet.
          </div>
        )}
        
        {!loading && !error && uploads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploads.map((upload) => (
                  <tr key={upload.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {upload.filename}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{upload.propertyCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${upload.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          upload.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button 
                        variant="secondary"
                        size="small"
                        onClick={() => viewUploadDetails(upload.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Properties Preview */}
      <div className="bg-white rounded shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">Your Properties</h2>
        
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 text-red-600" role="alert">
            {error}
          </div>
        )}
        
        {!loading && !error && properties.length === 0 && (
          <div className="p-4 text-gray-600">
            You don't have any properties yet. Upload a CSV file to add properties.
          </div>
        )}
        
        {!loading && !error && properties.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bedrooms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.slice(0, 5).map((property) => (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {property.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        £{property.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.bedrooms || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.type || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button 
                        variant="secondary"
                        size="small"
                        onClick={() => window.location.href = `/agent/properties/${property.id}`}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {properties.length > 5 && (
              <div className="p-4 text-center">
                <Button 
                  variant="secondary"
                  onClick={() => window.location.href = '/agent/properties'}
                >
                  View All Properties ({properties.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}