import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const DocLayout = ({ 
  title, 
  description, 
  children, 
  className = '',
  titleClassName = '',
  descriptionClassName = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 pt-20 ${className}`}
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ${titleClassName}`}
            >
              {title}
            </motion.h1>
            
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-lg text-blue-100 mb-8 max-w-2xl mx-auto ${descriptionClassName}`}
              >
                {description}
              </motion.p>
            )}
          </div>

          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

DocLayout.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  descriptionClassName: PropTypes.string
};

export default DocLayout;