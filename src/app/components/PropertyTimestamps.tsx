'use client';

import { formatDate } from '@/lib/utils/formatters';

interface PropertyTimestampsProps {
  createdAt: Date;
  updatedAt: Date | null;
}

export default function PropertyTimestamps({ createdAt, updatedAt }: PropertyTimestampsProps) {
  return (
    <div className="mt-4 text-sm text-gray-500">
      <p>Listed on: {formatDate(createdAt)}</p>
      {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
        <p>Last updated: {formatDate(updatedAt)}</p>
      )}
    </div>
  );
}