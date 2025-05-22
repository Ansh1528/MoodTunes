import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DocLayout from '../components/DocLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMusic, FaTimes, FaSpotify } from 'react-icons/fa';
import MoodPlaylists from '../components/MoodPlaylists';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getMoodGradient = (mood) => {
  const moodColors = {
    'happy': 'from-yellow-500/20 to-orange-500/20',
    'joy': 'from-yellow-500/20 to-orange-500/20',
    'excited': 'from-orange-500/20 to-red-500/20',
    'sad': 'from-blue-500/20 to-indigo-500/20',
    'melancholy': 'from-blue-400/20 to-purple-500/20',
    'depressed': 'from-blue-600/20 to-indigo-600/20',
    'angry': 'from-red-500/20 to-orange-600/20',
    'frustrated': 'from-red-600/20 to-purple-500/20',
    'calm': 'from-green-400/20 to-blue-400/20',
    'relaxed': 'from-teal-400/20 to-blue-400/20',
    'peaceful': 'from-green-400/20 to-teal-400/20',
    'anxious': 'from-purple-500/20 to-indigo-500/20',
    'worried': 'from-purple-400/20 to-blue-500/20',
    'love': 'from-pink-500/20 to-rose-500/20',
    'romantic': 'from-pink-400/20 to-purple-500/20'
  };

  // Convert mood to lowercase and remove any special characters
  const normalizedMood = mood.toLowerCase().replace(/[^a-z]/g, '');
  
  // Find the closest matching mood
  const moodKey = Object.keys(moodColors).find(key => 
    normalizedMood.includes(key) || key.includes(normalizedMood)
  ) || 'calm'; // default to calm if no match

  return moodColors[moodKey];
};

const MusicFeedbackForm = ({ isOpen, onClose, onSubmit, currentMood }) => {
  const [moodScore, setMoodScore] = useState(5);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ moodScore, feedback });
    setMoodScore(5);
    setFeedback('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-xl z-50"
        >
          <div className="max-w-4xl mx-auto">
            <div 
              className="flex items-center justify-between p-6 bg-white/10 backdrop-blur-md border-b border-white/10"
              style={{ position: 'sticky', top: 0, zIndex: 20 }}
            >
              <div className="flex items-center gap-3">
                <FaMusic className="text-purple-400 text-xl" />
                <h3 className="text-xl font-semibold text-white">Music Feedback</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/80 mb-3">How's your mood now?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMoodScore(value)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          moodScore === value
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 mb-3">How did the music affect you?</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="Share your thoughts about the music..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NotificationPopup = ({ isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed right-4 top-4 bg-gray-700 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-xl z-50 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <FaSpotify className="text-green-500 text-xl mt-1" />
            <div className="flex-1">
              <p className="text-white text-sm">
                This is only the preview of the Playlists. To listen to full tracks, click on LISTEN ON SPOTIFY.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function Journal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entry, setEntry] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [error, setError] = useState('');
  const [dontSaveEntry, setDontSaveEntry] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistType, setPlaylistType] = useState('match');
  const moodAnalysisRef = useRef(null);
  const playlistRef = useRef(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimer, setFeedbackTimer] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);

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

        // Scroll to mood analysis box after a short delay to ensure it's rendered
        setTimeout(() => {
          moodAnalysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
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

  const handleKeyDown = (e) => {
    // If Enter is pressed without Shift key and there's text to analyze
    if (e.key === 'Enter' && !e.shiftKey && entry.trim()) {
      e.preventDefault(); // Prevent default new line
      analyzeMood();
    }
  };

  const handleMoodAction = (action) => {
    setShowPlaylist(true);
    setPlaylistType(action);
    
    // Show notification if it hasn't been shown before
    if (!hasShownNotification) {
      setShowNotification(true);
      setHasShownNotification(true);
      
      // Hide notification after 7 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 7000);
    }

    // Clear any existing feedback timer
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
    }

    // Start the feedback timer when playlist is opened
    const timer = setTimeout(() => {
      setShowFeedback(true);
    }, 60000); // 1 minute
    setFeedbackTimer(timer);
    setCurrentPlaylist(action);
    
    // Scroll to playlist after a short delay
    setTimeout(() => {
      playlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleClearEntry = () => {
    setEntry('');
    setMoodResult(null);
    setShowPlaylist(false);
    setError('');
    setDontSaveEntry(false);  // Reset the checkbox
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/journal/feedback`,
        {
          playlist_id: currentPlaylist,
          mood_score: feedbackData.moodScore,
          feedback_text: feedbackData.feedback
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        setShowFeedback(false);
        setCurrentPlaylist(null);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    }
  };

  // Add a new function to handle Spotify link clicks
  const handleSpotifyClick = () => {
    // Clear any existing feedback timer
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
    }

    // Start a new feedback timer
    const timer = setTimeout(() => {
      setShowFeedback(true);
    }, 60000); // 1 minute
    setFeedbackTimer(timer);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimer) {
        clearTimeout(feedbackTimer);
      }
    };
  }, [feedbackTimer]);

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
                onKeyDown={handleKeyDown}
                placeholder="How are you feeling today? (Press Enter to analyze mood)"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
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
              <motion.button
                type="button"
                onClick={handleClearEntry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Entry
              </motion.button>
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
          <div className="space-y-6" ref={moodAnalysisRef}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${getMoodGradient(moodResult?.primary_mood || 'calm')} backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg`}
            >
              <h3 className="text-xl font-semibold mb-4 text-white/90">Mood Analysis Results</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-white/60 text-sm">Primary Mood</p>
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-black/20 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xl font-bold text-white">{moodResult.primary_mood}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-white/60 text-sm">Confidence Level</p>
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-white">{moodResult.confidence}%</span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-black/20 mt-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${moodResult.confidence}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white/25"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {moodResult.emotions && moodResult.emotions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-white/60 text-sm">Associated Emotions</p>
                    <div className="flex flex-wrap gap-2">
                      {moodResult.emotions.map((emotion, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="px-4 py-2 bg-black/20 backdrop-blur-sm rounded-full text-sm text-white shadow-sm"
                        >
                          {emotion}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mood action buttons */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">Mood Actions</p>
                  <div className="flex flex-wrap gap-3">
                    {!['fearful', 'disgusted'].includes(moodResult?.primary_mood?.toLowerCase().split(' ')[0]) && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMoodAction('match')}
                        className={`px-4 py-2 ${
                          playlistType === 'match'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        } rounded-lg text-sm transition-colors flex items-center gap-2`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Match My Mood
                      </motion.button>
                    )}
                    {!['happy', 'calm', 'excited', 'energetic', 'motivated', 'joy', 'peaceful', 'serene', 'tranquil', 'relaxed'].includes(moodResult?.primary_mood?.toLowerCase().split(' ')[0]) && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMoodAction('uplift')}
                        className={`px-4 py-2 ${
                          playlistType === 'uplift'
                            ? 'bg-green-500 text-white'
                            : ['sad', 'heartbroken'].includes(moodResult?.primary_mood?.toLowerCase().split(' ')[0])
                              ? 'bg-gradient-to-r from-green-500/20 to-green-500/40 hover:from-green-500/30 hover:to-green-500/50 text-white'
                              : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white'
                        } rounded-lg text-sm transition-colors flex items-center gap-2`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        {['sad', 'heartbroken'].includes(moodResult?.primary_mood?.toLowerCase().split(' ')[0]) ? 'Uplift My Mood (Recommended)' : 'Uplift My Mood'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {showPlaylist && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                ref={playlistRef}
                className={`bg-gradient-to-br ${getMoodGradient(moodResult?.primary_mood || 'calm')} backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg`}
              >
                <MoodPlaylists 
                  currentMood={moodResult?.primary_mood} 
                  playlistType={playlistType}
                  onPlaylistTypeChange={setPlaylistType}
                  onSpotifyClick={handleSpotifyClick}
                />
              </motion.div>
            )}
          </div>
        )}
      </div>

      <NotificationPopup 
        isVisible={showNotification} 
        onClose={() => setShowNotification(false)} 
      />

      <MusicFeedbackForm
        isOpen={showFeedback}
        onClose={() => {
          setShowFeedback(false);
          if (feedbackTimer) {
            clearTimeout(feedbackTimer);
            setFeedbackTimer(null);
          }
        }}
        onSubmit={handleFeedbackSubmit}
        currentMood={moodResult?.primary_mood}
      />
    </DocLayout>
  );
}

export default Journal;
