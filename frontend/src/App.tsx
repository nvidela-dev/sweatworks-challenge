import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MemberProfilePage, MembersPage } from '@/features/members';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/members" replace />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/members/:id" element={<MemberProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
