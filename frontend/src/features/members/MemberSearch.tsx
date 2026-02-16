import { useState } from 'react';
import { Input } from '@/components/ui';

interface MemberSearchProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function MemberSearch({ onSearch, initialValue = '' }: MemberSearchProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="w-64">
        <Input
          type="search"
          placeholder="Search by name or email..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </form>
  );
}
