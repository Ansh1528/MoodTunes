import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

const KeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if no input/textarea is focused
      if (document.activeElement.tagName === 'INPUT' || 
          document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      // Command/Ctrl + Key shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'j':
            e.preventDefault();
            navigate('/journal');
            break;
          case 'h':
            e.preventDefault();
            navigate('/');
            break;
          case 'l':
            e.preventDefault();
            navigate('/login');
            break;
          case 'a':
            e.preventDefault();
            navigate('/about');
            break;
          default:
            break;
        }
        return;
      }

      // Single key shortcuts (when no modifier keys are pressed)
      if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        switch (e.key) {
          case '?':
            e.preventDefault();
            setShowShortcuts(prev => !prev);
            break;
          case 'Escape':
            if (showShortcuts) {
              setShowShortcuts(false);
            } else if (location.pathname !== '/') {
              navigate(-1);
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, location, showShortcuts]);

  return (
    <KeyboardShortcutsHelp
      isOpen={showShortcuts}
      onClose={() => setShowShortcuts(false)}
    />
  );
};

export default KeyboardShortcuts;