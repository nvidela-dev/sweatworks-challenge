import { useParams } from 'react-router-dom';
import { AppLayout, PageHeader } from '@/components/layout';
import { Alert, Badge, LoadingSpinner } from '@/components/ui';
import { useMemberProfile } from './useMemberProfile';

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { profile, loading, error } = useMemberProfile(id || '');

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout>
        <Alert variant="error">{error || 'Member not found'}</Alert>
      </AppLayout>
    );
  }

  const { member, activeMembership, lastCheckIn, checkInsLast30Days } = profile;

  return (
    <AppLayout>
      <PageHeader
        title={`${member.firstName} ${member.lastName}`}
        subtitle={member.email}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-gray-900">{member.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-gray-900">{member.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Member Since</dt>
              <dd className="text-gray-900">
                {new Date(member.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Membership Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Membership</h2>
          {activeMembership ? (
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Plan</dt>
                <dd className="text-gray-900 font-medium">{activeMembership.plan.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <Badge variant="success">{activeMembership.status}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Start Date</dt>
                <dd className="text-gray-900">
                  {new Date(activeMembership.startDate).toLocaleDateString()}
                </dd>
              </div>
              {activeMembership.endDate && (
                <div>
                  <dt className="text-sm text-gray-500">End Date</dt>
                  <dd className="text-gray-900">
                    {new Date(activeMembership.endDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-gray-500">No active membership</p>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {checkInsLast30Days}
              </div>
              <div className="text-sm text-gray-500">Check-ins (30 days)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-medium text-gray-900">
                {lastCheckIn
                  ? new Date(lastCheckIn).toLocaleString()
                  : 'Never'}
              </div>
              <div className="text-sm text-gray-500">Last Check-in</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
