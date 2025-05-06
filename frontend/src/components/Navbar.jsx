import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaKeyboard, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { logout } from '../services/auth';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard', protected: true },
    { to: '/about', label: 'About' },
  ];

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <>
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10 relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-semibold text-white"
            >
              <FaMusic className="text-blue-400" />
              <span>MoodTunes</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center gap-6">
              {navLinks.map(({ to, label, protected: isProtected }) => (
                (!isProtected || user) && (
                  <Link
                    key={to}
                    to={to}
                    className={`relative px-3 py-2 rounded-lg text-sm transition-all ${
                      location.pathname === to
                        ? 'text-white bg-white/10 font-medium'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <motion.span
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 1 }}
                    >
                      {label}
                    </motion.span>
                    {location.pathname === to && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                        layoutId="navbar-indicator"
                      />
                    )}
                  </Link>
                )
              ))}
            </div>

            {/* Desktop Auth Links and Keyboard Shortcuts */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setShowDropdown(!showDropdown)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white hover:bg-white/5"
                  >
                    <FaUserCircle className="text-xl" />
                    <span>{user.username}</span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 py-2 bg-gray-900 rounded-lg shadow-xl border border-white/10 z-50"
                      >
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 text-left transition-colors"
                        >
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <motion.span
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 1 }}
                    >
                      Login
                    </motion.span>
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    <motion.span
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 1 }}
                    >
                      Sign Up
                    </motion.span>
                  </Link>
                </div>
              )}

              <motion.button
                onClick={() => setShowShortcuts(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Keyboard Shortcuts (Press ?)"
              >
                <FaKeyboard className="text-xl" />
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 border-t border-white/10"
              >
                <div className="flex flex-col gap-2">
                  {navLinks.map(({ to, label, protected: isProtected }) => (
                    (!isProtected || user) && (
                      <Link
                        key={to}
                        to={to}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          location.pathname === to
                            ? 'text-white bg-white/10 font-medium'
                            : 'text-gray-300'
                        }`}
                      >
                        {label}
                      </Link>
                    )
                  ))}
                  
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-left text-sm text-gray-300"
                    >
                      Sign out ({user.username})
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="px-4 py-2 text-sm text-gray-300"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="px-4 py-2 text-sm text-gray-300 bg-white/10 rounded-lg"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <KeyboardShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Click outside dropdown handler */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
}

export default Navbar;


