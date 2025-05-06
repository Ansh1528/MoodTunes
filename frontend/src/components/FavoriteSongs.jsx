import { motion } from 'framer-motion';
import { FaHeart, FaPlay } from 'react-icons/fa';

const FavoriteSongs = () => {
  // Mock data - replace with real data from backend later
  const mockSongs = [
    { id: 1, title: "Peaceful Mind", artist: "Luna Ray", mood: "reflective" },
    { id: 2, title: "Morning Light", artist: "The Dreamers", mood: "hopeful" },
    { id: 3, title: "Ocean Waves", artist: "Ambient Collective", mood: "calm" },
    { id: 4, title: "Rising Sun", artist: "Aurora Band", mood: "energetic" },
    { id: 5, title: "Gentle Rain", artist: "Nature Sounds", mood: "relaxed" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Favorite Songs</h1>
        <button className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm transition-colors">
          Add Songs
        </button>
      </div>

      <div className="grid gap-4">
        {mockSongs.map((song) => (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FaPlay className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">{song.title}</h3>
                <p className="text-gray-400 text-sm">{song.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300">
                {song.mood}
              </span>
              <button className="text-red-400 hover:text-red-300 transition-colors">
                <FaHeart />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteSongs;