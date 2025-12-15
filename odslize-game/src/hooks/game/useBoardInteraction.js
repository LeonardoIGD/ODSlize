import { useState, useCallback, useMemo } from 'react';

// Hook que gerencia interação com board (cliques, hover, validação de moves)
export const useBoardInteraction = (board, levelConfig, onMove = null) => {
  const [highlightedTile, setHighlightedTile] = useState(null);

  const emptyIndex = useMemo(() => {
    return board ? board.indexOf(0) : -1;
  }, [board]);

  // Checa se peça pode mover pro espaço vazio
  const isValidMove = useCallback((tileIndex) => {
    if (!levelConfig || emptyIndex === -1) return false;

    const { cols } = levelConfig.size;
    const tileRow = Math.floor(tileIndex / cols);
    const tileCol = tileIndex % cols;
    const emptyRow = Math.floor(emptyIndex / cols);
    const emptyCol = emptyIndex % cols;

    return (
      (Math.abs(tileRow - emptyRow) === 1 && tileCol === emptyCol) ||
      (Math.abs(tileCol - emptyCol) === 1 && tileRow === emptyRow)
    );
  }, [emptyIndex, levelConfig]);

  // Lista todas as peças que podem mover
  const getValidMoves = useCallback(() => {
    if (!levelConfig || emptyIndex === -1) return [];

    const validMoves = [];
    const { cols, rows } = levelConfig.size;
    const totalTiles = rows * cols;

    for (let i = 0; i < totalTiles; i++) {
      if (i !== emptyIndex && isValidMove(i)) {
        validMoves.push(i);
      }
    }

    return validMoves;
  }, [emptyIndex, levelConfig, isValidMove]);

  // Handler de clique na peça
  const handleTileClick = useCallback((tileIndex) => {
    if (isValidMove(tileIndex)) {
      if (onMove) {
        onMove(tileIndex);
      }
      return true;
    }
    return false;
  }, [isValidMove, onMove]);

  // Manipulador de hover em peça
  const handleTileHover = useCallback((tileIndex) => {
    if (isValidMove(tileIndex)) {
      setHighlightedTile(tileIndex);
    }
  }, [isValidMove]);

  // Manipulador de leave em peça
  const handleTileLeave = useCallback(() => {
    setHighlightedTile(null);
  }, []);

  // Obtém a posição da peça
  const getTilePosition = useCallback((index) => {
    if (!levelConfig) return { row: 0, col: 0 };

    const { cols } = levelConfig.size;
    return {
      row: Math.floor(index / cols),
      col: index % cols
    };
  }, [levelConfig]);

  // Verifica se a peça pode ser destacada
  const canHighlight = useCallback((tileIndex) => {
    return isValidMove(tileIndex) || highlightedTile === tileIndex;
  }, [isValidMove, highlightedTile]);

  return {
    emptyIndex,
    highlightedTile,
    isValidMove,
    getValidMoves,
    handleTileClick,
    handleTileHover,
    handleTileLeave,
    getTilePosition,
    canHighlight,
    validMoves: getValidMoves()
  };
};
