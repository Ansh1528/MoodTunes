import { motion } from 'framer-motion';

function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-black/30 transition-all duration-300"
    >
      <div className="flex flex-col items-start gap-4">
        <div className="p-3 rounded-lg bg-gray-300 text-2xl text-center text-blue-900">
          <Icon />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-gray-200 text-m sm:text-base">{description}</p>
        </div>
      </div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}

export default FeatureCard;