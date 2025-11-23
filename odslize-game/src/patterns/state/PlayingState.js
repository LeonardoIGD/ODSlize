import { GameState } from './GameState';
import { checkWinner } from '../strategy/ShufflerStrategy';

// Constante para intervalo do timer
const TIMER_INTERVAL_MS = 1000;

// Estado de jogo em andamento
export class PlayingState extends GameState {
  constructor(context) {
    super(context);
    this.timer = null;
  }

  enter() {
    const stateData = this.context.getStateData();
    if (!stateData.board || stateData.board.length === 0) {
      const { StartingState } = require('./StartingState');
      this.changeState(new StartingState(this.context));
      return;
    }

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

  makeMove(pieceIndex, options = {}) {
    const { isShuffling = false, isSolving = false } = options;
    const stateData = this.context.getStateData();

    if (!stateData.board || !Array.isArray(stateData.board) || stateData.board.length === 0) {
      console.error('❌ makeMove: Board inválido ou não encontrado', stateData.board);
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
    this.updateGameState(board, stateData, isShuffling, isSolving);
    
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

  updateGameState(board, stateData, isShuffling, isSolving) {
    const updateData = { board };
    
    if (!isShuffling && !isSolving) {
      updateData.moves = (stateData.moves || 0) + 1;
    }

    this.context.setStateData(updateData);
  }

  checkForWin(board, levelConfig, currentLevel) {
    if (checkWinner(board, levelConfig)) {
      this.context.setStateData({ isLevelCompleted: true });
      this.unlockNextLevel(currentLevel);
      
      const { LevelCompletedState } = require('./LevelCompletedState');
      this.changeState(new LevelCompletedState(this.context));
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
      board: [],
      solutionMoves: [],
      isShuffling: false,
      isSolving: false,
      isGameReady: false
    });
    // Volta para IdleState para permitir nova inicialização
    const { IdleState } = require('./IdleState');
    this.changeState(new IdleState(this.context));
    
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
    const { IdleState } = require('./IdleState');
    this.changeState(new IdleState(this.context));
  }
}
