import { motion } from 'framer-motion';
import { FaCalendar, FaChartLine, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import dayjs from 'dayjs';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mood score mapping
const MOOD_SCORES = {
  'Happy 😊': 10,
  'Excited ⚡': 9,
  'Loving 💝': 9,
  'Motivated 💪': 8,
  'Calm 😌': 9,
  'Neutral 😐': 5,
  'Nostalgic 🎭': 6,
  'Surprised 😲': 8,
  'Fearful 😰': 4,
  'Sad 😢': 3,
  'Angry 😠': 2,
  'Disgusted 🤢': 2,
  'Heartbroken 💔': 1
};

const getMoodColor = (confidence) => {
  const score = Math.round(confidence * 10);
  if (score >= 7) return 'bg-green-500/20 text-green-300';
  if (score >= 4) return 'bg-blue-500/20 text-blue-300';
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/90 p-3 rounded-lg border border-white/10 shadow-lg">
        <p className="text-white font-medium">{data.formattedDate}</p>
        <p className="text-purple-300">Mood: {data.primary_mood}</p>
        <p className="text-blue-300">Mood Score: {data.mood_score}/10</p>
      </div>
    );
  }
  return null;
};

// Custom dot component for mood emojis
const CustomDot = ({ cx, cy, payload }) => {
  if (!cx || !cy) return null;

  const emoji = payload.primary_mood.split(' ')[1] || '😐';
  
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      fill="#9333ea"
      fontSize={20}
      dominantBaseline="middle"
    >
      {emoji}
    </text>
  );
};

const History = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const getMoodScore = (entry) => {
    // Log the entry's mood data for debugging
    console.log('Processing entry:', {
      primary_mood: entry.mood?.primary_mood,
    });

    // Use mood mapping if available
    if (entry.mood?.primary_mood) {
      const mappedScore = MOOD_SCORES[entry.mood.primary_mood];
      if (mappedScore !== undefined) {
        console.log('Using mood mapping score:', {
          mood: entry.mood.primary_mood,
          score: mappedScore
        });
        return mappedScore;
      }
      console.log('No mapping found for mood:', entry.mood.primary_mood);
    }

    // Default score for unknown moods
    console.log('Using default score: 5');
    return 5;
  };

  const prepareChartData = () => {
    if (!entries.length) {
      console.log('No entries available for chart');
      return [];
    }

    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    console.log('Total entries:', sortedEntries.length);

    // Calculate start and end indices for current page
    const entriesPerPage = 7;
    const startIndex = Math.max(0, sortedEntries.length - (currentPage + 1) * entriesPerPage);
    const endIndex = Math.max(0, sortedEntries.length - currentPage * entriesPerPage);
    
    // Get entries for current page
    const pageEntries = sortedEntries.slice(startIndex, endIndex);

    console.log('Current page entries:', {
      page: currentPage,
      startIndex,
      endIndex,
      entriesCount: pageEntries.length
    });

    const chartData = pageEntries.map(entry => {
      const moodScore = getMoodScore(entry);
      
      const dataPoint = {
        timestamp: entry.created_at,
        mood_score: moodScore,
        formattedDate: dayjs(entry.created_at).format('MMM D, h:mm A'),
        primary_mood: entry.mood?.primary_mood || 'Neutral 😐'
      };

      console.log('Created data point:', dataPoint);
      return dataPoint;
    });

    console.log('Final chart data:', chartData);
    return chartData;
  };

  const getMoodSummary = (data) => {
    if (data.length < 3) return {
      message: "Not enough data to determine mood trend.",
      trend: "neutral"
    };
    
    const lastThreeScores = data.slice(-3).map(d => d.mood_score);
    const trend = lastThreeScores[2] - lastThreeScores[0];
    
    if (Math.abs(trend) < 1) return {
      message: "Your mood has remained stable over time.",
      trend: "stable"
    };
    
    return trend > 0 
      ? {
          message: "Your mood is improving!",
          trend: "improving"
        }
      : {
          message: "Your mood has been declining recently.",
          trend: "declining"
        };
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, Math.ceil(entries.length / 7) - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          navigate('/login');
          return;
        }

        console.log('Fetching entries...'); // Debug log
        const response = await axios.get(`${BACKEND_URL}/api/journal`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response:', response.data); // Debug log

        if (response.data?.success && Array.isArray(response.data.entries)) {
          // Add default user feedback score if not present
          const entriesWithFeedback = response.data.entries.map(entry => ({
            ...entry,
            user_feedback_score: entry.user_feedback_score || 5 // Default score of 5 if not present
          }));
          
          console.log('Processed entries:', entriesWithFeedback); // Debug log
          setEntries(entriesWithFeedback);
          setError('');
        } else {
          console.error('Invalid response format:', response.data); // Debug log
          throw new Error(response.data?.error || 'Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching entries:', err); // Debug log
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login');
        } else {
          setError(err.response?.data?.error || err.message || 'Failed to fetch journal entries.');
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

      {/* Mood Overview Chart */}
      <div className="p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Mood Overview</h2>
            <span className="text-sm text-white/60">
              Showing {prepareChartData().length} of {entries.length} entries
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage >= Math.ceil(entries.length / 7) - 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage >= Math.ceil(entries.length / 7) - 1
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              <FaChevronLeft />
            </button>
            <span className="text-sm text-white/60">
              Page {currentPage + 1} of {Math.ceil(entries.length / 7)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === 0}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 0
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        <div className="h-[500px]">
          {entries.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={prepareChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.7)' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.7)' }}
                    ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mood_score"
                    stroke="#9333ea"
                    strokeWidth={2}
                    dot={<CustomDot />}
                    activeDot={<CustomDot />}
                    name="Mood Score"
                    connectNulls={true}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <FaChartLine className="text-5xl" />
              <span className="ml-2 text-lg">No data available for chart</span>
            </div>
          )}
        </div>
      </div>

      {/* Mood Summary Box */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${
              getMoodSummary(prepareChartData()).trend === 'improving'
                ? 'bg-green-500/20 text-green-300'
                : getMoodSummary(prepareChartData()).trend === 'declining'
                ? 'bg-red-500/20 text-red-300'
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              <FaChartLine className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Mood Summary</h3>
              <p className={`text-lg ${
                getMoodSummary(prepareChartData()).trend === 'improving'
                  ? 'text-green-300'
                  : getMoodSummary(prepareChartData()).trend === 'declining'
                  ? 'text-red-300'
                  : 'text-blue-300'
              }`}>
                {getMoodSummary(prepareChartData()).message}
              </p>
            </div>
          </div>
        </motion.div>
      )}

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