import { motion } from 'framer-motion';
import {  FaHeadphones, FaPlay, FaRobot, FaChartLine, FaHeart,FaPen, FaChartBar, FaMusic, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Particles from '../components/Particles';
import FeatureCard from '../components/FeatureCard';
import FloatingIcons from '../components/FloatingIcons';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Particles */}
      <Particles className="absolute inset-0" />
      
      {/* Floating Musical Icons */}
      <FloatingIcons />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl font-bold text-blue-100"
            >
              Your Musical Journey Begins Here
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-100"
            >
              Transform your journal entries into personalized music recommendations based on your mood and emotions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {user ? (
                <Link
                  to="/dashboard/new-journal"
                  className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-center"
                >
                  Start Writing
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="w-full sm:w-auto px-4 py-3 rounded-lg font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 text-black text-center"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-4  py-3 text-xl rounded-lg font-bold bg-white/5 hover:bg-white/10 transition-all duration-200 text-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Express, Analyze, and Listen
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Discover how your words can transform into the perfect playlist
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={FaPen}
              title="Journal Your Feelings"
              description="Write freely about your day, emotions, and experiences in a safe, private space."
              delay={0.4}
            />
            <FeatureCard
              icon={FaChartBar}
              title="Mood Analysis"
              description="Our AI analyzes your entries to understand your emotional state and energy levels."
              delay={0.5}
            />
            <FeatureCard
              icon={FaMusic}
              title="Music Recommendations"
              description="Get personalized song suggestions that match your current mood and help you feel better."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 sm:p-12 border border-white/10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Start Your Musical Journey?
            </h2>
            <p className="text-gray-300 mb-8">
              Join thousands of users who have discovered the perfect soundtrack for their emotions.
            </p>
            {user ? (
              <Link
                to="/dashboard/new-journal"
                className="inline-block px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                Write Your First Entry
              </Link>
            ) : (
              <Link
                to="/signup"
                className="inline-block px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                Create Free Account
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Privacy Note */}
      <section className="relative py-12 px-4 sm:px-6 bg-black/40">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white"
          >
            <FaLock className="text-xl" />
            <p className="text-m">
              Your privacy is our priority. All journal entries are encrypted and securely stored.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;