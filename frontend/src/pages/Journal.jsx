import { useState } from 'react';
import { motion } from 'framer-motion';
import DocLayout from '../components/DocLayout';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Journal() {
  const [entry, setEntry] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [error, setError] = useState('');

  const analyzeMood = async () => {
    if (!entry.trim()) return;

    setIsAnalyzing(true);
    setError('');
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/analyze-mood`,
        { text: entry },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setMoodResult({
        mood: response.data.mood,
        confidence: response.data.confidence,
        emotions: response.data.emotions
      });
    } catch (error) {
      console.error('Error analyzing mood:', error);
      setError('Failed to analyze mood. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DocLayout
      title="Journal"
      description="Express your thoughts and feelings"
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="journal-entry" className="sr-only">
                Write your journal entry
              </label>
              <textarea
                id="journal-entry"
                rows="4"
                value={entry}
                onChange={(e) => {
                  setEntry(e.target.value);
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
                onClick={analyzeMood}
                disabled={isAnalyzing || !entry.trim()}
                whileHover={!isAnalyzing && entry.trim() ? { scale: 1.02 } : {}}
                whileTap={!isAnalyzing && entry.trim() ? { scale: 0.98 } : {}}
                className={`w-full sm:w-auto px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  isAnalyzing || !entry.trim()
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                } text-white transition-all duration-200`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Mood'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {moodResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold mb-4">Mood Analysis Results</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Primary Mood:</p>
                <p className="text-xl font-bold text-blue-400">{moodResult.mood}</p>
              </div>
              <div>
                <p className="text-gray-400">Confidence:</p>
                <p className="text-lg">{moodResult.confidence}%</p>
              </div>
              {moodResult.emotions && moodResult.emotions.length > 0 && (
                <div>
                  <p className="text-gray-400">Detected Emotions:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {moodResult.emotions.map((emotion, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 rounded-full text-sm"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DocLayout>
  );
}

export default Journal;
