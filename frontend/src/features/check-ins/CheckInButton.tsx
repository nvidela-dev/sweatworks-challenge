import { useEffect, useRef, useState } from 'react';
import { Alert, Button } from '@/components/ui';
import { useCheckIn } from './useCheckIn';

interface CheckInButtonProps {
  memberId: string;
  onSuccess: () => void;
  disabled?: boolean;
}

export function CheckInButton({ memberId, onSuccess, disabled }: CheckInButtonProps) {
  const { checkIn, loading, error, reset } = useCheckIn();
  const [showSuccess, setShowSuccess] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCheckIn = async () => {
    reset();
    setShowSuccess(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const result = await checkIn(memberId);

    if (result) {
      setShowSuccess(true);
      onSuccess();
      timeoutRef.current = setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleCheckIn}
        isLoading={loading}
        disabled={disabled}
        size="lg"
        className="w-full"
      >
        Check In Now
      </Button>
      {error && <Alert variant="error">{error}</Alert>}
      {showSuccess && <Alert variant="success">Check-in recorded successfully!</Alert>}
    </div>
  );
}
