import { motion } from 'framer-motion';
import { FaCalendar, FaChartLine, FaClock } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getMoodColor = (confidence) => {
  if (confidence >= 0.7) return 'bg-green-500/20 text-green-300';
  if (confidence >= 0.4) return 'bg-blue-500/20 text-blue-300';
  return 'bg-purple-500/20 text-purple-300';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const History = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          navigate('/login');
          return;
        }

        console.log('Fetching journal entries...');
        const response = await axios.get(`${BACKEND_URL}/api/journal`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Journal entries response:', {
          status: response.status,
          data: response.data,
          headers: response.headers
        });

        if (response.data?.success && Array.isArray(response.data.entries)) {
          console.log(`Retrieved ${response.data.entries.length} entries`);
          setEntries(response.data.entries);
          setError('');
        } else {
          console.error('Invalid response format:', response.data);
          throw new Error(response.data?.error || 'Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching entries:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          stack: err.stack
        });

        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login');
        } else if (err.response?.status === 500) {
          const errorMessage = err.response.data?.details || err.response.data?.error || 'Internal server error occurred';
          setError(`Server error: ${errorMessage}`);
        } else {
          const errorMessage = err.response?.data?.error || err.message;
          const errorDetails = err.response?.data?.details;
          setError(
            errorDetails 
              ? `${errorMessage} (${errorDetails})`
              : errorMessage || 'Failed to fetch journal entries. Please try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEntries();
    } else {
      setError('Please log in to view your journal entries.');
      navigate('/login');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading journal entries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Mood & Journal History</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors">
            Filter
          </button>
          <button className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm transition-colors">
            Download Report
          </button>
        </div>
      </div>

      {/* Mood Overview Chart Placeholder */}
      <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Mood Overview</h2>
        <div className="h-48 flex items-center justify-center text-gray-400">
          <FaChartLine className="text-4xl" />
          <span className="ml-2">Chart coming soon...</span>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Journal Entries</h2>
        {entries.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No journal entries yet. Start writing to see your history here!
          </div>
        ) : (
          entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <FaCalendar />
                    <span className="text-sm">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock />
                    <span className="text-sm">
                      {formatTime(entry.created_at)}
                    </span>
                  </div>
                </div>
                {entry.mood && (
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${getMoodColor(entry.mood.confidence)}`}>
                      {entry.mood.primary_mood}
                    </span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-300">{entry.content}</p>

              {entry.mood && entry.mood.emotions && entry.mood.emotions.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <p className="text-sm text-gray-400 mb-2">Detected Emotions:</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.mood.emotions.map((emotion, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/5 rounded-full text-xs text-gray-300"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;