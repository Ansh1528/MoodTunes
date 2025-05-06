import { motion, AnimatePresence } from 'framer-motion';
import { FaKeyboard, FaTimes } from 'react-icons/fa';

const shortcuts = [
  { keys: ['⌘/Ctrl', 'J'], description: 'Go to Journal' },
  { keys: ['⌘/Ctrl', 'H'], description: 'Go to Home' },
  { keys: ['⌘/Ctrl', 'L'], description: 'Go to Login' },
  { keys: ['⌘/Ctrl', 'A'], description: 'Go to About' },
  { keys: ['?'], description: 'Show/Hide Keyboard Shortcuts' },
  { keys: ['Esc'], description: 'Go Back / Close Modal' }
];

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-s z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed right-1 bottom-1/3.5 -translate-x-1/2 -translate-y-1/2 w-100  max-w-lg z-50"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl border border-white/10">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaKeyboard className="text-2xl text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span
                          key={keyIndex}
                          className="px-2 py-1 bg-white/5 rounded border border-white/10 text-blue-300 font-mono"
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-400">{shortcut.description}</span>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-white/5 rounded-b-xl text-center text-sm text-gray-400">
                Press <span className="text-blue-400">?</span> anywhere to show/hide this window
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsHelp;