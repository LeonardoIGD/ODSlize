import { GameState } from './GameState';
import { checkWinner } from '../strategy/ShufflerStrategy';

const TIMER_INTERVAL_MS = 1000;

// State principal onde o jogo rola
export class PlayingState extends GameState {
  constructor(context) {
    super(context);
    this.timer = null;
  }

  enter() {
    this.context.setStateData({ timeElapsed: 0 });
    this.startTimer();
  }

  exit() {
    this.stopTimer();
  }

  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      const currentTime = this.context.getStateData().timeElapsed || 0;
      this.context.setStateData({
        timeElapsed: currentTime + 1
      });
    }, TIMER_INTERVAL_MS);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // Lógica principal de movimentação de peças
  makeMove(pieceIndex, options = {}) {
    const { isShuffling = false, isSolving = false } = options;
    const stateData = this.context.getStateData();

    if (!stateData.board || !Array.isArray(stateData.board) || stateData.board.length === 0) {
      console.error('makeMove: Board inválido ou não encontrado', stateData.board);
      return false;
    }
    
    if (!this.canMakeMove(stateData, isShuffling, isSolving)) {
      return false;
    }

    const levelConfig = this.context.getLevelConfig(stateData.currentLevel || stateData.selectedLevel || 1);
    
    if (!levelConfig) {
      console.error('Configuração do nível não encontrada:', stateData.currentLevel, stateData.selectedLevel);
      return false;
    }

    const board = [...stateData.board];
    const blankIndex = this.findBlankIndex(board);
    
    if (blankIndex === -1) {
      return false;
    }

    if (!this.isValidMove(pieceIndex, blankIndex, levelConfig)) {
      return false;
    }

    this.executeMove(board, pieceIndex, blankIndex);
    this.updateGameState(board, stateData, isShuffling, isSolving, pieceIndex, blankIndex);
    
    if (!isShuffling && !isSolving) {
      this.checkForWin(board, levelConfig, stateData.currentLevel);
    }

    return true;
  }

  canMakeMove(stateData, isShuffling, isSolving) {
    return isShuffling || isSolving || !stateData.isLevelCompleted;
  }

  findBlankIndex(board) {
    for (let i = 0; i < board.length; i++) {
      const value = board[i];
      if (value === 0 || value === "0" || Number(value) === 0 || value === null || value === undefined) {
        return i;
      }
    }
    return -1;
  }

  isValidMove(pieceIndex, blankIndex, levelConfig) {
    const { cols } = levelConfig.size;
    const pieceRow = Math.floor(pieceIndex / cols);
    const pieceCol = pieceIndex % cols;
    const blankRow = Math.floor(blankIndex / cols);
    const blankCol = blankIndex % cols;

    return (
      (Math.abs(pieceRow - blankRow) === 1 && pieceCol === blankCol) ||
      (Math.abs(pieceCol - blankCol) === 1 && pieceRow === blankRow)
    );
  }

  executeMove(board, pieceIndex, blankIndex) {
    board[blankIndex] = board[pieceIndex];
    board[pieceIndex] = 0;
  }

  // Atualiza state com novo board e incrementa moves
  updateGameState(board, stateData, isShuffling, isSolving, pieceIndex = null, blankIndex = null) {
    const updateData = { board };
    
    if (!isShuffling && !isSolving) {
      updateData.moves = (stateData.moves || 0) + 1;
      
      // Guarda histórico pra poder fazer undo depois
      if (pieceIndex !== null && blankIndex !== null) {
        const moveHistory = stateData.moveHistory || [];
        updateData.moveHistory = [...moveHistory, { pieceIndex, blankIndex }];
      }
    }

    this.context.setStateData(updateData);
  }

  // Checa se ganhou e salva score antes de mudar pro state de vitória
  async checkForWin(board, levelConfig, currentLevel) {
    if (checkWinner(board, levelConfig)) {
      const stateData = this.context.getStateData();
      const { moves = 0, timeElapsed = 0, completedBySolving = false } = stateData;
      
      this.context.setStateData({ 
        isLevelCompleted: true,
        completedBySolving: false
      });
      this.unlockNextLevel(currentLevel);

      await this.saveScore(currentLevel, moves, timeElapsed, completedBySolving);
      
      const { LevelCompletedState } = require('./LevelCompletedState');
      this.changeState(new LevelCompletedState(this.context));
    }
  }

  // Manda score pro backend se user tá logado
  async saveScore(currentLevel, moves, timeElapsed, completedBySolving) {
    try {
      if (completedBySolving) {
        return;
      }
      
      const scoreData = {
        level: currentLevel,
        moves: moves,
        time: timeElapsed
      };

      // Obter informações do usuário se estiver autenticado
      const user = this.context.getCurrentUser ? this.context.getCurrentUser() : null;
      
      if (user && user.userId) {
        // Salvar score do usuário autenticado
        const username = user.displayName || user.username || user.userId;
        const { scoreService } = await import('../../services/scoreService');
        const result = await scoreService.saveUserScore(user.userId, username, scoreData);
      } else {
        // Salvar score local
        const { scoreService } = await import('../../services/scoreService');
        const result = scoreService.saveLocalScore(scoreData);
      }
    } catch (error) {
      console.error('[PlayingState] Falha ao salvar score:', error);
      console.error('Stack trace:', error.stack);
    }
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

  selectLevel(level) {
    // Para o timer atual
    this.stopTimer();
    
    // Atualiza o nível selecionado
    this.context.setStateData({
      selectedLevel: level,
      currentLevel: level,
      moves: 0,
      timeElapsed: 0,
      isLevelCompleted: false,
      completedBySolving: false,
      board: [],
      solutionMoves: [],
      moveHistory: [],
      isShuffling: false,
      isSolving: false,
      isGameReady: false
    });
    const { StartingState } = require('./StartingState');
    this.changeState(new StartingState(this.context));
    
    return true;
  }

  startLevel() {
    // No PlayingState, startLevel significa reiniciar o nível atual
    this.restartLevel();
    return true;
  }

  solveLevel() {
    const { SolvingState } = require('./SolvingState');
    this.changeState(new SolvingState(this.context));
  }

  restartLevel() {
    const { StartingState } = require('./StartingState');
    this.changeState(new StartingState(this.context));
  }

  goToHome() {
    // Retorna ao estado inicial (preparação de novo jogo)
    const { StartingState } = require('./StartingState');
    this.changeState(new StartingState(this.context));
  }
}
