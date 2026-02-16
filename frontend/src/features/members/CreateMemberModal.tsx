import { useState } from 'react';
import { Alert, Button, Input, Modal } from '@/components/ui';
import { useCreateMember } from './useCreateMember';

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMemberModal({ isOpen, onClose, onSuccess }: CreateMemberModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { createMember, loading, error, fieldErrors, reset } = useCreateMember();

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createMember({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });

    if (result) {
      handleClose();
      onSuccess();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Member">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && !Object.keys(fieldErrors).length && (
          <Alert variant="error">{error}</Alert>
        )}

        <Input
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={fieldErrors.firstName}
          required
        />

        <Input
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={fieldErrors.lastName}
          required
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />

        <Input
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldErrors.phone}
        />

        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Create Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
