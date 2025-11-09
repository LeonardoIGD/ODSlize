import { motion, AnimatePresence } from 'framer-motion';
import './GameInfo.css';

const ClockIcon = () => (
  <motion.svg 
    className="game-info-icon" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.4, delay: 0.2 }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </motion.svg>
);

const TargetIcon = () => (
  <motion.svg 
    className="game-info-icon" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.4, delay: 0.3 }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </motion.svg>
);

const GameInfo = ({ 
  moves, 
  timeElapsed, 
  gameState,
  isLevelCompleted,
  isShuffling,
  isSolving,
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isActive = gameState === 'PlayingState' || gameState === 'SolvingState' || isLevelCompleted;

  return (
    <motion.div 
      className="modern-game-info"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div 
        className="stats-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <motion.div 
          className="stat-item"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="stat-icon time-icon">
            <ClockIcon />
          </div>
          <div className="stat-content">
            <p className="stat-label">Tempo</p>
            <p className="stat-value time-value">
              {isActive ? formatTime(timeElapsed) : '00:00'}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-separator" 
          initial={{ scaleX: 0 }} 
          animate={{ scaleX: 1 }} 
          transition={{ delay: 0.25, duration: 0.4 }}
        />

        <motion.div 
          className="stat-item"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="stat-icon moves-icon">
            <TargetIcon />
          </div>
          <div className="stat-content">
            <p className="stat-label">Movimentos</p>
            <p className="stat-value moves-value">{moves}</p>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {(isLevelCompleted || isShuffling || isSolving) && (
          <motion.div 
            className="status-message"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              {isLevelCompleted && (
                <motion.div 
                  key="completed"
                  className="completion-message"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3>Nível Completado!</h3>
                  <p>
                    Você completou em <strong>{moves} movimentos</strong> e <strong>{formatTime(timeElapsed)}</strong>!
                  </p>
                </motion.div>
              )}

              {isShuffling && (
                <motion.p 
                  key="shuffling"
                  className="activity-message shuffling"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 10, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  Embaralhando... observe as peças se movendo!
                </motion.p>
              )}

              {isSolving && (
                <motion.p 
                  key="solving"
                  className="activity-message solving"
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  Resolvendo... acompanhe a sequência de movimentos!
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GameInfo;