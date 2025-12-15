export class GameState {
  constructor(context) {
    this.context = context;
  }

  changeState(newState) {
    this.exit();
    this.context.setState(newState);
    newState.enter();
  }

  enter() {
    throw new Error('enter() método deve ser implementado pelo estado concreto');
  }

  exit() {
    throw new Error('exit() método deve ser implementado pelo estado concreto');
  }

  selectLevel(level) {
    throw new Error('selectLevel() método não suportado no estado atual');
  }

  startLevel() {
    throw new Error('startLevel() método não suportado no estado atual');
  }

  makeMove(pieceIndex, options = {}) {
    throw new Error('makeMove() método não suportado no estado atual');
  }

  solveLevel() {
    throw new Error('solveLevel() método não suportado no estado atual');
  }

  restartLevel() {
    throw new Error('restartLevel() método não suportado no estado atual');
  }

  startGame() {
    throw new Error('startGame() método não suportado no estado atual');
  }

  goToHome() {
    throw new Error('goToHome() método não suportado no estado atual');
  }

  getStateName() {
    return this.constructor.name;
  }
}

export class GameStateFactory {
  static createState(stateName, context) {
    const states = {
      'StartingState': () => import('./StartingState').then(m => new m.StartingState(context)),
      'PlayingState': () => import('./PlayingState').then(m => new m.PlayingState(context)),
      'SolvingState': () => import('./SolvingState').then(m => new m.SolvingState(context)),
      'LevelCompletedState': () => import('./LevelCompletedState').then(m => new m.LevelCompletedState(context))
    };

    if (!states[stateName]) {
      throw new Error(`Unknown state: ${stateName}`);
    }

    return states[stateName]();
  }
}
