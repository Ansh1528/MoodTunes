import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import FeatureCard from './FeatureCard';

const LinkFeatureCard = ({ to, ...props }) => {
  return (
    <Link to={to} className="block transition-transform hover:-translate-y-1">
      <FeatureCard {...props} />
    </Link>
  );
};

LinkFeatureCard.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  index: PropTypes.number,
  className: PropTypes.string,
};

export default LinkFeatureCard;