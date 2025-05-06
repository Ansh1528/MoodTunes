import { motion } from 'framer-motion';
import { FaCalendar, FaChartLine } from 'react-icons/fa';

const History = () => {
  // Mock data - replace with real data from backend later
  const mockEntries = [
    { 
      id: 1, 
      date: '2025-05-06', 
      mood: 'joyful',
      moodScore: 0.8,
      content: 'Had an amazing day listening to new music...',
      songs: ['Morning Light', 'Ocean Waves']
    },
    { 
      id: 2, 
      date: '2025-05-05', 
      mood: 'reflective',
      moodScore: 0.6,
      content: 'Spent some time thinking about...',
      songs: ['Peaceful Mind']
    },
    { 
      id: 3, 
      date: '2025-05-04', 
      mood: 'calm',
      moodScore: 0.7,
      content: 'Today was a peaceful day...',
      songs: ['Gentle Rain', 'Rising Sun']
    }
  ];

  return (
    <div className="space-y-8">
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

      {/* Mood Overview Chart Placeholder */}
      <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Mood Overview</h2>
        <div className="h-48 flex items-center justify-center text-gray-400">
          <FaChartLine className="text-4xl" />
          <span className="ml-2">Chart coming soon...</span>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Journal Entries</h2>
        {mockEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <FaCalendar />
                <span className="text-sm">{entry.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs 
                  ${entry.moodScore > 0.7 ? 'bg-green-500/20 text-green-300' :
                    entry.moodScore > 0.4 ? 'bg-blue-500/20 text-blue-300' :
                    'bg-purple-500/20 text-purple-300'}`}>
                  {entry.mood}
                </span>
              </div>
            </div>
            
            <p className="text-gray-300 line-clamp-2">{entry.content}</p>
            
            {entry.songs.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-sm text-gray-400">
                  Songs: {entry.songs.join(', ')}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default History;