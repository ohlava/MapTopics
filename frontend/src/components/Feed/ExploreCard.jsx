import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const ExploreCard = ({ topic, description, sources, isLastCard = false }) => {
  return (
    <motion.div
      className={`explore-card ${isLastCard ? 'last-card' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.3 }}
    >
      <div className="card-content">
        {/* Topic Header */}
        <div className="card-header">
          <h3 className="card-title">{topic}</h3>
        </div>

        {/* Description */}
        <div className="card-body">
          <p className="card-description">{description}</p>
        </div>

        {/* Sources */}
        <div className="card-footer">
          <div className="sources-container">
            {sources?.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-link"
                title={source.title}
              >
                <div className="source-icon">
                  {source.favicon ? (
                    <img src={source.favicon} alt="" />
                  ) : (
                    <ExternalLink size={16} />
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExploreCard;
