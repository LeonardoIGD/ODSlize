import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { scoreService } from '../../services/scoreService';
import Modal from '../common/Modal';
import './UserStats.css';

export const UserStats = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [bestScores, setBestScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega stats e melhores scores do user
  const loadUserStats = useCallback(async () => {
    try {
      setLoading(true);
      const userId = isAuthenticated && user ? user.userId : null;
      
      const [userStats, userBestScores] = await Promise.all([
        scoreService.getUserStats(userId),
        scoreService.getBestScores(userId)
      ]);

      setStats(userStats);
      setBestScores(userBestScores);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isOpen) {
      loadUserStats();
    }
  }, [isOpen, loadUserStats]);



  // Formata segundos em MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Define cor baseado na performance de moves
  const getPerformanceColor = (moves) => {
    if (moves < 20) return '#22c55e'; // Verde
    if (moves < 40) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Suas Estatísticas">
      <div className="user-stats">
        {loading ? (
          <div className="loading">Carregando estatísticas...</div>
        ) : (
          <>
            <div className="stats-section">
              <h3>Estatísticas Gerais</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{stats?.totalGames || 0}</span>
                  <span className="stat-label">Jogos Totais</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats?.levelsCompleted || 0}</span>
                  <span className="stat-label">Níveis Concluídos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats?.bestLevel || 0}</span>
                  <span className="stat-label">Nível Máximo</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats?.averageMoves || 0}</span>
                  <span className="stat-label">Média de Movimentos</span>
                </div>
              </div>
            </div>

            <div className="best-scores-section">
              <h3>Melhores Scores por Nível</h3>
              {bestScores.length > 0 ? (
                <div className="scores-list">
                  {bestScores.map((score) => (
                    <div key={score.id} className="score-item">
                      <div className="score-level">
                        <span className="level-number">Nível {score.level}</span>
                      </div>
                      <div className="score-details">
                        <div className="score-moves">
                          <span 
                            className="moves-value"
                            style={{ color: getPerformanceColor(score.moves) }}
                          >
                            {score.moves} movimentos
                          </span>
                        </div>
                        <div className="score-time">
                          <span className="time-value">
                            {formatTime(score.time)}
                          </span>
                        </div>
                        <div className="score-date">
                          {new Date(score.timestamp).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-scores">
                  <p>Nenhum score registrado ainda.</p>
                  <p>Complete alguns níveis para ver suas estatísticas!</p>
                </div>
              )}
            </div>

            {!isAuthenticated && (
              <div className="auth-notice">
                <p>💡 Faça login para sincronizar seus scores entre dispositivos!</p>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};