import { GameState } from './GameState';
import { RandomMovesStrategy, createSolvedBoard } from '../strategy/ShufflerStrategy';

// URL do JSON dos ODS no S3
const ODS_API_URL = 'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/data/ods-info.json';

// Cache local dos ODS para evitar múltiplas requisições
let odsCache = null;

export class StartingState extends GameState {
  constructor(context) {
    super(context);
    this.isInitializing = false;
  }

  enter() {
    if (this.isInitializing) {
      return;
    }
    this.initializeLevel();
  }

  exit() {
    this.isInitializing = false;
    this.context.hideODSDisplay();
  }

  // Inicializa o nível selecionado
  async initializeLevel() {
    if (this.isInitializing) {
      return;
    }
    
    this.isInitializing = true;
    
    const stateData = this.context.getStateData();
    const selectedLevel = stateData.selectedLevel || stateData.currentLevel || 1;
    const levelConfig = this.context.getLevelConfig(selectedLevel);

    if (!levelConfig) {
      this.isInitializing = false;
      this.handleError(new Error(`Configuração de nível não encontrada para o nível ${selectedLevel}`));
      return;
    }

    try {
      const odsInfo = await this.loadODSInfo(selectedLevel);
      this.displayODSTitle(odsInfo);

      const solvedBoard = createSolvedBoard(levelConfig);

      const shuffler = new RandomMovesStrategy();
      const shuffleResult = shuffler.shuffle([...solvedBoard], levelConfig);

      const newStateData = {
        currentLevel: selectedLevel,
        moves: 0,
        isLevelCompleted: false,
        board: shuffleResult.board,
        solutionMoves: shuffleResult.solutionMoves,
        isShuffling: false,
        isGameReady: true,
        currentODS: odsInfo
      };

      this.context.setStateData(newStateData);

      this.isInitializing = false;

    } catch (error) {
      this.isInitializing = false;
      this.handleError(error);
    }
  }

  // Carrega informações do ODS da API ou cache
  async loadODSInfo(level) {
    try {
      if (odsCache) {
        return this.getODSForLevel(level, odsCache);
      }

      const response = await fetch(ODS_API_URL);
      if (!response.ok) {
        throw new Error(`Erro ao carregar ODS: ${response.status}`);
      }

      odsCache = await response.json();
      return this.getODSForLevel(level, odsCache);

    } catch (error) {
      this.handleError(new Error(`Falha ao carregar ODS da API: ${error.message}`));
      return this.getFallbackODS(level);
    }
  }

  // Obtém dados do ODS para o nível atual
  getODSForLevel(level, odsData) {
    const odsIndex = level - 1;
    
    if (odsData?.[odsIndex]) {
      return {
        code: odsData[odsIndex].ods_code,
        title: odsData[odsIndex].title,
        description: odsData[odsIndex].description,
        logoUrl: odsData[odsIndex].logo_url,
        link: odsData[odsIndex].link
      };
    }

    return this.getFallbackODS(level);
  }

  // Fallback estático caso a API falhe ou não tenha dados
  getFallbackODS(level) {
    const fallbackODS = [
      {
        code: 'ODS001',
        title: 'ERRADICAÇÃO DA POBREZA',
        description: 'Acabar com a pobreza em todas as suas formas, em todos os lugares.',
        logoUrl: '',
        link: 'https://brasil.un.org/pt-br/sdgs/1'
      },
      {
        code: 'ODS002',
        title: 'FOME ZERO E AGRICULTURA SUSTENTÁVEL',
        description: 'Acabar com a fome, alcançar a segurança alimentar e melhoria da nutrição.',
        logoUrl: '',
        link: 'https://brasil.un.org/pt-br/sdgs/2'
      },
      {
        code: 'ODS003',
        title: 'SAÚDE E BEM-ESTAR',
        description: 'Assegurar uma vida saudável e promover o bem-estar para todos.',
        logoUrl: '',
        link: 'https://brasil.un.org/pt-br/sdgs/3'
      },
      {
        code: 'ODS004',
        title: 'EDUCAÇÃO DE QUALIDADE',
        description: 'Assegurar a educação inclusiva e equitativa de qualidade.',
        logoUrl: '',
        link: 'https://brasil.un.org/pt-br/sdgs/4'
      }
    ];

    const odsIndex = (level - 1) % fallbackODS.length;
    return fallbackODS[odsIndex];
  }

  // Atualiza o display do ODS no header
  displayODSTitle(odsInfo) {
    this.context.updateODSDisplay({
      title: odsInfo.title,
      code: odsInfo.code,
      logoUrl: odsInfo.logoUrl
    });
  }

  startLevel() {
    // No StartingState, inicializar já embaralha automaticamente
    // Este método existe apenas para compatibilidade da interface
    this.initializeLevel();
  }

  makeMove(pieceIndex, options = {}) {
    // Não permite movimentos durante preparação ou embaralhamento
    return false;
  }

  solveLevel() {
    // Não permite solução automática durante preparação
    return false;
  }

  selectLevel(level) {
    this.isInitializing = false;
    this.context.setStateData({
      selectedLevel: level,
      currentLevel: level
    });

    this.initializeLevel();
    return true;
  }

  revealBoard() {
    const { PlayingState } = require('./PlayingState');
    this.changeState(new PlayingState(this.context));
    return true;
  }

  restartLevel() {
    this.initializeLevel();
  }

  goToHome() {
    const { IdleState } = require('./IdleState');
    this.changeState(new IdleState(this.context));
  }

  handleError(error) {
    console.error('Erro em StartingState:', error);

    const { IdleState } = require('./IdleState');
    this.changeState(new IdleState(this.context));
  }
}
