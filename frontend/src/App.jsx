import { Routes, Route, useParams } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import CreateSubject from './pages/CreateSubject';
import MainLayout from './layout/MainLayout';
import LandingPage from './pages/LandingPage';

import SubjectDetail from './pages/SubjectDetail';

function App() {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route path="/" element={
        <MainLayout>
          <LandingPage />
        </MainLayout>
      } />

      {/* Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        {/* Nested Routes inside Dashboard's <Outlet /> */}
        <Route index element={<Subjects />} />
        <Route path="create-subject" element={<CreateSubject />} />
        <Route path="subject/:subjectId" element={<SubjectDetail />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
