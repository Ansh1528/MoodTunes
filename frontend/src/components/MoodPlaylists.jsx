import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaArrowUp } from 'react-icons/fa';

// Spotify playlist IDs for each mood
const spotifyPlaylists = {
  Happy: {
    match: '27670o0opGxJkHKAO1voLz', // User's custom playlist
    uplift: '7e6qTHVfRdaYsio90s1fHC' // Mood Booster
  },
  Sad: {
    match: '37i9dQZF1DX7qK8ma5wgG1', // Sad Songs
    uplift: '37i9dQZF1DX3Ogo9pFvBkY' // Happy Beats
  },
  Angry: {
    match: '37i9dQZF1DX5q67ZpWyRrZ', // Anger Management
    uplift: '37i9dQZF1DXdPec7aLTmlC' // Calm Vibes
  },
  Calm: {
    match: '37i9dQZF1DX3Ogo9pFvBkY', // Peaceful Piano
    uplift: '37i9dQZF1DX3rxVfibe1L0' // Happy Hits
  },
  Excited: {
    match: '37i9dQZF1DX76Wlfdnj7AP', // Energy Boost
    uplift: '37i9dQZF1DX3rxVfibe1L0' // Happy Hits
  },
  Heartbroken: {
    match: '37i9dQZF1DX7qK8ma5wgG1', // Sad Songs
    uplift: '37i9dQZF1DX3rxVfibe1L0' // Happy Hits
  },
  Motivated: {
    match: '37i9dQZF1DX76Wlfdnj7AP', // Energy Boost
    uplift: '37i9dQZF1DX3rxVfibe1L0' // Happy Hits
  }
};

const MoodPlaylists = ({ currentMood }) => {
  const [playlistType, setPlaylistType] = useState('match');

  // Get the base mood without emoji
  const baseMood = currentMood.split(' ')[0];

  // Get the appropriate playlist ID based on mood and type
  const playlistId = spotifyPlaylists[baseMood]?.[playlistType] || spotifyPlaylists.Happy.match;

  // Custom width/height for Happy match
  const isHappyMatch = baseMood === 'Happy' && playlistType === 'match';
  const iframeWidth = isHappyMatch ? '80%' : '100%';
  const iframeHeight = isHappyMatch ? '152' : '352';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Music for Your Mood</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setPlaylistType('match')}
            className={`flex items-center px-4 py-2 rounded-full transition-all ${
              playlistType === 'match'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaHeart className="mr-2" />
            Match Mood
          </button>
          <button
            onClick={() => setPlaylistType('uplift')}
            className={`flex items-center px-4 py-2 rounded-full transition-all ${
              playlistType === 'uplift'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaArrowUp className="mr-2" />
            Uplift Mood
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={`https://open.spotify.com/embed/track/${playlistId}?utm_source=generator`}
              width={iframeWidth}
              height={iframeHeight}
              style={{ borderRadius: '12px' }}
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodPlaylists; 