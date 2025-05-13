import React from 'react';
import { Button } from 'ui';

export interface CallToActionProps {
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

export default function CallToAction({
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick
}: CallToActionProps) {
  return (
    <section className="bg-purple-50 py-16 px-6 text-center">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4">{title}</h2>
      <p className="mb-6 text-gray-700 max-w-2xl mx-auto">
        {description}
      </p>
      <div className="space-x-4">
        <Button variant="primary" onClick={onPrimaryClick}>{primaryButtonText}</Button>
        <Button variant="secondary" onClick={onSecondaryClick}>{secondaryButtonText}</Button>
      </div>
    </section>
  );
}