import { GameState } from './GameState';
import { scoreService } from '../../services/scoreService';

// Cores dos ODS baseadas no padrão oficial da ONU
const ODS_COLORS = {
  'ODS001': '#e5243b', // Vermelho
  'ODS002': '#dda63a', // Amarelo dourado
  'ODS003': '#4c9f38', // Verde
  'ODS004': '#c5192d', // Vermelho escuro
  'ODS005': '#ff3a21', // Laranja avermelhado
  'ODS006': '#26bde2', // Azul claro
  'ODS007': '#fcc30b', // Amarelo
  'ODS008': '#a21942', // Roxo escuro
  'ODS009': '#fd6925', // Laranja
  'ODS010': '#dd1367', // Rosa
  'ODS011': '#fd9d24', // Laranja claro
  'ODS012': '#bf8b2e', // Amarelo escuro
  'ODS013': '#3f7e44', // Verde escuro
  'ODS014': '#0a97d9', // Azul
  'ODS015': '#56c02b', // Verde claro
  'ODS016': '#00689d', // Azul escuro
  'ODS017': '#19486a'  // Azul marinho
};

// Estado quando o nível é completado
export class LevelCompletedState extends GameState {
  async enter() {
    await this.saveScore();
    this.displayCompletionModal();
  }

  async saveScore() {
    try {
      const stateData = this.context.getStateData();
      const { moves = 0, timeElapsed = 0, currentLevel = 1 } = stateData;
      
      const scoreData = {
        level: currentLevel,
        moves: moves,
        time: timeElapsed
      };

      // Obter informações do usuário se estiver autenticado
      const user = this.context.getCurrentUser ? this.context.getCurrentUser() : null;
      
      if (user && user.userId) {
        // Salvar score do usuário autenticado
        await scoreService.saveUserScore(user.userId, scoreData);
        console.log('Score saved for authenticated user:', user.userId);
      } else {
        // Salvar score local
        scoreService.saveLocalScore(scoreData);
        console.log('Score saved locally');
      }
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  }

  exit() {
    this.hideCompletionModal();
  }

  displayCompletionModal() {
    const stateData = this.context.getStateData();
    const { moves = 0, timeElapsed = 0, currentLevel = 1, currentODS } = stateData;
    
    const odsInfo = this.prepareODSInfo(currentODS);
    const completionStats = this.calculateCompletionStats(moves, timeElapsed);
    
    // Dispara evento para exibir modal na UI
    this.context.showCompletionModal({
      levelCompleted: currentLevel,
      stats: completionStats,
      odsInfo: odsInfo,
      onNextLevel: () => this.goToNextLevel(),
      onRestart: () => this.restartLevel(),
      onHome: () => this.goToHome(),
      onClose: () => this.closeModalAndReturnToGame()
    });
  }

  hideCompletionModal() {
    // Esconde modal quando sair do estado
    this.context.hideCompletionModal();
  }

  prepareODSInfo(currentODS) {
    if (!currentODS) {
      // Fallback caso não tenha informações do ODS
      return {
        title: 'Objetivo de Desenvolvimento Sustentável',
        description: 'Parabéns por completar este nível!',
        link: 'https://brasil.un.org/pt-br/sdgs',
        color: '#4c9f38'
      };
    }

    // Usa as informações já carregadas do StartingState
    return {
      title: currentODS.title,
      description: currentODS.description,
      link: currentODS.link,
      logoUrl: currentODS.logoUrl,
      code: currentODS.code,
      color: this.getODSColor(currentODS.code)
    };
  }

  getODSColor(odsCode) {
    return ODS_COLORS[odsCode] || '#4c9f38'; // Verde padrão se não encontrar a cor
  }

  calculateCompletionStats(moves, timeElapsed) {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    
    return {
      moves,
      time: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      timeInSeconds: timeElapsed,
      performance: this.getPerformanceRating(moves, timeElapsed)
    };
  }

  getPerformanceRating(moves, timeElapsed) {
    // Sistema simples de avaliação baseado em movimentos e tempo
    const timeScore = timeElapsed < 60 ? 3 : timeElapsed < 120 ? 2 : 1;
    const moveScore = moves < 20 ? 3 : moves < 40 ? 2 : 1;
    const totalScore = timeScore + moveScore;
    
    if (totalScore >= 5) return { rating: 'Excelente', stars: 3 };
    if (totalScore >= 3) return { rating: 'Bom', stars: 2 };
    return { rating: 'Pode Melhorar', stars: 1 };
  }

  makeMove() {
    return false;
  }

  solveLevel() {
    return false;
  }

  startLevel() {
    // Reinicia o nível atual
    this.restartLevel();
    return true;
  }

  selectLevel(level) {
    this.hideCompletionModal();
    
    // Atualiza o nível selecionado e vai para StartingState
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
    
    const { StartingState } = require('./StartingState');
    this.changeState(new StartingState(this.context));
    return true;
  }

  restartLevel() {
    this.hideCompletionModal();
    const { StartingState } = require('./StartingState');
    this.changeState(new StartingState(this.context));
  }

  goToNextLevel() {
    const stateData = this.context.getStateData();
    const nextLevel = stateData.currentLevel + 1;
    const maxLevel = Object.keys(this.context.getLevelConfigs()).length;
    
    if (nextLevel <= maxLevel) {
      this.hideCompletionModal();
      this.context.setStateData({ currentLevel: nextLevel });
      const { StartingState } = require('./StartingState');
      this.changeState(new StartingState(this.context));
    } else {
      this.showAllLevelsCompletedMessage();
    }
  }

  goToHome() {
    this.hideCompletionModal();
    const { IdleState } = require('./IdleState');
    this.changeState(new IdleState(this.context));
  }

  closeModalAndReturnToGame() {
    this.hideCompletionModal();
    const { StartingState } = require('./StartingState');
    this.changeState(new StartingState(this.context));
  }

  showAllLevelsCompletedMessage() {
    this.context.showAllLevelsCompletedModal({
      totalLevels: Object.keys(this.context.getLevelConfigs()).length,
      onHome: () => this.goToHome()
    });
  }
}
