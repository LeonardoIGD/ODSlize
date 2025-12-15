import { GameState } from './GameState';

// Delays entre movimentos da solução
const SOLUTION_DELAYS = {
  SMALL_BOARD: 400,
  MEDIUM_BOARD: 350,
  LARGE_BOARD: 300
};

const BOARD_SIZE_THRESHOLDS = {
  SMALL: 4,
  MEDIUM: 9
};

// State onde o bot resolve o puzzle automaticamente
export class SolvingState extends GameState {
  enter() {
    this.stopPlayingTimer();
    this.context.setStateData({ isSolving: true });
    this.executeSolution();
  }

  exit() {
    this.context.setStateData({ isSolving: false });
  }

  // Executa solução: desfaz moves do user, depois aplica solução salva
  async executeSolution() {
    const stateData = this.context.getStateData();
    const solutionMoves = stateData.solutionMoves || [];
    const moveHistory = stateData.moveHistory || [];
    
    // Valida se tem alguma solução
    if (moveHistory.length === 0 && solutionMoves.length === 0) {
      console.warn('Nenhuma solução disponível');
      this.goBackToPlaying();
      return;
    }

    try {
      if (moveHistory.length > 0) {
        const historyReversed = this.convertHistoryToMoves(moveHistory);
        await this.executeHistoryReverse(historyReversed);
      }
      
      if (solutionMoves.length > 0) {
        await this.executeAllSolutionMoves(solutionMoves);
      }
      
      this.checkSolutionComplete();
    } catch (error) {
      this.handleError(error);
      this.goBackToPlaying();
    }
  }
  
  // Reverte histórico de movimentos (undo)
  convertHistoryToMoves(moveHistory) {
    // Inverte ordem pra desfazer do último pro primeiro
    return moveHistory.slice().reverse();
  }
  
  // Executa undo dos moves do histórico
  async executeHistoryReverse(historyReversed) {
    for (const move of historyReversed) {
      if (this.getStateName() !== 'SolvingState') {
        break;
      }

      const currentState = this.context.getStateData();
      const board = currentState.board;
      const pieceToMove = move.blankIndex;
      
      if (pieceToMove !== null && pieceToMove !== undefined) {
        await this.executeSolutionMove(pieceToMove);
      }
      
      const delay = this.getSolutionDelay();
      await new Promise(resolve => setTimeout(resolve, delay));
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
    this.context.setStateData({ 
      isLevelCompleted: true,
      completedBySolving: true
    });
    this.unlockNextLevel(currentLevel);
    
    const { LevelCompletedState } = require('./LevelCompletedState');
    this.changeState(new LevelCompletedState(this.context));
  }

  // Traduz direção (up/down/left/right) pra índice da peça
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

  // Define delay entre moves baseado no tamanho do board
  getSolutionDelay() {
    const stateData = this.context.getStateData();
    const levelConfig = this.context.getLevelConfig(stateData.currentLevel);
    const totalPieces = levelConfig.size.rows * levelConfig.size.cols;
    
    if (totalPieces <= BOARD_SIZE_THRESHOLDS.SMALL) return SOLUTION_DELAYS.SMALL_BOARD;
    if (totalPieces <= BOARD_SIZE_THRESHOLDS.MEDIUM) return SOLUTION_DELAYS.MEDIUM_BOARD;
    return SOLUTION_DELAYS.LARGE_BOARD;
  }

  // Quando a solução não completa, volta pro PlayingState
  handleIncompleteResolution() {
    console.warn('A solução automática não completou o puzzle perfeitamente');
    
    // NÃO auto-completa o board, deixa user continuar
    this.goBackToPlaying();
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
    const { StartingState } = require('./StartingState');
    this.changeState(new StartingState(this.context));
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
    console.error('Erro em SolvingState:', error);
  }
}
