import { GameState } from './GameState';
import { RandomMovesStrategy, createSolvedBoard } from '../strategy/ShufflerStrategy';

// URL do JSON dos ODS no S3
const ODS_API_URL = 'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/data/ods-info.json';
const ODS_INFO = [
  {
      "ods_code": "ODS001",
      "title": "ERRADICAÇÃO DA POBREZA",
      "description": "Sabia que o ODS 1 busca ERRADICAR A POBREZA em todas as suas formas e em todos os lugares?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-1.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/1"
  },
  {
      "ods_code": "ODS002",
      "title": "FOME ZERO E AGRICULTURA SUSTENTÁVEL",
      "description": "Você sabia que o ODS 2 promove a FOME ZERO E AGRICULTURA SUSTENTÁVEL, a fim de alcançar a segurança alimentar e melhoria da nutrição?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-2.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/2"
  },
  {
      "ods_code": "ODS003",
      "title": "SAÚDE E BEM-ESTAR",
      "description": "Sabia que o ODS 3 almeja a SAÚDE E BEM-ESTAR para todas e todos, em todas as idades?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-3.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/3"
  },
  {
      "ods_code": "ODS004",
      "title": "EDUCAÇÃO DE QUALIDADE",
      "description": "Você sabia que o ODS 4 procura assegurar EDUCAÇÃO DE QUALIDADE, inclusiva e equitativa, e promover oportunidades de aprendizagem ao longo da vida para todas e todos?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-4.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/4"
  },
  {
      "ods_code": "ODS005",
      "title": "IGUALDADE DE GÊNERO",
      "description": "Sabia que o ODS 5 tem como objetivo alcançar a IGUALDADE DE GÊNERO e empoderar todas as mulheres e meninas?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-5.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/5"
  },
  {
      "ods_code": "ODS006",
      "title": "ÁGUA POTÁVEL E SANEAMENTO",
      "description": "Você sabia que o ODS 6 sobre ÁGUA POTÁVEL E SANEAMENTO é responsável por assegurar a disponibilidade e gestão sustentável da água e saneamento para todas e todos?",    
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-6.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/6"
  },
  {
      "ods_code": "ODS007",
      "title": "ENERGIA LIMPA E ACESSÍVEL",
      "description": "Sabia que o ODS 7 de ENERGIA LIMPA E ACESSÍVEL é responsável por assegurar o acesso confiável, sustentável, moderno e a preço acessível à energia para todas e todos?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-7.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/7"
  },
  {
      "ods_code": "ODS008",
      "title": "TRABALHO DECENTE E CRESCIMENTO ECONÔMICO",
      "description": "Você sabia que promover o CRESCIMENTO ECONÔMICO sustentado, inclusivo e sustentável, emprego pleno e produtivo e TRABALHO DECENTE para todas e todos é o propósito do ODS 8?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-8.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/8"
  },
  {
      "ods_code": "ODS009",
      "title": "INDÚSTRIA, INOVAÇÃO E INFRAESTRUTURA",
      "description": "Sabia que o ODS 9 sobre INDÚSTRIA, INOVAÇÃO E INFRAESTRUTURA procura construir infraestruturas resilientes, promover a industrialização inclusiva e sustentável e fomentar a inovação?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-9.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/9"
  },
  {
      "ods_code": "ODS010",
      "title": "REDUÇÃO DAS DESIGUALDADES",
      "description": "Você sabia que REDUZIR AS DESIGUALDADES dentro dos países e entre eles é o principal objetivo do ODS 10?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-10.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/10"
  },
  {
      "ods_code": "ODS011",
      "title": "CIDADES E COMUNIDADES SUSTENTÁVEIS",
      "description": "Sabia que tornar as CIDADES E COMUNIDADES inclusivas, seguras, resilientes e SUSTENTÁVEIS é a finalidade do ODS 11?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-11.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/11"
  },
  {
      "ods_code": "ODS012",
      "title": "CONSUMO E PRODUÇÃO RESPONSÁVEIS",
      "description": "Você sabia que assegurar padrões de CONSUMO sustentáveis e PRODUÇÃO RESPONSÁVEIS é a finalidade do ODS 12?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-12.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/12"
  },
  {
      "ods_code": "ODS013",
      "title": "AÇÃO CONTRA A MUDANÇA GLOBAL DO CLIMA",
      "description": "Sabia que tomar medidas urgentes CONTRA A MUDANÇA GLOBAL DO CLIMA e seus impactos é o objetivo do ODS 13?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-13.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/13"
  },
  {
      "ods_code": "ODS0014",
      "title": "VIDA NA ÁGUA",
      "description": "Você sabia que o ODS 14 de VIDA NA ÁGUA procura realizar a conservação e uso sustentável dos oceanos, dos mares e dos recursos marinhos para o desenvolvimento sustentável?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-14.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/14"
  },
  {
      "ods_code": "ODS015",
      "title": "VIDA TERRESTRE",
      "description": "Sabia que o ODS 15 de VIDA TERRESTRE busca proteger, recuperar e promover o uso sustentável dos ecossistemas terrestres, gerir de forma sustentável as florestas, combater a desertificação, deter e reverter a degradação da terra e deter a perda de biodiversidade?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-15.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/15"
  },
  {
      "ods_code": "ODS016",
      "title": "PAZ, JUSTIÇA E INSTITUIÇÕES EFICAZES",
      "description": "Você sabia que o ODS 16 tem como objetivo promover a PAZ e inclusão para o desenvolvimento sustentável, proporcionar o acesso à JUSTIÇA para todos e construir INSTITUIÇÕES EFICAZES, responsáveis e inclusivas em todos os níveis?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-16.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/16"
  },
  {
      "ods_code": "ODS017",
      "title": "PARCERIAS E MEIOS DE IMPLEMENTAÇÃO",
      "description": "Sabia que fortalecer as PARCERIAS E MEIOS DE IMPLEMENTAÇÃO e revitalizar a parceria global para o desenvolvimento sustentável é o propósito do ODS 17?",
      "logo_url": "https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-17.svg",
      "link": "https://brasil.un.org/pt-br/sdgs/17"
  }
];

// Cache local dos ODS para evitar múltiplas requisições
let odsCache = null;

export class StartingState extends GameState {
  constructor(context) {
    super(context);
    this.isInitializing = false;
  }

  enter() {
    // Inicializa apenas os valores básicos do estado
    const stateData = this.context.getStateData();
    const selectedLevel = stateData.selectedLevel || stateData.currentLevel || 1;

    this.context.setStateData({
      selectedLevel: selectedLevel,
      currentLevel: selectedLevel,
      moves: 0,
      timeElapsed: 0,
      isLevelCompleted: false,
      completedBySolving: false,
      board: [],
      solutionMoves: [],
      isShuffling: false,
      isSolving: false,
      isGameReady: false,
      currentODS: null
    });
  }

  exit() {
    this.isInitializing = false;
    this.context.hideODSDisplay();
  }

  // Inicia o jogo - chamado quando o usuário apertar "Jogar Agora!"
  async startLevel() {
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
        moveHistory: [],
        isShuffling: false,
        isGameReady: true,
        currentODS: odsInfo
      };

      this.context.setStateData(newStateData);
      this.isInitializing = false;

      // Transiciona para o estado de jogo
      const { PlayingState } = require('./PlayingState');
      this.changeState(new PlayingState(this.context));
      
    } catch (error) {
      this.isInitializing = false;
      this.handleError(error);
    }
  }

  // Carrega informações do ODS da API ou cache
  async loadODSInfo(level) {
    try {
      // Se já tem cache, usa o cache
      if (odsCache) {
        return this.getODSForLevel(level, odsCache);
      }

      // Tenta carregar da API
      const response = await fetch(ODS_API_URL);

      if (!response.ok) {
        throw new Error(`Erro ao carregar ODS: ${response.status}`);
      }

      // Parse do JSON da resposta
      const odsData = await response.json();

      // Armazena no cache para próximas consultas
      odsCache = odsData;
      return this.getODSForLevel(level, odsCache);

    } catch (error) {
      console.warn(`Falha ao carregar ODS da API: ${error.message}. Usando dados estáticos.`);
      
      // Em caso de erro, usa os dados estáticos apenas uma vez e armazena no cache
      if (!odsCache) {
        odsCache = ODS_INFO;
      }
      
      return this.getODSForLevel(level, odsCache);
    }
  }

  // Obtém dados do ODS para o nível atual
  getODSForLevel(level, odsData) {
    const odsQuantity = odsData.length;
    const randomIndex = Math.floor(Math.random() * odsQuantity);
    
    if (odsData?.[randomIndex]) {
      return {
        code: odsData[randomIndex].ods_code,
        title: odsData[randomIndex].title,
        description: odsData[randomIndex].description,
        logoUrl: odsData[randomIndex].logo_url,
        link: odsData[randomIndex].link
      };
    }

    // Fallback para o primeiro ODS se não conseguir obter um aleatório
    return {
      code: odsData[0].ods_code,
      title: odsData[0].title,
      description: odsData[0].description,
      logoUrl: odsData[0].logo_url,
      link: odsData[0].link
    };
  }

  // Atualiza o display do ODS no header
  displayODSTitle(odsInfo) {
    this.context.updateODSDisplay({
      title: odsInfo.title,
      code: odsInfo.code,
      logoUrl: odsInfo.logoUrl
    });
  }

  makeMove(pieceIndex, options = {}) {
    // Método inativo no StartingState
  }

  solveLevel() {
    // Método inativo no StartingState
  }

  selectLevel(level) {
    // Atualiza o nível selecionado E o nível atual
    this.context.setStateData({
      selectedLevel: level,
      currentLevel: level
    });
    return true;
  }

  revealBoard() {
    // Método inativo no StartingState
  }

  restartLevel() {
    // Método inativo no StartingState
  }

  goToHome() {
    // Método inativo no StartingState
  }

  handleError(error) {
    console.error('Erro em StartingState:', error);
    this.isInitializing = false;
  }
}
