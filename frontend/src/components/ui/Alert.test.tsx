import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('applies info variant by default', () => {
    render(<Alert>Info</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-blue-50', 'text-blue-800');
  });

  it('applies success variant styles', () => {
    render(<Alert variant="success">Success</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-green-50', 'text-green-800');
  });

  it('applies warning variant styles', () => {
    render(<Alert variant="warning">Warning</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-yellow-50', 'text-yellow-800');
  });

  it('applies error variant styles', () => {
    render(<Alert variant="error">Error</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50', 'text-red-800');
  });

  it('has alert role for accessibility', () => {
    render(<Alert>Accessible</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
