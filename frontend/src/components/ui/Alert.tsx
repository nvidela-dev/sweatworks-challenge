import type { ReactNode } from 'react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

const variantClasses = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  error: 'bg-red-50 text-red-800 border-red-200',
};

export function Alert({ variant = 'info', children }: AlertProps) {
  return (
    <div
      role="alert"
      className={`px-4 py-3 rounded-md border ${variantClasses[variant]}`}
    >
      {children}
    </div>
  );
}
