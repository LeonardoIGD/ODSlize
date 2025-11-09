import './GameControls.css';

const PlayIcon = () => (
  <svg className="control-icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="control-icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const RotateCcwIcon = () => (
  <svg className="control-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const EyeIcon = () => (
  <svg className="control-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const GameControls = ({
  currentStateName,
  selectedLevel,
  unlockedLevels,
  levelConfigs,
  soundEnabled,
  solutionAvailable,
  isShuffling,
  isSolving,
  onLevelSelect,
  onStartLevel,
  onSolveLevel,
  onRestartLevel,
  onToggleSound,
  onGoHome,
  onShowHelp
}) => {

  const isPlaying = ['PlayingState', 'SolvingState'].includes(currentStateName);
  const isIdle = currentStateName === 'IdleState' || currentStateName === 'StartingState';

  return (
    <div className="modern-game-controls">
      <div className="controls-container">
        {isIdle && (
          <button
            onClick={onStartLevel}
            disabled={isShuffling}
            className="btn-primary btn-start"
          >
            <PlayIcon />
            <span>
              {isShuffling ? 'Preparando...' : 'Iniciar Jogo'}
            </span>
          </button>
        )}

        {isPlaying && (
          <>
            <button
              onClick={onSolveLevel}
              disabled={!solutionAvailable || isSolving}
              className="btn-warning btn-solve"
            >
              <CheckCircleIcon />
              <span>
                {isSolving ? 'Solucionando...' : 'Resolver'}
              </span>
            </button>

            <button
              onClick={onRestartLevel}
              disabled={isShuffling || isSolving}
              className="btn-danger btn-restart"
            >
              <RotateCcwIcon />
              <span>Reiniciar</span>
            </button>
          </>
        )}

        <div className="level-selector-container">
          <label htmlFor="level-select" className="level-label">
            Nível:
          </label>
          <select
            id="level-select"
            value={selectedLevel}
            onChange={(e) => onLevelSelect(Number.parseInt(e.target.value, 10))}
            disabled={isPlaying || isShuffling}
            className="level-select-modern"
          >
            {Object.entries(levelConfigs).map(([level, config]) => {
              const levelNum = Number.parseInt(level, 10);
              const isUnlocked = unlockedLevels.includes(levelNum);
              
              return (
                <option 
                  key={level} 
                  value={level}
                  disabled={!isUnlocked}
                >
                  Nível {level} ({config.size.rows}x{config.size.cols}) {!isUnlocked && '🔒'}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
};

export default GameControls;