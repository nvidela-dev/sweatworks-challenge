import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder pages - will be replaced in FE-004
function MembersPage() {
  return (
    <div>
      <h1>Members</h1>
      <p>Member list will be implemented in FE-004</p>
    </div>
  );
}

function MemberProfilePage() {
  return (
    <div>
      <h1>Member Profile</h1>
      <p>Member profile will be implemented in FE-004</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-900 text-white px-8 py-4">
          <h1 className="m-0 text-2xl">Sweatworks Fitness</h1>
        </header>
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/members" replace />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/members/:id" element={<MemberProfilePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
