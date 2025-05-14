import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DocLayout from '../components/DocLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Journal() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [error, setError] = useState('');
  const [currentMood, setCurrentMood] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Fetch existing entries when component mounts
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        console.log('Fetching journal entries...'); // Debug log
        const response = await axios.get(`${BACKEND_URL}/api/journal`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Received entries:', response.data); // Debug log
        if (Array.isArray(response.data)) {
          setEntries(response.data);
        } else {
          console.error('Invalid response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
        if (error.response?.status === 401) {
          setError('Session expired. Please log in again.');
          // You might want to redirect to login here
        } else if (error.response?.data?.error) {
          setError(error.response.data.error);
        } else {
          setError('Failed to load journal entries');
        }
      }
    };
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      const response = await axios.post(
        `${BACKEND_URL}/api/journal`,
        { content: newEntry },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        const newEntry = response.data.entry;
        console.log('Saved entry:', newEntry); // Debug log
        setEntries(prevEntries => [newEntry, ...prevEntries]); // Add to beginning of list
        setNewEntry('');
        setResult({
          mood: newEntry.mood || newEntry.mood_tags, // Handle both formats
          confidence: newEntry.mood_score
        });
      } else {
        console.error('Server response indicated failure:', response.data);
        setError('Failed to save entry: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      if (error.response?.status === 422) {
        setError('Invalid data format. Please try again.');
      } else if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        // Optionally redirect to login page
      } else if (error.response?.data?.error) {
        setError('Failed to save entry: ' + error.response.data.error);
      } else if (error.message) {
        setError('Failed to save entry: ' + error.message);
      } else {
        setError('Failed to save journal entry. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <DocLayout
      title="Journal"
      description="Express your thoughts and feelings"
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Journal Entry Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="journal-entry" className="sr-only">
                Write your journal entry
              </label>
              <textarea
                id="journal-entry"
                rows="4"
                value={newEntry}
                onChange={(e) => {
                  setNewEntry(e.target.value);
                  setError('');
                }}
                placeholder="How are you feeling today?"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <p className="text-sm text-gray-400">
                Express your thoughts and feelings freely...
              </p>
              <motion.button
                type="submit"
                disabled={isLoading || !newEntry.trim()}
                whileHover={!isLoading && newEntry.trim() ? { scale: 1.02 } : {}}
                whileTap={!isLoading && newEntry.trim() ? { scale: 0.98 } : {}}
                className={`w-full sm:w-auto px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  isLoading || !newEntry.trim()
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                } text-white transition-all duration-200`}
              >
                {isLoading ? (
                  <>                    <LoadingSpinner />
                    <span>Saving...</span>
                  </>                ) : (
                  'Save Entry'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
        {result && (
        <div className="mt-4">
          <h3 className="text-xl">Detected Mood: <span className="font-bold">{result.mood}</span></h3>
          <p>Confidence: {result.confidence}%</p>
        </div>
      )}

        {/* Journal Entries List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Your Journal Entries</h2>
          {entries.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 py-8"
            >              No entries yet. Start writing your thoughts!
            </motion.p>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 space-y-4"
                  >                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-white/90 whitespace-pre-wrap">{entry.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </DocLayout>
  );
}

export default Journal;
