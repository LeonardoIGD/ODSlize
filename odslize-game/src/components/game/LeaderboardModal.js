import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Medal, Award } from 'lucide-react';
import './LeaderboardModal.css';

const LeaderboardModal = ({ isVisible, level, leaderboardData, onClose }) => {
  if (!isVisible) return null;

  const { topScores = [], totalPlayers = 0, metadata } = leaderboardData || {};

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="rank-icon gold" />;
      case 2:
        return <Medal className="rank-icon silver" />;
      case 3:
        return <Award className="rank-icon bronze" />;
      default:
        return <span className="rank-number">#{position}</span>;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="leaderboard-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="leaderboard-modal"
          initial={{ scale: 0.7, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 100 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div 
            className="leaderboard-header"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="leaderboard-title-section">
              <Trophy className="leaderboard-trophy-icon" />
              <div>
                <h2>Ranking - Nível {level}</h2>
                <p className="leaderboard-subtitle">
                  {totalPlayers} {totalPlayers === 1 ? 'jogador' : 'jogadores'} no ranking
                </p>
              </div>
            </div>
          </motion.div>

          {metadata && (
            <motion.div 
              className="leaderboard-info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="ranking-criteria">{metadata.rankingCriteria}</p>
            </motion.div>
          )}

          <motion.div 
            className="leaderboard-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {topScores.length === 0 ? (
              <div className="leaderboard-empty">
                <p>Nenhum score registrado ainda para este nível.</p>
                <p className="leaderboard-empty-subtitle">Seja o primeiro!</p>
              </div>
            ) : (
              topScores.map((score, index) => (
                <motion.div
                  key={`${score.userId}-${index}`}
                  className={`leaderboard-item ${index < 3 ? `top-${index + 1}` : ''}`}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
                >
                  <div className="leaderboard-rank">
                    {getRankIcon(score.position)}
                  </div>
                  
                  <div className="leaderboard-player-info">
                    <span className="player-name">
                      {score.username || `Jogador ${score.userId.substring(0, 8)}`}
                    </span>
                    <span className="completion-date">
                      {formatDate(score.completedAt)}
                    </span>
                  </div>

                  <div className="leaderboard-stats">
                    <div className="stat-badge time-badge">
                      <span className="stat-label">Tempo:</span>
                      <span className="stat-value">{formatTime(score.time)}</span>
                    </div>
                    <div className="stat-badge moves-badge">
                      <span className="stat-label">Movimentos:</span>
                      <span className="stat-value">{score.movements}</span>
                    </div>
                    <div className="stat-badge score-badge">
                      <span className="stat-label">Score:</span>
                      <span className="stat-value">{score.score.toFixed(1)}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          <motion.button 
            onClick={onClose} 
            className="leaderboard-close-button"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X />
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeaderboardModal;
