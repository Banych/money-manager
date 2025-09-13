'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-4 h-12 w-12 text-gray-400">{icon}</div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mb-4 text-gray-500">{description}</p>
      {action}
    </div>
  );
}
