import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaMusic, FaStar, FaFilter, FaDownload, FaCalendarAlt, FaPlay, FaChartLine, FaHeart } from 'react-icons/fa';
import dayjs from 'dayjs';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MusicFeedbackHistory = () => {
  const [musicFeedback, setMusicFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'recent', 'high-scores'
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          navigate('/login');
          return;
        }

        const feedbackResponse = await axios.get(`${BACKEND_URL}/api/music-feedback`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (feedbackResponse.data?.success && Array.isArray(feedbackResponse.data.feedback)) {
          // Sort feedback by date, most recent first
          const sortedFeedback = feedbackResponse.data.feedback.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          setMusicFeedback(sortedFeedback);
        }

        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login');
        } else {
          setError(err.response?.data?.error || err.message || 'Failed to fetch data.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setError('Please log in to view your feedback history.');
      navigate('/login');
    }
  }, [user, navigate]);

  const getFilteredFeedback = () => {
    switch (filter) {
      case 'recent':
        return musicFeedback.slice(0, 5); // Show only last 5 entries
      case 'high-scores':
        return musicFeedback.filter(feedback => feedback.mood_score >= 8);
      default:
        return musicFeedback;
    }
  };

  const handleDownloadReport = () => {
    // Create CSV content
    const headers = ['Date', 'Mood Score', 'Feedback'];
    const rows = musicFeedback.map(feedback => [
      dayjs(feedback.created_at).format('YYYY-MM-DD HH:mm:ss'),
      feedback.mood_score,
      feedback.feedback_text || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `music-feedback-${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
  };

  const getAverageScore = () => {
    if (!musicFeedback.length) return 0;
    const sum = musicFeedback.reduce((acc, curr) => acc + curr.mood_score, 0);
    return (sum / musicFeedback.length).toFixed(1);
  };

  const getFeedbackStats = () => {
    const total = musicFeedback.length;
    const highScores = musicFeedback.filter(f => f.mood_score >= 8).length;
    const recent = musicFeedback.slice(0, 5).length;
    return { total, highScores, recent };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white animate-pulse">Loading feedback history...</div>
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

  const filteredFeedback = getFilteredFeedback();
  const stats = getFeedbackStats();

  return (
    <div className="space-y-8 pt-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <FaMusic className="text-2xl text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Music Feedback History</h1>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setFilter(filter === 'all' ? 'recent' : filter === 'recent' ? 'high-scores' : 'all')}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <FaFilter />
              {filter === 'all' ? 'All Entries' : filter === 'recent' ? 'Recent' : 'High Scores'}
            </button>
          </div>
          <button 
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <FaDownload />
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {musicFeedback.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FaChartLine className="text-xl text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Average Score</h3>
                <p className="text-2xl font-bold text-white">{getAverageScore()}/10</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FaPlay className="text-xl text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Total Feedback</h3>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
        >
          <FaMusic className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No feedback submitted yet.</p>
          <p className="text-gray-500 mt-2">Your music feedback will appear here once you submit some.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filteredFeedback.map((feedback, index) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <FaPlay className="text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Playlist Feedback
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <FaCalendarAlt className="text-gray-400 text-sm" />
                    <p className="text-sm text-gray-400">
                      {dayjs(feedback.created_at).format('MMM D, YYYY h:mm A')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Mood Score:</span>
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    {[...Array(10)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={`text-sm ${
                          index < feedback.mood_score
                            ? 'text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {feedback.feedback_text && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 p-4 bg-white/5 rounded-lg border border-white/5"
                >
                  <p className="text-gray-300 leading-relaxed">{feedback.feedback_text}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MusicFeedbackHistory; 