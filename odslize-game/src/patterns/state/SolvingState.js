import { GameState } from './GameState';
import { createSolvedBoard } from '../strategy/ShufflerStrategy';

// Constantes para delays de solução
const SOLUTION_DELAYS = {
  SMALL_BOARD: 400,
  MEDIUM_BOARD: 350,
  LARGE_BOARD: 300
};

const BOARD_SIZE_THRESHOLDS = {
  SMALL: 4,
  MEDIUM: 9
};

// Estado de jogo em resolução automática
export class SolvingState extends GameState {
  enter() {
    this.stopPlayingTimer();
    this.context.setStateData({ isSolving: true });
    this.executeSolution();
  }

  exit() {
    this.context.setStateData({ isSolving: false });
  }

  async executeSolution() {
    const stateData = this.context.getStateData();
    const solutionMoves = stateData.solutionMoves || [];
    
    if (solutionMoves.length === 0) {
      this.goBackToPlaying();
      return;
    }

    try {
      await this.executeAllSolutionMoves(solutionMoves);
      this.checkSolutionComplete();
    } catch (error) {
      // Em caso de erro, retorna ao estado de jogo
      this.handleError(error);
      this.goBackToPlaying();
    }
  }

  async executeAllSolutionMoves(solutionMoves) {
    for (const direction of solutionMoves) {
      if (this.getStateName() !== 'SolvingState') {
        break;
      }

      const pieceToMove = this.getPieceToMoveFromDirection(direction);
      
      if (pieceToMove !== null) {
        await this.executeSolutionMove(pieceToMove);
      }
      
      const delay = this.getSolutionDelay();
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  checkSolutionComplete() {
    const finalState = this.context.getStateData();
    const levelConfig = this.context.getLevelConfig(finalState.currentLevel);
    const { checkWinner } = require('../strategy/ShufflerStrategy');
    
    if (checkWinner(finalState.board, levelConfig)) {
      this.handleSuccessfulSolution(finalState.currentLevel);
    } else {
      this.handleIncompleteResolution();
    }
  }

  handleSuccessfulSolution(currentLevel) {
    this.context.setStateData({ isLevelCompleted: true });
    this.unlockNextLevel(currentLevel);
    
    const { LevelCompletedState } = require('./LevelCompletedState');
    this.changeState(new LevelCompletedState(this.context));
  }

  // Converte direção em índice da peça que deve se mover
  getPieceToMoveFromDirection(direction) {
    const stateData = this.context.getStateData();
    const board = stateData.board;
    const levelConfig = this.context.getLevelConfig(stateData.currentLevel);
    const { cols, rows } = levelConfig.size;

    const blankIndex = board.indexOf(0);
    if (blankIndex === -1) return null;

    const blankRow = Math.floor(blankIndex / cols);
    const blankCol = blankIndex % cols;

    // Mapeia direção para offset da posição da peça que deve se mover
    const directionOffsets = {
      'up': [-1, 0],
      'down': [1, 0],
      'left': [0, -1],
      'right': [0, 1]
    };

    const offset = directionOffsets[direction];
    if (!offset) return null;

    const targetRow = blankRow + offset[0];
    const targetCol = blankCol + offset[1];

    if (targetRow < 0 || targetRow >= rows || targetCol < 0 || targetCol >= cols) {
      return null;
    }

    return targetRow * cols + targetCol;
  }

  // Executa um movimento da solução usando makeMove otimizado
  async executeSolutionMove(pieceIndex) {
    const { PlayingState } = require('./PlayingState');
    const playingState = new PlayingState(this.context);
    
    return playingState.makeMove(pieceIndex, {
      isSolving: true,
      silent: true,
      skipValidation: false
    });
  }

  // Obtém delay entre movimentos da solução
  getSolutionDelay() {
    const stateData = this.context.getStateData();
    const levelConfig = this.context.getLevelConfig(stateData.currentLevel);
    const totalPieces = levelConfig.size.rows * levelConfig.size.cols;
    
    if (totalPieces <= BOARD_SIZE_THRESHOLDS.SMALL) return SOLUTION_DELAYS.SMALL_BOARD;
    if (totalPieces <= BOARD_SIZE_THRESHOLDS.MEDIUM) return SOLUTION_DELAYS.MEDIUM_BOARD;
    return SOLUTION_DELAYS.LARGE_BOARD;
  }

  // Lida com casos onde a solução não funcionou perfeitamente
  handleIncompleteResolution() {
    const stateData = this.context.getStateData();
    const levelConfig = this.context.getLevelConfig(stateData.currentLevel);
    const solvedBoard = createSolvedBoard(levelConfig);
    
    this.context.setStateData({
      board: solvedBoard,
      isLevelCompleted: true
    });

    this.unlockNextLevel(stateData.currentLevel);

    const { LevelCompletedState } = require('./LevelCompletedState');
    this.changeState(new LevelCompletedState(this.context));
  }

  unlockNextLevel(currentLevel) {
    const maxLevel = Object.keys(this.context.getLevelConfigs()).length;
    const nextLevel = currentLevel + 1;

    if (nextLevel <= maxLevel) {
      const unlockedLevels = this.context.getStateData().unlockedLevels || [1];
      if (!unlockedLevels.includes(nextLevel)) {
        this.context.setStateData({
          unlockedLevels: [...unlockedLevels, nextLevel]
        });
      }
    }
  }

  makeMove(pieceIndex, options = {}) {
    // Não permite movimentos manuais durante resolução automática
    return false;
  }

  solveLevel() {
    // Já está executando resolução automática
    return false;
  }

  goBackToPlaying() {
    const { PlayingState } = require('./PlayingState');
    this.changeState(new PlayingState(this.context));
  }

  goToHome() {
    const { IdleState } = require('./IdleState');
    this.changeState(new IdleState(this.context));
  }

  // Para o timer do PlayingState para evitar conflitos
  stopPlayingTimer() {
    const { PlayingState } = require('./PlayingState');
    const playingState = new PlayingState(this.context);
    if (playingState.timer) {
      playingState.stopTimer();
    }
  }

  // Método auxiliar para tratamento de erros
  handleError(error) {
    // Em produção, aqui poderia ter logging centralizado
    console.error('Erro em SolvingState:', error);
  }
}
