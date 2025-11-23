import { motion, AnimatePresence } from 'framer-motion';
import './CompletionModal.css';

const CompletionModal = ({ 
  isVisible, 
  levelCompleted, 
  stats, 
  odsInfo, 
  onNextLevel, 
  onRestart, 
  onHome, 
  onClose 
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="completion-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="completion-modal"
          initial={{ scale: 0.7, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 100 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25, 
            delay: 0.1 
          }}
        >
          <motion.div 
            className="modal-header"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2>Parabéns!</h2>
            <p>Você completou o Nível {levelCompleted}!</p>
          </motion.div>

          <motion.div 
            className="stats-section"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <motion.div 
              className="stat-item"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <span className="stat-label">Movimentos:</span>
              <span className="stat-value">{stats.moves}</span>
            </motion.div>
            <motion.div 
              className="stat-item"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <span className="stat-label">Tempo:</span>
              <span className="stat-value">{stats.time}</span>
            </motion.div>
          </motion.div>

          <motion.div 
            className="ods-section" 
            style={{ borderColor: odsInfo.color }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <motion.div 
              className="ods-header-modal" 
              style={{ backgroundColor: odsInfo.color }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {odsInfo.logoUrl && (
                <motion.img 
                  src={odsInfo.logoUrl} 
                  alt={odsInfo.code}
                  className="ods-logo-modal"
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                />
              )}
              <div className="ods-title-section">
                {odsInfo.code && <span className="ods-code-modal">{odsInfo.code}</span>}
                <h3>{odsInfo.title}</h3>
              </div>
            </motion.div>

            <motion.div 
              className="ods-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <p className="ods-description">{odsInfo.description}</p>
              {odsInfo.link && (
                <motion.a 
                  href={odsInfo.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ods-learn-more"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📖 Saiba mais sobre este ODS
                </motion.a>
              )}
            </motion.div>
          </motion.div>

          <motion.div 
            className="modal-actions"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <motion.button 
              onClick={onNextLevel} 
              className="btn btn-next"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              Próximo Nível
            </motion.button>

            <motion.button 
              onClick={onRestart} 
              className="btn btn-restart"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              Jogar Novamente
            </motion.button>

            <motion.button 
              onClick={onHome} 
              className="btn btn-home"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              Menu Principal
            </motion.button>
          </motion.div>

          <motion.button 
            onClick={onClose} 
            className="close-button"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompletionModal;
