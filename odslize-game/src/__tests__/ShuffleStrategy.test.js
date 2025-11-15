import { RandomMovesStrategy } from '../patterns/strategy/ShufflerStrategy';

describe('RandomMovesStrategy', () => {
  test('gera embaralhamento válido', () => {
    const strategy = new RandomMovesStrategy();

    const board = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const levelConfig = {
      movementRange: [5, 10],
      size: { rows: 3, cols: 3 }
    };

    const { board: shuffledBoard, solutionMoves } = strategy.shuffle(board, levelConfig);

    expect(Array.isArray(shuffledBoard)).toBe(true);
    expect(Array.isArray(solutionMoves)).toBe(true);
    expect(shuffledBoard).toHaveLength(board.length);

    // o embaralhamento deve conter os mesmos números
    expect(shuffledBoard.sort()).toEqual(board.sort());

    // deve haver pelo menos um movimento feito
    expect(solutionMoves.length).toBeGreaterThan(0);
  });
});
