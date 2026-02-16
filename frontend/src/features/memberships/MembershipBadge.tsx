import { Badge } from '@/components/ui';
import type { MembershipStatus } from '@/types';

interface MembershipBadgeProps {
  status: MembershipStatus;
}

const statusVariants: Record<MembershipStatus, 'success' | 'warning' | 'error'> = {
  active: 'success',
  cancelled: 'error',
  expired: 'warning',
};

const statusLabels: Record<MembershipStatus, string> = {
  active: 'Active',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export function MembershipBadge({ status }: MembershipBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>
      {statusLabels[status]}
    </Badge>
  );
}
