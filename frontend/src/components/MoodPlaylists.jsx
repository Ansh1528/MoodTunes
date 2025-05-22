import { useState } from 'react';
import { m, motion } from 'framer-motion';
import { FaHeart, FaArrowUp, FaSpotify } from 'react-icons/fa';

// Mood-based color schemes
const moodColors = {
  Happy: {
    container: 'bg-yellow-50',
    bg: 'bg-yellow-100',
    hover: 'hover:bg-yellow-200',
    button: 'bg-yellow-500 hover:bg-yellow-600'
  },
  Sad: {
    container: 'bg-blue-50',
    bg: 'bg-blue-100',
    hover: 'hover:bg-blue-200',
    button: 'bg-blue-500 hover:bg-blue-600'
  },
  Angry: {
    container: 'bg-red-50',
    bg: 'bg-red-100',
    hover: 'hover:bg-red-200',
    button: 'bg-red-500 hover:bg-red-600'
  },
  Calm: {
    container: 'bg-green-50',
    bg: 'bg-green-100',
    hover: 'hover:bg-green-200',
    button: 'bg-green-500 hover:bg-green-600'
  },
  Excited: {
    container: 'bg-orange-50',
    bg: 'bg-orange-100',
    hover: 'hover:bg-orange-200',
    button: 'bg-orange-500 hover:bg-orange-600'
  },
  Heartbroken: {
    container: 'bg-purple-50',
    bg: 'bg-purple-100',
    hover: 'hover:bg-purple-200',
    button: 'bg-purple-500 hover:bg-purple-600'
  },
  Motivated: {
    container: 'bg-indigo-50',
    bg: 'bg-indigo-100',
    hover: 'hover:bg-indigo-200',
    button: 'bg-indigo-500 hover:bg-indigo-600'
  },
  fearful: {
    container: 'bg-gray-50',
    bg: 'bg-gray-100',
    hover: 'hover:bg-gray-200',
    button: 'bg-gray-500 hover:bg-gray-600'
  },
  Surprised: {
    container: 'bg-pink-50',
    bg: 'bg-pink-100',
    hover: 'hover:bg-pink-200',
    button: 'bg-pink-500 hover:bg-pink-600'
  },
  Disgusted: {
    container: 'bg-red-50',
    bg: 'bg-red-100',
    hover: 'hover:bg-red-200',
    button: 'bg-red-500 hover:bg-red-600'
  },
  Neutral: {
    container: 'bg-gray-50',
    bg: 'bg-gray-100',
    hover: 'hover:bg-gray-200',
    button: 'bg-gray-500 hover:bg-gray-600'
  },
  Loving: {
    container: 'bg-rose-50',
    bg: 'bg-rose-100',
    hover: 'hover:bg-rose-200',
    button: 'bg-rose-500 hover:bg-rose-600'
  }
};

// Spotify playlist IDs for each mood
const spotifyPlaylists = {
  Happy: {
    match: [
      { id: '27670o0opGxJkHKAO1voLz', name: 'HAPPY/CHEERFUL_MUSIC' },
      { id: '5bKez4vqF8xqgqF8OCyJPg', name: 'HAPPY/CHEERFUL_MUSIC' },
      { id: '0j2dHEBEqIVyxKuLqGHUto', name: 'HAPPY/CHEERFUL_MUSIC' }
    ],
    uplift: [
      { id: '5bKez4vqF8xqgqF8OCyJPg', name: 'HAPPY/CHEERFUL_MUSIC' }
    ]
  },
  Sad: {
    match: [
      { id: '4VCbQJz1Ylbfgnoq2xALha', name: 'SAD/EMOTIONAL_MUSIC' },
      { id: '1MI8VpWOjBg7Jcv5CKensh', name: 'SAD/EMOTIONAL_MUSIC' },
      { id: '2ApuADsiaUfKaGD7K7eGvU', name: 'SAD/EMOTIONAL/lofi_MUSIC' },
      { id: '1v4TPIxKoft94wJurFqlPG', name: 'SAD/EMOTIONAL/lofi_MUSIC' }
    ],
    uplift: [
      { id: '4PdfP3cW6pSXVp6CUaaWfz', name: 'CALM/RELAXING_MUSIC' },
      { id: '27670o0opGxJkHKAO1voLz', name: 'HAPPY/CHEERFUL_MUSIC' },
      { id: '4stlIpoPS7uKCsmUA7D8KZ', name: 'CHEERFUL_MUSIC'},
      { id: '5jYQ4O9Ii3tQcSbJMtVrk8', name: 'LOFI_MUSIC'}
    ]
  },
  Angry: {
    match: [
      { id: '0o1omKG3ittTgkNtFZLLd8', name: 'ANGRY/UPSET_MUSIC' },
      { id: '43mIFkoYDEpgPZfn64E1Xr', name: 'ANGRY/UPSET_MUSIC' }
    ],
    uplift: [
      { id: '4PdfP3cW6pSXVp6CUaaWfz', name: 'CALM/RELAXING_MUSIC' }
    ]
  },
  Calm: {
    match: [
      { id: '4PdfP3cW6pSXVp6CUaaWfz', name: 'CALM/RELAXING_MUSIC' },
      { id: '5bKez4vqF8xqgqF8OCyJPg', name: 'HAPPY/CHEERFUL_MUSIC' }
    ],
    uplift: [
      { id: '27670o0opGxJkHKAO1voLz', name: 'HAPPY/CHEERFUL_MUSIC' },
      { id: '0o1omKG3ittTgkNtFZLLd8', name: 'ANGRY/UPSET_MUSIC' }
    ]
  },
  Excited: {
    match: [
      { id: '27670o0opGxJkHKAO1voLz', name: 'HAPPY/CHEERFUL_MUSIC' }
    ],
    uplift: [
      { id: '4PdfP3cW6pSXVp6CUaaWfz', name: 'CALM/RELAXING_MUSIC' }
    ]
  },
  Heartbroken: {
    match: [
      { id: '4VCbQJz1Ylbfgnoq2xALha', name: 'SAD/EMOTIONAL_MUSIC' }
    ],
    uplift: [
      { id: '4PdfP3cW6pSXVp6CUaaWfz', name: 'CALM/RELAXING_MUSIC' }
    ]
  },
  Motivated: {
    match: [
      { id: '0o1omKG3ittTgkNtFZLLd8', name: 'ANGRY/UPSET_MUSIC' },
      { id: '7ljIrD6LQLGSwD9T1NcP3U', name: 'MOTIVATIONAL_MUSIC' }
    ],
    uplift: [
      { id: '27670o0opGxJkHKAO1voLz', name: 'HAPPY/CHEERFUL_MUSIC' }
    ]
  },
  fearful: {
    match: [
      { id: '4PdfP3cW6pSXVp6CUaaWfz', name: 'CALM/RELAXING_MUSIC' },
      { id: '5jYQ4O9Ii3tQcSbJMtVrk8', name: 'LOFI_MUSIC'}
    ],
    uplift: [
      { id: '27670o0opGxJkHKAO1voLz', name: 'HAPPY/CHEERFUL_MUSIC' }
    ]
  },
  Surprised: {
    match: [
      { id: '27670o0opGxJkHKAO1voLz', name: 'TRAVEL/ADVENTURE_MUSIC' },
      { id: '4VCbQJz1Ylbfgnoq2xALha', name: 'SAD/EMOTIONAL_MUSIC' }
    ],
    uplift: [
      { id: '4PdfP3cW6pSXVp6CUaaWfz', name: 'CALM/RELAXING_MUSIC' }
    ]
  },
  Disgusted: {
    match: [
      { id: '4VCbQJz1Ylbfgnoq2xALha', name: 'SAD/EMOTIONAL_MUSIC' }
    ],
    uplift: [
      { id: '4PdfP3cW6pSXVp6CUaaWfz', name: 'CALM/RELAXING_MUSIC' }
    ]
  },
  Neutral: {
    match: [
      { id: '4VCbQJz1Ylbfgnoq2xALha', name: 'SAD/EMOTIONAL_MUSIC' }
    ],
    uplift: [
      { id: '27670o0opGxJkHKAO1voLz', name: 'HAPPY/CHEERFUL_MUSIC' }
    ]
  },
  Loving: {
    match: [
      { id: '7xu0t5m6amzeP3Wns4lcvv', name: 'LOVE/ROMANTIC_MUSIC' },
      { id: '7xu0t5m6amzeP3Wns4lcvv', name:'ROMANTIC/LOVE_MUSIC'}
    ],
    uplift: [
      { id: '4PdfP3cW6pSXVp6CUaaWfz', name: 'CALM/RELAXING_MUSIC' },
      { id: '0j2dHEBEqIVyxKuLqGHUto', name: 'JOYFUL/HAPPY_MUSIC' }
    ]
  }
};

const MoodPlaylists = ({ currentMood, playlistType: externalPlaylistType, onPlaylistTypeChange, onSpotifyClick }) => {
  const [hoveredPlaylist, setHoveredPlaylist] = useState(null);

  // Get the base mood without emoji
  const baseMood = currentMood.split(' ')[0];
  const colors = moodColors[baseMood] || moodColors.Neutral;

  // Get the appropriate playlist IDs based on mood and type
  const playlists = spotifyPlaylists[baseMood]?.[externalPlaylistType] || spotifyPlaylists.Happy.match;

  // Check if match button should be shown
  const shouldShowMatchButton = !['fearful', 'disgusted'].includes(baseMood.toLowerCase());

  // Check if uplift button should be shown
  const shouldShowUpliftButton = !['happy', 'calm', 'excited', 'energetic', 'motivated', 'joy', 'peaceful', 'serene', 'tranquil', 'relaxed'].includes(baseMood.toLowerCase());
  
  // Check if uplift is recommended
  const isUpliftRecommended = ['sad', 'heartbroken'].includes(baseMood.toLowerCase());

  const handleSpotifyClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (onSpotifyClick) {
      onSpotifyClick();
    }
  };

  return (
    <div className={`${colors.container} rounded-lg shadow-lg transition-all bg-transparent duration-300`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Music for Your Mood</h2>
        <div className="flex space-x-2">
          {shouldShowMatchButton && (
            <button
              onClick={() => onPlaylistTypeChange('match')}
              className={`flex items-center px-4 py-2 rounded-full transition-all ${
                externalPlaylistType === 'match'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaHeart className="mr-2" />
              Match Mood
            </button>
          )}
          {shouldShowUpliftButton && (
            <button
              onClick={() => onPlaylistTypeChange('uplift')}
              className={`flex items-center px-4 py-2 rounded-full transition-all ${
                externalPlaylistType === 'uplift'
                  ? 'bg-green-500 text-white'
                  : isUpliftRecommended 
                    ? 'bg-gradient-to-r from-green-500/20 to-green-500/40 text-white hover:from-green-500/30 hover:to-green-500/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaArrowUp className="mr-2" />
              {isUpliftRecommended ? 'Uplift Mood (Recommended)' : 'Uplift Mood'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {playlists.map((playlist, index) => (
          <div
            key={index}
            className={`relative rounded-lg pt-2 px-4 transition-all duration-300 bg-gray-500 bg-opacity-30`}
            onMouseEnter={() => setHoveredPlaylist(index)}
            onMouseLeave={() => setHoveredPlaylist(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-gray-100">
                {playlist.name || `${externalPlaylistType === 'match' ? 'Matching' : 'Uplifting'} Playlist ${index + 1}`}
              </h3>
              <a
                href={`https://open.spotify.com/playlist/${playlist.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSpotifyClick}
                className={`flex items-center px-4 py-2 rounded-full text-white transition-all ${colors.button}`}
              >
                <FaSpotify className="mr-2" />
                Listen on Spotify
              </a>
            </div>
            <div 
              className="aspect-w-16 aspect-h-9"
              onClick={handleSpotifyClick}
            >
              <iframe
                src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator`}
                width="100%"
                height="160"
                style={{ borderRadius: '12px' }}
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodPlaylists; 