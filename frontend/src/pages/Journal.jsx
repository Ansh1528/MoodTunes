import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DocLayout from '../components/DocLayout';
import LoadingSpinner from '../components/LoadingSpinner';

function Journal() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    setIsLoading(true);
    try {
      const result = await analyzeMood(newEntry);
      setMoodAnalysis(result);
      setEntries([...entries, { id: entries.length + 1, content: newEntry, created_at: new Date().toISOString(), mood_tags: result.mood.tags, mood_score: result.mood.score }]);
      setNewEntry('');
    } catch (error) {
      console.error('Error analyzing mood:', error);
      setError('Failed to analyze mood. Please try again.');
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
      description="Express yourself through words and music"
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
                  <>
                    <LoadingSpinner />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  'Save Entry'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Journal Entries List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Your Journal Entries</h2>
          {entries.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 py-8"
            >
              No entries yet. Start writing to track your moods!
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
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {formatDate(entry.created_at)}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {entry.mood_tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-white/90 whitespace-pre-wrap">{entry.content}</p>
                    
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-400">
                        <div>
                          Mood Intensity:{' '}
                          <span className="text-blue-400">
                            {Math.round(entry.mood_score * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
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