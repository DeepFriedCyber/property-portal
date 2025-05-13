// @ts-nocheck
import { useState, useEffect } from 'react';
import { Button } from '@your-org/ui';
import Link from 'next/link';

interface UploadRecord {
  id: string;
  filename: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  propertyCount: number;
  agentName: string;
  agentId: string;
}

export default function AdminDashboard() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    // Fetch all uploads for admin review
    const fetchUploads = async () => {
      try {
        setLoading(true);
        // This would be replaced with actual API call
        const response = await fetch('/api/admin/uploads');
        
        if (!response.ok) {
          throw new Error('Failed to fetch uploads');
        }
        
        const data = await response.json();
        setUploads(data.uploads);
      } catch (err) {
        console.error('Error fetching uploads:', err);
        setError('Failed to load uploads. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  const handleStatusChange = async (uploadId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      const response = await fetch(`/api/admin/uploads/${uploadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status to ${newStatus}`);
      }

      // Update local state
      setUploads(uploads.map(upload => 
        upload.id === uploadId ? { ...upload, status: newStatus } : upload
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const filteredUploads = statusFilter === 'all' 
    ? uploads 
    : uploads.filter(upload => upload.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white rounded shadow overflow-hidden mb-8">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Property Uploads</h2>
          
          <div className="flex space-x-2">
            <select 
              className="border rounded px-3 py-1 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            >
              <option value="all">All Uploads</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
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
        
        {!loading && !error && filteredUploads.length === 0 && (
          <div className="p-4 text-gray-600">
            No uploads found matching the selected filter.
          </div>
        )}
        
        {!loading && !error && filteredUploads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
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
                {filteredUploads.map((upload) => (
                  <tr key={upload.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {upload.filename}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {upload.agentName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {upload.agentId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(upload.createdAt).toLocaleTimeString()}
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
                      <div className="flex space-x-2">
                        <Link href={`/admin/uploads/${upload.id}`} passHref>
                          <Button 
                            variant="secondary"
                            size="small"
                          >
                            View
                          </Button>
                        </Link>
                        
                        {upload.status === 'pending' && (
                          <>
                            <Button 
                              variant="primary"
                              size="small"
                              onClick={() => handleStatusChange(upload.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="destructive"
                              size="small"
                              onClick={() => handleStatusChange(upload.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {upload.status !== 'pending' && (
                          <Button 
                            variant="secondary"
                            size="small"
                            onClick={() => handleStatusChange(upload.id, 'pending')}
                          >
                            Reset to Pending
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="text-purple-800 text-sm font-medium mb-1">Total Uploads</div>
            <div className="text-2xl font-bold">{uploads.length}</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <div className="text-yellow-800 text-sm font-medium mb-1">Pending Review</div>
            <div className="text-2xl font-bold">
              {uploads.filter(u => u.status === 'pending').length}
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="text-green-800 text-sm font-medium mb-1">Approved Uploads</div>
            <div className="text-2xl font-bold">
              {uploads.filter(u => u.status === 'approved').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}