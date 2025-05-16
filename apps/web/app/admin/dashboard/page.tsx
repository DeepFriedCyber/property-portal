'use client';

import { useState, useEffect } from 'react';

import { Button } from '../../../src/ui';

interface UploadRecord {
  id: string;
  uploaderId: string;
  uploaderName: string; // Added for display purposes
  filename: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  propertyCount: number; // Added to show how many properties in this upload
}

export default function AdminDashboard() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingUploads: 0,
    approvedUploads: 0,
    rejectedUploads: 0,
  });

  useEffect(() => {
    // Fetch uploads data
    const fetchUploads = async () => {
      try {
        setLoading(true);
        // This would be replaced with an actual API call
        const response = await fetch('/api/admin/uploads');

        if (!response.ok) {
          throw new Error('Failed to fetch uploads');
        }

        const data = await response.json();
        setUploads(data.uploads);
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching uploads:', err);
        setError('Failed to load uploads. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  const handleApprove = async (uploadId: string) => {
    try {
      const response = await fetch(`/api/admin/uploads/${uploadId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to approve upload');
      }

      // Update local state to reflect the change
      setUploads(
        uploads.map((upload) =>
          upload.id === uploadId ? { ...upload, status: 'approved' as const } : upload
        )
      );

      // Update stats
      setStats({
        ...stats,
        pendingUploads: stats.pendingUploads - 1,
        approvedUploads: stats.approvedUploads + 1,
      });
    } catch (err) {
      console.error('Error approving upload:', err);
      setError('Failed to approve upload. Please try again.');
    }
  };

  const handleReject = async (uploadId: string) => {
    try {
      const response = await fetch(`/api/admin/uploads/${uploadId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reject upload');
      }

      // Update local state to reflect the change
      setUploads(
        uploads.map((upload) =>
          upload.id === uploadId ? { ...upload, status: 'rejected' as const } : upload
        )
      );

      // Update stats
      setStats({
        ...stats,
        pendingUploads: stats.pendingUploads - 1,
        rejectedUploads: stats.rejectedUploads + 1,
      });
    } catch (err) {
      console.error('Error rejecting upload:', err);
      setError('Failed to reject upload. Please try again.');
    }
  };

  const viewUploadDetails = (uploadId: string) => {
    // Navigate to upload details page
    window.location.href = `/admin/uploads/${uploadId}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Properties</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalProperties}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-gray-700">Pending Uploads</h3>
          <p className="text-3xl font-bold text-yellow-500">{stats.pendingUploads}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-gray-700">Approved Uploads</h3>
          <p className="text-3xl font-bold text-green-500">{stats.approvedUploads}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-gray-700">Rejected Uploads</h3>
          <p className="text-3xl font-bold text-red-500">{stats.rejectedUploads}</p>
        </div>
      </div>

      {/* Uploads Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">Recent Uploads</h2>

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
          <div className="p-4 text-gray-600">No uploads found.</div>
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
                    Uploaded By
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
                      <div className="text-sm font-medium text-gray-900">{upload.filename}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{upload.uploaderName}</div>
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
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          upload.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : upload.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => viewUploadDetails(upload.id)}
                        className="mr-2"
                      >
                        View
                      </Button>

                      {upload.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleApprove(upload.id)}
                            className="mr-2"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="small"
                            onClick={() => handleReject(upload.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
