import { motion } from 'framer-motion';
import { FaCalendar, FaChartLine, FaClock, FaChevronLeft, FaChevronRight, FaChartBar, FaFilter, FaDownload, FaMusic, FaTimes } from 'react-icons/fa';
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
        {data.mood_score !== null && (
          <>
            <p className="text-purple-300">Mood: {data.primary_mood}</p>
            <p className="text-blue-300">Mood Score: {data.mood_score}/10</p>
          </>
        )}
        {data.feedback_score !== null && (
          <p className="text-green-300">Feedback Score: {data.feedback_score}/10</p>
        )}
      </div>
    );
  }
  return null;
};

// Add back the CustomDot component for mood emojis
const CustomDot = ({ cx, cy, payload }) => {
  if (!cx || !cy || !payload.primary_mood) return null;

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
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showGraph, setShowGraph] = useState(false);
<<<<<<< HEAD
  const [filter, setFilter] = useState('all'); // 'all', 'recent', 'high-scores'
=======
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [moodFilter, setMoodFilter] = useState('');
>>>>>>> 4354e7c42ee4fca582e620c87e5b0b0c92c5f53f
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

    // Sort feedback by date
    const sortedFeedback = [...feedback].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    // Create a map of all timestamps
    const allTimestamps = new Set([
      ...sortedEntries.map(e => e.created_at),
      ...sortedFeedback.map(f => f.created_at)
    ]);

    // Create data points for all timestamps
    const chartData = Array.from(allTimestamps).map(timestamp => {
      const entry = sortedEntries.find(e => e.created_at === timestamp);
      const feedbackEntry = sortedFeedback.find(f => f.created_at === timestamp);

      return {
        timestamp,
        formattedDate: dayjs(timestamp).format('MMM D, h:mm A'),
        mood_score: entry ? getMoodScore(entry) : null,
        feedback_score: feedbackEntry ? feedbackEntry.mood_score : null,
        primary_mood: entry?.mood?.primary_mood || null
      };
    }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    console.log('Total entries:', sortedEntries.length);
    console.log('Total feedback:', sortedFeedback.length);
    console.log('Combined data points:', chartData.length);

    // Calculate start and end indices for current page
    const entriesPerPage = 10;
    const startIndex = Math.max(0, chartData.length - (currentPage + 1) * entriesPerPage);
    const endIndex = Math.max(0, chartData.length - currentPage * entriesPerPage);
    
    // Get entries for current page
    return chartData.slice(startIndex, endIndex);
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
    setCurrentPage(prev => Math.min(prev + 1, Math.ceil((entries.length + feedback.length) / 10) - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

<<<<<<< HEAD
  const getFilteredEntries = () => {
    switch (filter) {
      case 'recent':
        return entries.slice(0, 5); // Show only last 5 entries
      case 'high-scores':
        return entries.filter(entry => getMoodScore(entry) >= 8);
      default:
        return entries;
    }
  };

  const handleDownloadReport = () => {
    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(147, 51, 234); // Purple color
    doc.text('Mood & Journal History Report', pageWidth / 2, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${dayjs().format('MMMM D, YYYY')}`, pageWidth / 2, 30, { align: 'center' });
    
    // Add mood summary
    const moodSummary = getMoodSummary(prepareChartData());
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Mood Summary', 20, 45);
    doc.setFontSize(12);
    doc.text(moodSummary.message, 20, 55);
    
    // Add entries table
    const tableColumn = ['Date', 'Time', 'Mood', 'Mood Score', 'Content'];
    const tableRows = entries.map(entry => [
      formatDate(entry.created_at),
      formatTime(entry.created_at),
      entry.mood?.primary_mood || 'N/A',
      getMoodScore(entry).toString(),
      entry.content
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'grid',
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 'auto' }
      }
    });
    
    // Add statistics
    const finalY = doc.lastAutoTable.finalY || 65;
    doc.setFontSize(14);
    doc.text('Statistics', 20, finalY + 20);
    doc.setFontSize(12);
    doc.text(`Total Entries: ${entries.length}`, 20, finalY + 30);
    doc.text(`Average Mood Score: ${(entries.reduce((acc, entry) => acc + getMoodScore(entry), 0) / entries.length).toFixed(1)}`, 20, finalY + 40);
    
    // Save the PDF
    doc.save(`journal-history-${dayjs().format('YYYY-MM-DD')}.pdf`);
=======
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }

      // Show loading state
      setLoading(true);

      const response = await axios.get(`${BACKEND_URL}/api/journal/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mood-journal-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Hide loading state
      setLoading(false);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report. Please try again.');
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filteredData = [...data];

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      filteredData = filteredData.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= new Date(dateRange.start) && entryDate <= new Date(dateRange.end);
      });
    }

    // Apply mood filter
    if (moodFilter) {
      filteredData = filteredData.filter(entry => 
        entry.mood?.primary_mood?.toLowerCase().includes(moodFilter.toLowerCase())
      );
    }

    return filteredData;
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setMoodFilter('');
    setShowFilter(false);
>>>>>>> 4354e7c42ee4fca582e620c87e5b0b0c92c5f53f
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          navigate('/login');
          return;
        }

        // Fetch journal entries
        const entriesResponse = await axios.get(`${BACKEND_URL}/api/journal`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch feedback data
        const feedbackResponse = await axios.get(`${BACKEND_URL}/api/music-feedback`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (entriesResponse.data?.success && Array.isArray(entriesResponse.data.entries)) {
          setEntries(entriesResponse.data.entries);
        }

        if (feedbackResponse.data?.success && Array.isArray(feedbackResponse.data.feedback)) {
          setFeedback(feedbackResponse.data.feedback);
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
      setError('Please log in to view your history.');
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

  const chartData = prepareChartData();
  const moodSummary = getMoodSummary(chartData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <FaCalendar className="text-2xl text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mood & Journal History</h1>
            <p className="text-sm text-gray-400 mt-1">Track your emotional journey over time</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
<<<<<<< HEAD
            onClick={() => setFilter(filter === 'all' ? 'recent' : filter === 'recent' ? 'high-scores' : 'all')}
=======
            onClick={() => setShowFilter(!showFilter)}
>>>>>>> 4354e7c42ee4fca582e620c87e5b0b0c92c5f53f
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <FaFilter />
            {filter === 'all' ? 'All Entries' : filter === 'recent' ? 'Recent' : 'High Scores'}
          </button>
          <button 
<<<<<<< HEAD
            onClick={handleDownloadReport}
=======
            onClick={handleDownload}
>>>>>>> 4354e7c42ee4fca582e620c87e5b0b0c92c5f53f
            className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <FaDownload />
            Download Report
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Filter Entries</h3>
            <button
              onClick={clearFilters}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FaTimes className="text-white/60" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white w-full"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Mood Filter</label>
              <input
                type="text"
                value={moodFilter}
                onChange={(e) => setMoodFilter(e.target.value)}
                placeholder="Filter by mood..."
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white w-full"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Graph Toggle Button */}
      {entries.length > 0 && (
        <div className="flex justify-start">
          <button 
            onClick={() => setShowGraph(!showGraph)}
            className="px-6 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm transition-colors flex items-center gap-2 shadow-lg hover:shadow-purple-500/20"
          >
            <FaChartBar className="text-lg" />
            {showGraph ? 'Hide Mood Graph' : 'Show Mood Graph'}
          </button>
        </div>
      )}

      {/* Mood Overview Chart */}
      {showGraph && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white">Mood & Feedback Overview</h2>
              <span className="text-sm text-white/60">
                Showing {prepareChartData().length} of {entries.length + feedback.length} entries
                {feedback.length > 0 && ` (${feedback.length} feedback entries)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage >= Math.ceil((entries.length + feedback.length) / 10) - 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage >= Math.ceil((entries.length + feedback.length) / 10) - 1
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-white/5 hover:bg-white/10 text-white'
                }`}
              >
                <FaChevronLeft />
              </button>
              <span className="text-sm text-white/60">
                Page {currentPage + 1} of {Math.ceil((entries.length + feedback.length) / 10)}
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
                    <Line
                      type="monotone"
                      dataKey="feedback_score"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                      activeDot={{ fill: "#22c55e", strokeWidth: 2, r: 6 }}
                      name="Feedback Score"
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
        </motion.div>
      )}

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
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <p className="text-gray-400 text-lg">No journal entries yet.</p>
            <p className="text-gray-500 mt-2">Your journal entries will appear here once you create some.</p>
          </div>
        ) : (
<<<<<<< HEAD
          getFilteredEntries().map((entry) => (
=======
          applyFilters(entries).map((entry) => (
>>>>>>> 4354e7c42ee4fca582e620c87e5b0b0c92c5f53f
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">
                      {formatDate(entry.created_at)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <FaClock className="text-gray-400 text-sm" />
                    <p className="text-sm text-gray-400">
                      {formatTime(entry.created_at)}
                    </p>
                  </div>
                </div>
                {entry.mood && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Mood:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${getMoodColor(entry.mood.confidence)}`}>
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