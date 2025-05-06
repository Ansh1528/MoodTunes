import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPencilAlt, FaHistory, FaMusic, FaChartLine } from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  
  const sidebarLinks = [
    { to: '/dashboard/new-journal', icon: FaPencilAlt, label: 'New Journal' },
    { to: '/dashboard/favorite-songs', icon: FaMusic, label: 'Favorite Songs' },
    { to: '/dashboard/history', icon: FaHistory, label: 'Mood/Journal History' },
    { to: '/dashboard/trending', icon: FaChartLine, label: 'Trending Songs' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-black/20 backdrop-blur-sm border-r border-white/10">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-white mb-6">Dashboard</h2>
          <nav className="space-y-2">
            {sidebarLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === to
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="text-xl" />
                <span>{label}</span>
                {location.pathname === to && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;