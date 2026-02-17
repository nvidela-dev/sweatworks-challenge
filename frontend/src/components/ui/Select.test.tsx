import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';

const options = [
  { value: 'basic', label: 'Basic Plan' },
  { value: 'premium', label: 'Premium Plan' },
  { value: 'vip', label: 'VIP Plan' },
];

describe('Select', () => {
  it('renders select element with options', () => {
    render(<Select options={options} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Basic Plan' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Premium Plan' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'VIP Plan' })).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Select label="Plan" options={options} />);
    expect(screen.getByLabelText('Plan')).toBeInTheDocument();
  });

  it('generates id from label', () => {
    render(<Select label="Select Plan" options={options} />);
    const select = screen.getByLabelText('Select Plan');
    expect(select).toHaveAttribute('id', 'select-plan');
  });

  it('uses custom id when provided', () => {
    render(<Select label="Plan" id="custom-id" options={options} />);
    const select = screen.getByLabelText('Plan');
    expect(select).toHaveAttribute('id', 'custom-id');
  });

  it('renders placeholder when provided', () => {
    render(<Select options={options} placeholder="Choose a plan" defaultValue="" />);
    expect(screen.getByRole('option', { name: 'Choose a plan' })).toBeInTheDocument();
  });

  it('placeholder is disabled', () => {
    render(<Select options={options} placeholder="Choose a plan" defaultValue="" />);
    const placeholder = screen.getByRole('option', { name: 'Choose a plan' });
    expect(placeholder).toBeDisabled();
  });

  it('displays error message', () => {
    render(<Select options={options} error="Please select a plan" />);
    expect(screen.getByText('Please select a plan')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Select options={options} error="Error" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
  });

  it('handles selection changes', async () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'premium');

    expect(handleChange).toHaveBeenCalled();
    expect(select).toHaveValue('premium');
  });

  it('can be disabled', () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Select options={options} className="custom-class" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });
});
