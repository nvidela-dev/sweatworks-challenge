import { useCallback, useState } from 'react';
import { AppLayout, PageHeader } from '@/components/layout';
import { Alert, Button, LoadingSpinner, Pagination } from '@/components/ui';
import { CreateMemberModal } from './CreateMemberModal';
import { MemberSearch } from './MemberSearch';
import { MembersList } from './MembersList';
import { useMembersList } from './useMembersList';

export function MembersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { members, meta, loading, error, refetch } = useMembersList({
    page,
    pageSize,
    search: search || undefined,
  });

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  // useCallback here completes the memo chain with MemberSearch
  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Members"
        subtitle="Manage gym members"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>Add Member</Button>
        }
      />

      <div className="mb-4">
        <MemberSearch onSearch={handleSearch} initialValue={search} />
      </div>

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <MembersList members={members} />
          {meta && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              pageSize={pageSize}
              totalCount={meta.totalCount}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              hasNext={meta.hasNext}
              hasPrev={meta.hasPrev}
            />
          )}
        </>
      )}

      <CreateMemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </AppLayout>
  );
}
