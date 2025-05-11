
import React, { useEffect, useState } from 'react';

interface FlaggedProperty {
  id: number;
  reason: string;
  raw_data: any;
}

export default function FlaggedProperties() {
  const [data, setData] = useState<FlaggedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/flagged')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to load flagged properties'))
      .then(setData)
      .catch(err => {
        console.error(err);
        setError(err.toString());
      })
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id: number) => {
    try {
      await fetch(`/api/admin/flagged/${id}/approve`, { method: 'POST' });
      setData(data.filter(row => row.id !== id));
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const discard = async (id: number) => {
    try {
      await fetch(`/api/admin/flagged/${id}/delete`, { method: 'DELETE' });
      setData(data.filter(row => row.id !== id));
    } catch (err) {
      console.error("Discard failed:", err);
    }
  };

  if (loading) return <p>Loading flagged properties...</p>;
  if (error) return <p>Error loading data: {error}</p>;

  return (
    <div>
      <h1>Flagged Properties</h1>
      {data.length === 0 ? (
        <p>No flagged properties to review 🎉</p>
      ) : (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>ID</th><th>Reason</th><th>Raw Data</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.reason}</td>
                <td><pre>{JSON.stringify(row.raw_data, null, 2)}</pre></td>
                <td>
                  <button onClick={() => approve(row.id)}>✅ Approve</button>
                  <button onClick={() => discard(row.id)}>🗑️ Discard</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
