import { shouldUseOdsImages } from '../../config/gameConfig';
import './GameBoard.css';

const GameBoard = ({ 
  board, 
  onPieceClick, 
  isMoving, 
  levelConfig,
  currentImage,
  isBlurred = false
}) => {
  const handlePieceClick = (index) => {
    if (!isMoving) {
      onPieceClick(index);
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePieceClick(index);
    }
  };

  const getPieceContent = (value) => {
    if (value === 0) return '';

    if (shouldUseOdsImages()) {
      const { rows, cols } = levelConfig.size;
      const pieceRow = Math.floor((value - 1) / cols);
      const pieceCol = (value - 1) % cols;

      const bgPosX = -(pieceCol * (100 / (cols - 1)));
      const bgPosY = -(pieceRow * (100 / (rows - 1)));

      return (
        <div 
          className="piece-image"
          style={{ 
            backgroundImage: `url(${currentImage})`,
            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            backgroundSize: `${cols * 100}% ${rows * 100}%`
          }}
        />
      );
    } else {
      return (
        <div className="piece-number">
          {value}
        </div>
      );
    }
  };

  const getPieceClassName = (value) => {
    const baseClass = 'game-piece';
    const classes = [baseClass];

    if (value === 0) {
      classes.push('empty');
    } else {
      classes.push('filled');

      if (shouldUseOdsImages()) {
        classes.push('image-piece');
      } else {
        classes.push('number-piece');
      }
    }

    if (isMoving) {
      classes.push('moving');
    }

    return classes.join(' ');
  };

  const getBoardStyle = () => {
    const { rows, cols } = levelConfig.size;

    const maxSize = 400;
    const aspectRatio = cols / rows;

    let width, height;
    if (aspectRatio > 1) {
      width = maxSize;
      height = maxSize / aspectRatio;
    } else {
      height = maxSize;
      width = maxSize * aspectRatio;
    }

    return {
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      width: `${width}px`,
      height: `${height}px`
    };
  };

  if (!levelConfig || !board?.length) {
    return (
      <div className="game-board-loading">
        <p>Carregando tabuleiro...</p>
      </div>
    );
  }

  return (
    <div className={`game-board-container ${isBlurred ? 'blurred' : ''}`}>
      <div 
        className="game-board"
        style={getBoardStyle()}
      >
        {board.map((value, index) => (
          <button
            key={index}
            className={getPieceClassName(value)}
            onClick={() => handlePieceClick(index)}
            onKeyDown={(event) => handleKeyPress(event, index)}
            tabIndex={value === 0 ? -1 : 0}
            aria-label={value === 0 ? 'Empty space' : `Piece ${value}`}
            data-value={value}
            disabled={value === 0}
          >
            {getPieceContent(value)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;