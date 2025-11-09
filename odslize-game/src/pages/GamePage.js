import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../hooks/game/useGameState';
import { 
  GameBoard, 
  GameInfo, 
  GameControls, 
  GameHeader, 
  CompletionModal 
} from '../components/game';
import { LEVEL_CONFIGS } from '../patterns/strategy/ShufflerStrategy';
import './GamePage.css';

const GamePage = () => {
  const navigate = useNavigate();
  
  const {
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
    odsDisplay,
    modals,
    selectLevel,
    startLevel,
    makeMove,
    goToHome,
    toggleSound,
    solveLevel,
    revealBoard,
    hideCompletionModal
  } = useGameState();

  // Usar o nível do estado do jogo
  const selectedLevel = currentLevel || 1;

  // Estado para controlar a visibilidade do tabuleiro
  const [isBoardVisible, setIsBoardVisible] = useState(false);

  // Handlers
  const handleLevelSelect = (level) => {
    selectLevel(level);
  };

  const handleRevealBoard = () => {
    setIsBoardVisible(true);
    revealBoard(); // Chama o método do estado para fazer a transição
  };

  const handlePieceMove = (pieceIndex) => {
    makeMove(pieceIndex);
  };

  const handleShowHelp = () => {
    alert('Funcionalidade de ajuda será implementada em breve!');
  };

  const handleGoHome = () => {
    goToHome();
    navigate('/');
  };

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
      const level = Number.parseInt(autoStartLevel, 10) || 1;
      selectLevel(level);

      setTimeout(() => {
        startLevel();
      }, 100)
    }
  }, [currentStateName, selectLevel, startLevel]);

  return (
    <div className="new-game-page">
      <div className="game-container">
        <GameHeader 
          title={odsDisplay.isVisible ? odsDisplay.title : `Nível ${currentLevel || selectedLevel}`}
          code={odsDisplay.isVisible ? odsDisplay.code : `ODS${currentLevel || selectedLevel}`}
          logoUrl={odsDisplay.isVisible ? odsDisplay.logoUrl : currentODS?.logoUrl}
        />

        <GameControls
          currentStateName={currentStateName}
          selectedLevel={selectedLevel}
          unlockedLevels={unlockedLevels}
          levelConfigs={LEVEL_CONFIGS}
          soundEnabled={soundEnabled}
          solutionAvailable={true}
          isShuffling={isShuffling}
          isSolving={isSolving}
          onLevelSelect={handleLevelSelect}
          onStartLevel={handleRevealBoard}
          onSolveLevel={solveLevel}
          onRestartLevel={() => {
            selectLevel(currentLevel);
            startLevel();
          }}
          onToggleSound={toggleSound}
          onGoHome={handleGoHome}
          onShowHelp={handleShowHelp}
        />

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
      
          </div>
        )}

        {isGameReady && (
          <GameInfo
            moves={moves}
            timeElapsed={timeElapsed}
            gameState={currentStateName}
            isLevelCompleted={currentStateName === 'LevelCompletedState'}
            isShuffling={isShuffling}
            isSolving={isSolving}
          />
        )}

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
    </div>
  );
};

export default GamePage;
