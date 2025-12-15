import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../hooks/game/useGameState';
import { motion, AnimatePresence } from 'framer-motion';
import { LEVEL_CONFIGS } from '../patterns/strategy/ShufflerStrategy';
import { ArrowLeft, CirclePlay, RefreshCw, Eye, Trophy, X, Award } from 'lucide-react';
import LeaderboardModal from '../components/game/LeaderboardModal';
import { scoreService } from '../services/scoreService';
import './GamePage.css';

const GamePage = () => {
  const navigate = useNavigate();
  
  const {
    currentLevel,
    board,
    moves,
    timeElapsed,
    isShuffling,
    isSolving,
    isGameReady,
    currentODS,
    unlockedLevels,
    currentStateName,
    currentLevelConfig,
    odsDisplay,
    modals,
    selectLevel,
    startLevel,
    makeMove,
    goToHome,
    solveLevel,
    hideCompletionModal
  } = useGameState();

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const selectedLevel = currentLevel || 1;
  const gridSize = currentLevelConfig?.size?.rows || 2;
  const gridCols = currentLevelConfig?.size?.cols || 2;
  const isSpecialLevel = gridSize === 3 && gridCols === 6;

  const isBoardVisible = currentStateName === 'PlayingState' || 
                         currentStateName === 'SolvingState' || 
                         currentStateName === 'LevelCompletedState';

  // Handlers
  const handleLevelSelect = (level) => {
    selectLevel(level);
  };

  const handleStart = async () => {
    await startLevel();
  };

  const handleReset = async () => {
    // Reinicia o nível atual reembaralhando o tabuleiro
    await startLevel();
  };

  const handleSolve = () => {
    solveLevel();
  };

  const handlePieceClick = (index) => {
    makeMove(index);
  };

  const handleGoHome = () => {
    goToHome();
    navigate('/');
  };

  const handlePlayAgain = () => {
    hideCompletionModal();
    handleReset();
  };

  const handleShowLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await scoreService.getLeaderboard(selectedLevel);
      setLeaderboardData(data);
      setShowLeaderboard(true);
    } catch (error) {
      console.error('❌ Erro ao buscar leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const canMove = (index) => {
    if (!board || board.length === 0) return false;
    if (currentStateName !== 'PlayingState') return false;
    
    const emptyIndex = board.indexOf(0);
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;
    const emptyRow = Math.floor(emptyIndex / gridCols);
    const emptyCol = emptyIndex % gridCols;

    return (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
  };

  const getTileSize = () => {
    // Nível especial 3x6
    if (isSpecialLevel) {
      return 'tile-size-special';
    }
    
    switch (gridSize) {
      case 2: return 'tile-size-2';
      case 3: return 'tile-size-3';
      case 4: return 'tile-size-4';
      case 5: return 'tile-size-5';
      default: return 'tile-size-3';
    }
  };

  const getPieceContent = (value) => {
    if (value === 0) return null;

    // Nível especial 3x6: cada peça tem uma imagem diferente do ODS
    if (isSpecialLevel) {
      const odsNumber = value; // ODS de 1 a 17
      const odsCode = `ODS${odsNumber.toString().padStart(3, '0')}`;
      const odsImageUrl = `https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-${odsNumber}.svg`;
      
      return (
        <div 
          className="piece-image special-piece"
          style={{ 
            backgroundImage: `url(${odsImageUrl})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      );
    }

    // Níveis normais: uma imagem dividida em peças
    const pieceRow = Math.floor((value - 1) / gridCols);
    const pieceCol = (value - 1) % gridCols;
    
    const bgPosX = gridCols > 1 ? (pieceCol * 100) / (gridCols - 1) : 0;
    const bgPosY = gridSize > 1 ? (pieceRow * 100) / (gridSize - 1) : 0;

    return (
      <div 
        className="piece-image"
        style={{ 
          backgroundImage: `url(${currentODS?.logoUrl})`,
          backgroundPosition: `${bgPosX}% ${bgPosY}%`,
          backgroundSize: `${gridCols * 100}% ${gridSize * 100}%`,
          backgroundRepeat: 'no-repeat'
        }}
      />
    );
  };

  const isPlaying = currentStateName === 'PlayingState' || currentStateName === 'SolvingState';

  // Formata o tempo em MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="new-game-page-modern">
      <div className="animated-background" />
      <motion.div
        animate={{ 
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="animated-gradient"
      />

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="game-header-modern"
      >
        <div className="header-content">
          <div className="header-flex">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoHome}
              className="back-button"
            >
              <ArrowLeft />
              <span className="back-text">Voltar</span>
            </motion.button>
            
            <div className="header-title-section">
              <div className="header-ods-code">
                {odsDisplay.isVisible ? (
                  `ODS ${odsDisplay.code.replace('ODS', '')} - ${odsDisplay.title}`
                ) : (
                  `Nível ${selectedLevel} - ${currentLevelConfig?.name || 'Carregando...'}`
                )}
              </div>
            </div>

            <div className="user-placeholder"></div>
          </div>
        </div>
      </motion.div>

      <div className="main-content">
        <div className="content-wrapper">
          <div className="grid-layout">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="sidebar-menu"
            >
              <h3 className="menu-title">Menu do Jogo</h3>

              <div className="menu-actions">
                {!isPlaying && (
                  <button
                    onClick={handleStart}
                    disabled={isShuffling}
                    className="btn btn-primary btn-start"
                  >
                    <CirclePlay />
                    <span>{isShuffling ? 'Preparando...' : 'Iniciar Jogo'}</span>
                  </button>
                )}

                {isPlaying && (
                  <>
                    <button
                      onClick={handleReset}
                      disabled={isShuffling || isSolving}
                      className="btn btn-warning btn-reset"
                    >
                      <RefreshCw />
                      <span>Reiniciar</span>
                    </button>

                    <button
                      onClick={handleSolve}
                      disabled={isSolving}
                      className="btn btn-success btn-solve"
                    >
                      <Trophy />
                      <span>{isSolving ? 'Solucionando...' : 'Resolver'}</span>
                    </button>
                  </>
                )}

                <div className="game-menu-level-selector">
                  <label className="game-menu-level-label" htmlFor="level-select">Selecione o Nível</label>
                  <select
                    id="level-select"
                    value={selectedLevel}
                    onChange={(e) => handleLevelSelect(Number.parseInt(e.target.value, 10))}
                    disabled={isPlaying || isShuffling}
                    className="game-menu-level-select"
                  >
                    {Object.entries(LEVEL_CONFIGS).map(([level, config]) => {
                      const levelNum = Number.parseInt(level, 10);
                      const isLocked = !unlockedLevels.includes(levelNum);
                      return (
                        <option 
                          key={level} 
                          value={level}
                          disabled={isLocked}
                        >
                          {config.name} {isLocked ? '🔒' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="game-menu-divisor"></div>

                <button
                  onClick={handleShowLeaderboard}
                  disabled={loadingLeaderboard}
                  className="btn btn-info btn-leaderboard"
                >
                  <Award />
                  <span>{loadingLeaderboard ? 'Carregando...' : 'Ver Ranking'}</span>
                </button>

                {isPlaying && (
                  <>
                    <button
                        onClick={() => setShowHelpModal(true)}
                        className="btn btn-outline btn-help"
                    >
                    <Eye />
                        <span>Ver quebra-cabeça resolvido</span>
                        </button>
                  </>
                )}

                <div className="game-menu-info">
                    <p className="game-menu-info-text">
                        Complete os níveis para desbloquear novos desafios!
                    </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="game-area"
            >
              {isPlaying && (
                <div className="game-stats">
                  <div className="stat-item">
                    <span className="stat-label">Movimentos:</span>
                    <span className="stat-value">{moves}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Tempo:</span>
                    <span className="stat-value">{formatTime(timeElapsed)}</span>
                  </div>
                </div>
              )}

              <div className="board-wrapper">
                {isGameReady && board && board.length > 0 ? (
                  <div 
                    className={`game-board-grid ${getTileSize()} ${isBoardVisible ? '' : 'board-blurred'}`}
                    style={{
                      gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                      gridTemplateRows: `repeat(${gridSize}, 1fr)`
                    }}
                  >
                    {board.map((value, index) => (
                      <motion.div
                        key={index}
                        className={`game-tile ${value === 0 ? 'empty-tile' : 'filled-tile'} ${canMove(index) ? 'movable-tile' : ''}`}
                        onClick={() => handlePieceClick(index)}
                        whileHover={canMove(index) ? { scale: 1.05 } : {}}
                        whileTap={canMove(index) ? { scale: 0.95 } : {}}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          delay: index * 0.02,
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                      >
                        {getPieceContent(value)}
                        {value !== 0 && !isBoardVisible && (
                          <div className="tile-number">{value}</div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="board-placeholder">
                    <p>Selecione um nível e clique em Iniciar Jogo</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content"
            >
              <button
                onClick={() => setShowHelpModal(false)}
                className="modal-close"
              >
                <X />
              </button>

              <div className="modal-body">
                <h2 className="modal-title">Imagem Original</h2>
                <p className="modal-description">
                  Esta é a imagem que você está tentando montar no quebra-cabeça.
                </p>

                <div className="reference-image-wrapper">
                  {currentODS?.logoUrl && (
                    <img 
                      src={currentODS.logoUrl} 
                      alt="Imagem de referência"
                      className="reference-image"
                    />
                  )}
                </div>

                <button
                  onClick={() => setShowHelpModal(false)}
                  className="btn btn-primary modal-action-btn"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modals.completion.isVisible && modals.completion.data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 100, rotateX: -20 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0, 
                rotateX: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.34, 1.56, 0.64, 1],
                  opacity: { duration: 0.5 }
                }
              }}
              exit={{ 
                scale: 0.8, 
                opacity: 0, 
                y: 50,
                transition: { duration: 0.3 }
              }}
              className="modal-content victory-modal"
            >
              <div className="victory-header">
                <motion.div 
                  className="trophy-icon"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    transition: { delay: 0.3, duration: 0.6, type: "spring", bounce: 0.5 }
                  }}
                >
                  <Trophy />
                </motion.div>
                <motion.h2 
                  className="victory-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.5, duration: 0.5 }
                  }}
                >
                  Parabéns!
                </motion.h2>
                <motion.p 
                  className="victory-subtitle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.6, duration: 0.5 }
                  }}
                >
                  Você completou o Nível {modals.completion.data.levelCompleted}!
                </motion.p>
              </div>

              <motion.div 
                className="victory-stats"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { delay: 0.7, duration: 0.5 }
                }}
              >
                <div className="victory-stat-item">
                  <span className="victory-stat-label">Movimentos:</span>
                  <span className="victory-stat-value">{modals.completion.data.stats.moves}</span>
                </div>
                <div className="victory-stat-item">
                  <span className="victory-stat-label">Tempo:</span>
                  <span className="victory-stat-value">{modals.completion.data.stats.time}</span>
                </div>

                {/* Exibir melhor tempo se disponível */}
                {modals.completion.data.stats.bestTime && (
                  <>
                    <div className="victory-stat-item best-score">
                      <span className="victory-stat-label">🏆 Melhor Tempo:</span>
                      <span className="victory-stat-value">{modals.completion.data.stats.bestTime}</span>
                    </div>
                    <div className="victory-stat-item best-score">
                      <span className="victory-stat-label">🏆 Melhor Movimentos:</span>
                      <span className="victory-stat-value">{modals.completion.data.stats.bestMoves}</span>
                    </div>
                    {modals.completion.data.stats.isNewBest && (
                      <div className="new-best-badge">
                        🎉 Novo Recorde! 🎉
                      </div>
                    )}
                  </>
                )}

                {modals.completion.data.totalGamesThisLevel && (
                  <div className="victory-stat-item total-games">
                    <span className="victory-stat-label">Total de partidas neste nível:</span>
                    <span className="victory-stat-value">{modals.completion.data.totalGamesThisLevel}</span>
                  </div>
                )}
              </motion.div>

              {modals.completion.data.odsInfo && (
                <motion.div 
                  className="ods-info-section"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.9, duration: 0.6 }
                  }}
                >
                  <div className="ods-info-header">
                    {modals.completion.data.odsInfo.logoUrl && (
                      <img 
                        src={modals.completion.data.odsInfo.logoUrl} 
                        alt={modals.completion.data.odsInfo.code}
                        className="ods-info-logo"
                      />
                    )}
                    <div>
                      <span className="ods-info-code">{modals.completion.data.odsInfo.code}</span>
                      <h3 className="ods-info-title">{modals.completion.data.odsInfo.title}</h3>
                    </div>
                  </div>
                  <p className="ods-info-description">
                    {modals.completion.data.odsInfo.description}
                  </p>
                </motion.div>
              )}

              <motion.div 
                className="victory-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 1.1, duration: 0.5 }
                }}
              >
                <button
                  onClick={handlePlayAgain}
                  className="btn btn-primary"
                >
                  Jogar Novamente
                </button>
                <button
                  onClick={modals.completion.data.onHome || handleGoHome}
                  className="btn btn-outline"
                >
                  Voltar ao Início
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <LeaderboardModal 
        isVisible={showLeaderboard}
        level={selectedLevel}
        leaderboardData={leaderboardData}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
};

export default GamePage;