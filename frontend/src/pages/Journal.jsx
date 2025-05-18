import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DocLayout from '../components/DocLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Journal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entry, setEntry] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [error, setError] = useState('');
  const [dontSaveEntry, setDontSaveEntry] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const analyzeMood = async () => {
    if (!entry.trim()) return;

    setIsAnalyzing(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/analyze-mood`,
        { text: entry },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        console.log('Mood Analysis Response:', response.data);
        
        // Validate and format the mood data
        const primary_mood = String(response.data.primary_mood || '').trim();
        const confidence = Number(response.data.confidence || 0);
        const emotions = Array.isArray(response.data.emotions) 
          ? response.data.emotions.map(e => String(e).trim()).filter(e => e.length > 0)
          : [];

        console.log('Parsed Mood Values:', {
          primary_mood,
          confidence,
          emotions,
          rawConfidence: response.data.confidence,
          confidenceType: typeof response.data.confidence
        });

        // Validate the data before setting it
        if (!primary_mood) {
          throw new Error('Invalid mood analysis result: Missing primary mood');
        }
        if (isNaN(confidence) || confidence <= 0 || confidence > 100) {
          throw new Error(`Invalid mood analysis result: Invalid confidence value (${confidence})`);
        }

        // Format the mood data exactly as needed for saving
        const moodData = {
          primary_mood,
          confidence: parseFloat(confidence.toFixed(2)),
          emotions
        };

        console.log('Setting mood result with data:', JSON.stringify(moodData, null, 2));
        setMoodResult(moodData);
        setError('');

        // Auto-save the entry if user hasn't opted out
        if (!dontSaveEntry) {
          await saveEntry(moodData);
        }
      } else {
        throw new Error('Invalid response from mood analysis');
      }
    } catch (error) {
      console.error('Error analyzing mood:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError(error.message || error.response?.data?.error || 'Failed to analyze mood. Please try again.');
      }
      setMoodResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validateEntry = () => {
    if (!entry.trim()) {
      setError('Please write something in your journal entry.');
      return false;
    }
    return true;
  };

  const validateMoodData = (moodData) => {
    if (!moodData || typeof moodData !== 'object') {
      throw new Error('Invalid mood data format');
    }

    const { primary_mood, confidence, emotions } = moodData;

    // Validate primary_mood
    if (!primary_mood || typeof primary_mood !== 'string') {
      throw new Error('Primary mood must be a non-empty string');
    }
    const cleanedPrimaryMood = String(primary_mood).trim();
    if (!cleanedPrimaryMood) {
      throw new Error('Primary mood cannot be empty or just whitespace');
    }

    // Validate confidence
    if (confidence === undefined || confidence === null) {
      throw new Error('Confidence value is required');
    }
    const confidenceNum = Number(confidence);
    if (isNaN(confidenceNum)) {
      throw new Error('Confidence must be a valid number');
    }
    if (confidenceNum <= 0 || confidenceNum > 100) {
      throw new Error(`Confidence must be between 0 and 100, received: ${confidenceNum}`);
    }

    // Validate emotions
    if (!Array.isArray(emotions)) {
      throw new Error(`Emotions must be an array, received: ${typeof emotions}`);
    }

    // Clean and validate each emotion
    const cleanedEmotions = emotions
      .map((e, index) => {
        if (typeof e !== 'string') {
          throw new Error(`Emotion at index ${index} must be a string, received: ${typeof e}`);
        }
        return String(e).trim();
      })
      .filter(e => e.length > 0);

    // Return the validated and formatted data
    return {
      primary_mood: cleanedPrimaryMood,
      confidence: parseFloat(confidenceNum.toFixed(2)),
      emotions: cleanedEmotions
    };
  };

  const saveEntry = async (moodData = moodResult) => {
    if (!validateEntry()) return;

    setIsSaving(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to save entries. Please log in again.');
        navigate('/login');
        return;
      }

      // Ensure content is a non-empty string
      const entryContent = String(entry).trim();
      if (!entryContent) {
        setError('Journal entry cannot be empty');
        return;
      }

      // Validate and format mood data
      let validatedMoodData = null;
      if (moodData) {
        try {
          validatedMoodData = validateMoodData(moodData);
        } catch (error) {
          console.error('Mood data validation error:', error);
          setError(`Invalid mood data: ${error.message}`);
          return;
        }
      }

      const payload = {
        content: entryContent,
        mood: validatedMoodData
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/journal`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data?.success) {
        console.log('Successfully saved journal entry');
        setError('');
      } else {
        setError('Failed to save entry. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 422) {
        // Handle validation errors
        const errorData = error.response.data;
        console.log('Validation error details:', errorData);
        
        let errorMessage = 'Validation Error: ';
        if (errorData.detail) {
          errorMessage += errorData.detail;
        } else if (errorData.message) {
          errorMessage += errorData.message;
        } else if (errorData.error) {
          errorMessage += errorData.error;
        } else {
          errorMessage = 'Invalid data format. Please check your entry and try again.';
        }
        
        setError(errorMessage);
      } else {
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        setError(`Failed to save entry: ${message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEntryChange = (e) => {
    setEntry(e.target.value);
    setError(''); // Clear any existing errors when user types
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
          <form onSubmit={(e) => {
            e.preventDefault();
            analyzeMood();
          }} className="space-y-4">
            <div>
              <label htmlFor="journal-entry" className="sr-only">
                Write your journal entry
              </label>
              <textarea
                id="journal-entry"
                rows="4"
                value={entry}
                onChange={handleEntryChange}
                placeholder="How are you feeling today?"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="dont-save-entry"
                checked={dontSaveEntry}
                onChange={(e) => setDontSaveEntry(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 bg-black/20"
              />
              <label htmlFor="dont-save-entry" className="ml-2 text-sm text-gray-300">
                Don't save this entry
              </label>
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
              <div className="flex gap-4">
                <motion.button
                  type="submit"
                  disabled={isAnalyzing || !entry.trim()}
                  whileHover={!isAnalyzing && entry.trim() ? { scale: 1.02 } : {}}
                  whileTap={!isAnalyzing && entry.trim() ? { scale: 0.98 } : {}}
                  className={`px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    isAnalyzing || !entry.trim()
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-all duration-200`}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Mood'}
                </motion.button>
              </div>
            </div>
          </form>
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
                <p className="text-xl font-bold text-blue-400">{moodResult.primary_mood}</p>
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
