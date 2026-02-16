import { Alert, Button, Modal } from '@/components/ui';
import { useCancelMembership } from './useCancelMembership';

interface CancelMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  membershipId: string;
  memberName: string;
  planName: string;
}

export function CancelMembershipModal({
  isOpen,
  onClose,
  onSuccess,
  membershipId,
  memberName,
  planName,
}: CancelMembershipModalProps) {
  const { cancelMembership, loading, error, reset } = useCancelMembership();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    const result = await cancelMembership(membershipId);

    if (result) {
      handleClose();
      onSuccess();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cancel Membership">
      <div className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}

        <p className="text-gray-600">
          Are you sure you want to cancel the <span className="font-medium">{planName}</span> membership
          for <span className="font-medium">{memberName}</span>?
        </p>

        <p className="text-sm text-gray-500">
          This action cannot be undone. The membership will be marked as cancelled immediately.
        </p>

        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Keep Membership
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} isLoading={loading}>
            Cancel Membership
          </Button>
        </div>
      </div>
    </Modal>
  );
}
