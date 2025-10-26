// Estratégia base para embaralhamento
export class ShufflerStrategy {
  shuffle(board, levelConfig) {
    throw new Error("Método shuffle deve ser implementado pela estratégia concreta");
  }
}

// Configurações dos níveis
export const LEVEL_CONFIGS = {
  1: { 
    size: { rows: 2, cols: 2 }, 
    movementRange: [2, 4],
    name: "Nível 2x2",
    totalPieces: 4
  },
  2: { 
    size: { rows: 3, cols: 3 }, 
    movementRange: [8, 16],
    name: "Nível 3x3", 
    totalPieces: 9
  },
  3: { 
    size: { rows: 4, cols: 4 }, 
    movementRange: [20, 40],
    name: "Nível 4x4",
    totalPieces: 16
  },
  4: { 
    size: { rows: 3, cols: 6 }, 
    movementRange: [30, 50],
    name: "Nível Especial 3x6",
    totalPieces: 18
  }
};

// Estratégia que usa movimentos aleatórios válidos
export class RandomMovesStrategy extends ShufflerStrategy {
  constructor() {
    super();
    this.directions = ['up', 'down', 'left', 'right'];
  }

  shuffle(board, levelConfig) {
    const boardCopy = [...board];
    const { movementRange, size } = levelConfig;

    const minMoves = movementRange[0];
    const maxMoves = movementRange[1];
    const movementsCount = Math.floor(Math.random() * (maxMoves - minMoves + 1)) + minMoves;

    const solutionMoves = [];
    let blankPosition = this.findBlankPosition(boardCopy, size);
    let lastDirection = null;

    let successfulMoves = 0;
    let attemptCount = 0;
    const maxAttempts = movementsCount * 10;

    while (successfulMoves < movementsCount && attemptCount < maxAttempts) {
      const availableDirections = this.getValidDirections(blankPosition, lastDirection, size);

      if (availableDirections.length === 0) {
        lastDirection = null;
        attemptCount++;
        continue;
      }

      const randomIndex = Math.floor(Math.random() * availableDirections.length);
      const direction = availableDirections[randomIndex];

      const newBlankPosition = this.moveInDirection(blankPosition, direction);

      if (this.isValidPosition(newBlankPosition, size)) {
        this.swapPositions(boardCopy, blankPosition, newBlankPosition, size);

        solutionMoves.push(this.getInverseDirection(direction));

        blankPosition = newBlankPosition;
        lastDirection = direction;
        successfulMoves++;
      }

      attemptCount++;
    }

    return {
      board: boardCopy,
      solutionMoves: solutionMoves.toReversed()
    };
  }

  findBlankPosition(board, size) {
    const index = board.indexOf(0);

    return {
      row: Math.floor(index / size.cols),
      col: index % size.cols
    };
  }

  getValidDirections(position, lastDirection, size) {
    const directions = [];
    const forbidden = this.getInverseDirection(lastDirection);

    if (position.row > 0 && 'up' !== forbidden) directions.push('up');
    if (position.row < size.rows - 1 && 'down' !== forbidden) directions.push('down');
    if (position.col > 0 && 'left' !== forbidden) directions.push('left');
    if (position.col < size.cols - 1 && 'right' !== forbidden) directions.push('right');

    return directions;
  }

  moveInDirection(position, direction) {
    const moves = {
      up: { row: -1, col: 0 },
      down: { row: 1, col: 0 },
      left: { row: 0, col: -1 },
      right: { row: 0, col: 1 }
    };

    const move = moves[direction];
    return {
      row: position.row + move.row,
      col: position.col + move.col
    };
  }

  isValidPosition(position, size) {
    return position.row >= 0 && position.row < size.rows && 
           position.col >= 0 && position.col < size.cols;
  }

  swapPositions(board, pos1, pos2, size) {
    const index1 = pos1.row * size.cols + pos1.col;
    const index2 = pos2.row * size.cols + pos2.col;

    const temp = board[index1];
    board[index1] = board[index2];
    board[index2] = temp;
  }

  getInverseDirection(direction) {
    const inverses = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };
    return inverses[direction];
  }
}

// Funções auxiliares para criar tabuleiros
export const createSolvedBoard = (levelConfig) => {
  const { size } = levelConfig;
  const totalCells = size.rows * size.cols;
  const board = [];

  for (let i = 1; i < totalCells; i++) {
    board.push(i);
  }

  board.push(0);
  return board;
};

// Verifica se o tabuleiro está na configuração vencedora
export const checkWinner = (board, levelConfig) => {
  const solvedBoard = createSolvedBoard(levelConfig);
  return board.every((piece, index) => piece === solvedBoard[index]);
};
