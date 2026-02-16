import { useState } from 'react';
import { Alert, Button, Input, Modal } from '@/components/ui';
import { PlanSelector } from './PlanSelector';
import { useAssignMembership } from './useAssignMembership';

interface AssignMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberId: string;
  memberName: string;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function AssignMembershipModal({
  isOpen,
  onClose,
  onSuccess,
  memberId,
  memberName,
}: AssignMembershipModalProps) {
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState(formatDateForInput(new Date()));

  const { assignMembership, loading, error, reset } = useAssignMembership();

  const handleClose = () => {
    setPlanId('');
    setStartDate(formatDateForInput(new Date()));
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!planId) {
      return;
    }

    const result = await assignMembership({
      memberId,
      planId,
      startDate,
    });

    if (result) {
      handleClose();
      onSuccess();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Membership">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Assign a membership plan to <span className="font-medium">{memberName}</span>.
        </p>

        {error && <Alert variant="error">{error}</Alert>}

        <PlanSelector
          value={planId}
          onChange={setPlanId}
          disabled={loading}
        />

        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={loading}
          required
        />

        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} disabled={!planId}>
            Assign Membership
          </Button>
        </div>
      </form>
    </Modal>
  );
}
