import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPencilAlt, FaHistory, FaMusic } from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  
  const sidebarLinks = [
    { to: '/dashboard/new-journal', icon: FaPencilAlt, label: 'New Journal' },
    { to: '/dashboard/history', icon: FaHistory, label: 'Mood/Journal History' },
    { to: '/dashboard/music-feedback', icon: FaMusic, label: 'Music Feedback History' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex">
      {/* Sidebar */}
      <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-black/20 backdrop-blur-sm border-r border-white/10 overflow-y-auto">
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
      <div className="flex-1 ml-64">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;