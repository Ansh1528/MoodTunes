import { useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Journal from './Journal';
import History from '../components/History';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to journal page by default if we're at the dashboard root
    if (location.pathname === '/dashboard') {
      navigate('/dashboard/new-journal');
    }
  }, [location, navigate]);

  return (
    <DashboardLayout>
      <Routes>
        <Route path="new-journal" element={<Journal />} />
        <Route path="history" element={<History />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;