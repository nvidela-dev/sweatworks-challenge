import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

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
      <div className="app">
        <header className="app-header">
          <h1>Sweatworks Fitness</h1>
        </header>
        <main className="app-main">
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
