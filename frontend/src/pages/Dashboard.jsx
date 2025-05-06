import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Journal from './Journal';
import FavoriteSongs from '../components/FavoriteSongs';
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

  // Render different content based on the current route
  const renderContent = () => {
    switch (location.pathname) {
      case '/dashboard/new-journal':
        return <Journal />;
      case '/dashboard/favorite-songs':
        return <FavoriteSongs />;
      case '/dashboard/history':
        return <History />;
      case '/dashboard/trending':
        return <h1 className="text-2xl font-bold text-white">Trending Songs</h1>;
      default:
        return null;
    }
  };

  return (

    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;