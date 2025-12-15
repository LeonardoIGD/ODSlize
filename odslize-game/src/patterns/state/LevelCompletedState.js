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
    // Score já foi salvo no PlayingState antes de entrar neste estado
    await this.loadBestScore();
    this.displayCompletionModal();
  }

  async loadBestScore() {
    try {
      const stateData = this.context.getStateData();
      const { currentLevel = 1 } = stateData;
      
      // Obter informações do usuário se estiver autenticado
      const user = this.context.getCurrentUser ? this.context.getCurrentUser() : null;
      
      if (user && user.userId) {
        
        const { bestScore, totalGames } = await scoreService.getUserScoresByLevel(user.userId, currentLevel);
        
        if (bestScore) {
          this.context.setStateData({ 
            bestScore: bestScore,
            totalGamesThisLevel: totalGames
          });
        } 
      }
    } catch (error) {
      console.error('[LevelCompletedState] Falha ao buscar melhor score:', error);
    }
  }

  exit() {
    this.hideCompletionModal();
  }

  displayCompletionModal() {
    const stateData = this.context.getStateData();
    const { moves = 0, timeElapsed = 0, currentLevel = 1, currentODS, bestScore, totalGamesThisLevel } = stateData;
    
    const odsInfo = this.prepareODSInfo(currentODS);
    const completionStats = this.calculateCompletionStats(moves, timeElapsed, bestScore);
    
    // Dispara evento para exibir modal na UI
    this.context.showCompletionModal({
      levelCompleted: currentLevel,
      stats: completionStats,
      odsInfo: odsInfo,
      bestScore: bestScore,
      totalGamesThisLevel: totalGamesThisLevel,
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

  calculateCompletionStats(moves, timeElapsed, bestScore) {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    
    const stats = {
      moves,
      time: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      timeInSeconds: timeElapsed,
      performance: this.getPerformanceRating(moves, timeElapsed)
    };

    // Adicionar informações do melhor tempo se disponível
    if (bestScore) {
      const bestMinutes = Math.floor(bestScore.time / 60);
      const bestSeconds = bestScore.time % 60;
      
      stats.bestTime = `${bestMinutes}:${bestSeconds.toString().padStart(2, '0')}`;
      stats.bestTimeInSeconds = bestScore.time;
      stats.bestMoves = bestScore.movements;
      stats.isNewBest = timeElapsed < bestScore.time;
      stats.timeDifference = timeElapsed - bestScore.time;
    }

    return stats;
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
    // Retorna ao início reiniciando com o nível 1
    this.context.setStateData({
      selectedLevel: 1,
      currentLevel: 1
    });
    const { StartingState } = require('./StartingState');
    this.changeState(new StartingState(this.context));
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
