import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../hooks/game/useGameState';
import { 
  GameBoard, 
  GameInfo, 
  GameControls, 
  ODSHeader, 
  CompletionModal 
} from '../components/game';
import Button from '../components/common/Button';
import { LEVEL_CONFIGS } from '../patterns/strategy/ShufflerStrategy';
import './GamePage.css';

const GamePage = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(1);
  
  // Hook do estado do jogo
  const {
    // Dados do estado
    currentLevel,
    board,
    moves,
    timeElapsed,
    soundEnabled,
    isShuffling,
    isSolving,
    isGameReady,
    currentODS,
    unlockedLevels,
    currentStateName,
    currentLevelConfig,
    
    // Estados dos componentes
    odsDisplay,
    modals,
    
    // Actions
    selectLevel,
    startLevel,
    makeMove,
    goToHome,
    toggleSound,
    solveLevel,
    revealBoard,
    hideCompletionModal
  } = useGameState();

  // Estado para controlar a visibilidade do tabuleiro
  const [isBoardVisible, setIsBoardVisible] = useState(false);

  // currentLevelConfig já vem do hook

  // Handlers
  const handleLevelSelect = (level) => {
    console.log(`🎯 GamePage: Selecionando nível ${level}`);
    setSelectedLevel(level);
    selectLevel(level);
  };

  const handleStartGame = () => {
    console.log(`🚀 GamePage: Iniciando jogo no nível ${selectedLevel}`);
    startLevel();
  };

  const handleRevealBoard = () => {
    console.log(`👀 GamePage: Revelando tabuleiro`);
    setIsBoardVisible(true);
    revealBoard(); // Chama o método do estado para fazer a transição
  };

  const handlePieceMove = (pieceIndex) => {
    console.log(`🎮 GamePage: Movimento da peça ${pieceIndex}`);
    makeMove(pieceIndex);
  };

  const handleGoHome = () => {
    goToHome();
    navigate('/');
  };

  // Log do estado para debug
  useEffect(() => {
    console.log('🎮 GamePage: Estado atualizado', {
      currentStateName,
      currentLevel,
      selectedLevel,
      boardLength: board?.length,
      isGameReady
    });
  }, [currentStateName, currentLevel, selectedLevel, board, isGameReady]);

  // Resetar visibilidade do board quando muda de estado ou nível
  useEffect(() => {
    if (currentStateName === 'StartingState') {
      setIsBoardVisible(false);
    }
  }, [currentStateName, currentLevel]);

  // Verificar se deve iniciar automaticamente o jogo
  useEffect(() => {
    const autoStart = localStorage.getItem('autoStartGame');
    const autoStartLevel = localStorage.getItem('autoStartLevel');
    
    if (autoStart === 'true' && currentStateName === 'IdleState') {
      console.log('🚀 GamePage: Iniciando jogo automaticamente');
      
      // Limpa os flags do localStorage
      localStorage.removeItem('autoStartGame');
      localStorage.removeItem('autoStartLevel');
      
      // Seleciona o nível e inicia o jogo
      const level = parseInt(autoStartLevel) || 1;
      setSelectedLevel(level);
      selectLevel(level);
      
      // Aguarda um momento e inicia o jogo
      setTimeout(() => {
        startLevel();
      }, 100)
    }
  }, [currentStateName, selectLevel, startLevel]);

  return (
    <div className="new-game-page">
      {/* Header ODS */}
      {odsDisplay.isVisible && (
        <ODSHeader 
          title={odsDisplay.title}
          code={odsDisplay.code}
          logoUrl={odsDisplay.logoUrl}
        />
      )}

      {/* Seletor de Nível */}
      <div className="level-selector">
        <h2>Selecione o Nível</h2>
        <div className="level-buttons">
          {Object.entries(LEVEL_CONFIGS).map(([level, config]) => (
            <Button
              key={level}
              onClick={() => handleLevelSelect(parseInt(level))}
              disabled={!unlockedLevels.includes(parseInt(level))}
              className={`level-button ${selectedLevel === parseInt(level) ? 'selected' : ''}`}
            >
              Nível {level} ({config.size.rows}x{config.size.cols})
            </Button>
          ))}
        </div>
      </div>

      {/* Botão Iniciar - só aparece no IdleState */}
      {currentStateName === 'IdleState' && (
        <div className="start-section">
          <Button 
            onClick={handleStartGame}
            className="start-button"
            disabled={isShuffling}
          >
            {isShuffling ? 'Preparando...' : 'Iniciar Jogo'}
          </Button>
        </div>
      )}

      {/* Game Info - sempre visível quando o jogo estiver pronto */}
      {isGameReady && (
        <GameInfo
          moves={moves}
          timeElapsed={timeElapsed}
          levelConfig={currentLevelConfig}
          currentLevel={currentLevel}
        />
      )}

      {/* Game Board - sempre renderizado quando pronto, mas pode estar borrado */}
      {isGameReady && board && board.length > 0 && (
        <div className="game-board-container">
          <GameBoard
            board={board}
            levelConfig={currentLevelConfig}
            onPieceClick={handlePieceMove}
            isMoving={isShuffling || isSolving}
            currentImage={currentODS?.logoUrl}
            isBlurred={!isBoardVisible}
          />
          
          {/* Botão para revelar o tabuleiro - aparece quando está no StartingState */}
          {currentStateName === 'StartingState' && !isBoardVisible && (
            <div className="reveal-board-overlay">
              <Button 
                onClick={handleRevealBoard}
                className="reveal-button"
                size="large"
              >
                🎯 Revelar Tabuleiro
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Game Controls */}
      {isGameReady && (
        <GameControls
          onSolve={solveLevel}
          onHome={handleGoHome}
          onToggleSound={toggleSound}
          soundEnabled={soundEnabled}
          solutionAvailable={true} // TODO: Implementar lógica real
          disabled={isShuffling || isSolving}
        />
      )}

      {/* Modal de Conclusão */}
      {modals.completion.isVisible && modals.completion.data && (
        <CompletionModal
          isVisible={modals.completion.isVisible}
          levelCompleted={modals.completion.data.levelCompleted}
          stats={modals.completion.data.stats}
          odsInfo={modals.completion.data.odsInfo}
          onNextLevel={modals.completion.data.onNextLevel}
          onRestart={modals.completion.data.onRestart}
          onHome={modals.completion.data.onHome}
          onClose={hideCompletionModal}
        />
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <h3>Debug Info</h3>
          <p>Estado: {currentStateName}</p>
          <p>Nível Atual: {currentLevel}</p>
          <p>Nível Selecionado: {selectedLevel}</p>
          <p>Board: {board ? `Array(${board.length})` : 'undefined'}</p>
          <p>Game Ready: {isGameReady ? 'Sim' : 'Não'}</p>
        </div>
      )}
    </div>
  );
};

export default GamePage;