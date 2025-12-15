import { GameState } from './GameState';

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
    const moveHistory = stateData.moveHistory || [];
    
    // Verifica se há alguma solução disponível
    if (moveHistory.length === 0 && solutionMoves.length === 0) {
      console.warn('⚠️ Nenhuma solução disponível');
      this.goBackToPlaying();
      return;
    }

    try {
      // PRIMEIRO: Desfazer movimentos do usuário (se houver)
      if (moveHistory.length > 0) {
        const historyReversed = this.convertHistoryToMoves(moveHistory);
        await this.executeHistoryReverse(historyReversed);
      }
      
      // SEGUNDO: Executar passos da solução original
      if (solutionMoves.length > 0) {
        await this.executeAllSolutionMoves(solutionMoves);
      }
      
      this.checkSolutionComplete();
    } catch (error) {
      // Em caso de erro, retorna ao estado de jogo
      this.handleError(error);
      this.goBackToPlaying();
    }
  }
  
  // Converte histórico de movimentos em lista de índices para desfazer
  convertHistoryToMoves(moveHistory) {
    // Inverter o histórico para desfazer do último para o primeiro
    return moveHistory.slice().reverse();
  }
  
  // Executa movimentos baseado no histórico (desfazendo)
  async executeHistoryReverse(historyReversed) {
    for (const move of historyReversed) {
      if (this.getStateName() !== 'SolvingState') {
        break;
      }

      // No histórico, temos pieceIndex e blankIndex
      // Para desfazer, movemos a peça que está no blankIndex de volta
      const currentState = this.context.getStateData();
      const board = currentState.board;
      
      // Encontrar onde está a peça que foi movida
      // A peça que estava em pieceIndex agora está em blankIndex
      // Então movemos de volta: a peça em blankIndex volta para pieceIndex
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
      completedBySolving: true // Vitória usando botão resolver, não salvar score
    });
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
    console.warn('⚠️ A solução automática não completou o puzzle perfeitamente');
    
    // NÃO auto-completar o tabuleiro
    // Apenas voltar ao estado de jogo para o usuário continuar
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
    // Em produção, aqui poderia ter logging centralizado
    console.error('Erro em SolvingState:', error);
  }
}
