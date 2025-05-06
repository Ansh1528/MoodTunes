import { motion } from 'framer-motion';
import { FaMusic, FaHeart, FaCode, FaBrain, FaPuzzlePiece, FaChartBar, FaArrowRight } from 'react-icons/fa';
import FeatureCard from '../components/FeatureCard';
import LinkFeatureCard from '../components/LinkFeatureCard';
import DocLayout from '../components/DocLayout';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: FaMusic,
      title: "Music Therapy",
      description: "Our platform leverages the scientifically proven benefits of music therapy to help you process emotions and improve mental well-being.",
      to: "/dashboard"
    },
    {
      icon: FaBrain,
      title: "Neural Analysis",
      description: "Advanced AI algorithms analyze the emotional patterns in your journal entries to create personalized musical experiences."
    },
    {
      icon: FaHeart,
      title: "Personal Growth",
      description: "Track your emotional journey through musical experiences and daily reflections, watching your progress over time.",
      to: "/dashboard"
    },
    {
      icon: FaCode,
      title: "Modern Technology",
      description: "Built with cutting-edge technology to ensure a smooth, responsive, and secure experience for all users."
    },
    {
      icon: FaPuzzlePiece,
      title: "Personalization",
      description: "Every aspect of your experience is tailored to your unique emotional profile and musical preferences."
    },
    {
      icon: FaChartBar,
      title: "Progress Tracking",
      description: "Detailed analytics help you understand your emotional patterns and the impact of music on your well-being.",
      to: "/dashboard"
    }
  ];

  return (
    <DocLayout
      title="About MoodTunes"
      description="We believe in the healing power of music and its ability to touch souls, lift spirits, and transform emotions."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          feature.to ? (
            <LinkFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
              to={feature.to}
            />
          ) : (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          )
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16 text-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Ready to start your journey?</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold inline-flex items-center gap-2 group"
        >
          Start Journaling
          <FaArrowRight className="transition-transform group-hover:translate-x-1" />
        </motion.button>
      </motion.div>
    </DocLayout>
  );
}

export default About;