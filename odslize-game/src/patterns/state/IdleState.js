import { GameState } from './GameState';

export class IdleState extends GameState {
  enter() {
    this.context.setStateData({
      moves: 0,
      timeElapsed: 0,
      isLevelCompleted: false,
      board: [],
      solutionMoves: [],
      isShuffling: false,
      isSolving: false,
      isGameReady: false
    });
  }

  exit() {
    // TODO document why this method 'exit' is empty
  }

  selectLevel(level) {
    this.context.setStateData({
      selectedLevel: level,
      currentLevel: level
    });

    return true;
  }

  startLevel() {
    const { StartingState } = require('./StartingState');
    this.changeState(new StartingState(this.context));
    
    return true;
  }

  makeMove(pieceIndex) {
    return false;
  }

  solveLevel() {
    return false;
  }
}
