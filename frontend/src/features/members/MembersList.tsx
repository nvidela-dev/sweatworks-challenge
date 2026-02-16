import { useNavigate } from 'react-router-dom';
import { Table } from '@/components/ui';
import type { Member } from '@/types';

interface MembersListProps {
  members: Member[];
}

export function MembersList({ members }: MembersListProps) {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (member: Member) => (
        <span className="font-medium text-gray-900">
          {member.firstName} {member.lastName}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (member: Member) => member.phone || '—',
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (member: Member) => new Date(member.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Table
      columns={columns}
      data={members}
      keyExtractor={(member) => member.id}
      onRowClick={(member) => navigate(`/members/${member.id}`)}
      emptyMessage="No members found"
    />
  );
}
