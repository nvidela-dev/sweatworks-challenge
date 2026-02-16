import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui';

const MembersPage = lazy(() => import('@/features/members/MembersPage').then(m => ({ default: m.MembersPage })));
const MemberProfilePage = lazy(() => import('@/features/members/MemberProfilePage').then(m => ({ default: m.MemberProfilePage })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/members" replace />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/:id" element={<MemberProfilePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
