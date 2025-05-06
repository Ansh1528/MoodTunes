import { motion } from 'framer-motion';
import { FaHeadphones, FaMusic, FaPlay } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const FloatingIcons = () => {
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    const iconComponents = [FaHeadphones, FaMusic, FaPlay];
    const numberOfIcons = 12; // 4 of each type
    const newIcons = Array.from({ length: numberOfIcons }).map((_, i) => ({
      id: i,
      Icon: iconComponents[i % 3],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 24 + 12, // Random size between 12px and 36px
      duration: Math.random() * 15 + 10, // Random duration between 10s and 25s
      delay: Math.random() * 5 // Random delay between 0s and 5s
    }));
    setIcons(newIcons);
  }, []);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
      {icons.map((icon) => (
        <motion.div
          key={icon.id}
          className="absolute text-blue-400/40"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            fontSize: icon.size
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            duration: icon.duration,
            delay: icon.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <icon.Icon />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingIcons;