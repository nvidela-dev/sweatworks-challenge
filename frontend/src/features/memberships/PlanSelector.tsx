import { Select, LoadingSpinner } from '@/components/ui';
import { usePlansList } from './usePlansList';

interface PlanSelectorProps {
  value: string;
  onChange: (planId: string) => void;
  error?: string;
  disabled?: boolean;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function PlanSelector({ value, onChange, error, disabled }: PlanSelectorProps) {
  const { plans, loading, error: fetchError } = usePlansList();

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-500">Loading plans...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-sm text-red-600">
        Failed to load plans: {fetchError}
      </div>
    );
  }

  const options = plans.map((plan) => ({
    value: plan.id,
    label: `${plan.name} - ${formatPrice(plan.priceCents)} (${plan.durationDays} days)`,
  }));

  return (
    <Select
      label="Plan"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      placeholder="Select a plan"
      error={error}
      disabled={disabled}
    />
  );
}
