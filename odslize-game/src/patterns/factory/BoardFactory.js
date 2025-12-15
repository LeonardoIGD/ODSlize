

import { createSolvedBoard } from '../strategy/ShufflerStrategy';


export class BoardFactory {
  // Factory que cria board baseado no tipo de nível
  static async createBoard(levelConfig, shufflerStrategy) {
    const boardType = this.determineBoardType(levelConfig);

    switch (boardType) {
      case '2x2':
        return this.create2x2Board(levelConfig, shufflerStrategy);
      case '3x3':
        return this.create3x3Board(levelConfig, shufflerStrategy);
      case '4x4':
        return this.create4x4Board(levelConfig, shufflerStrategy);
      case '3x6':
        return this.create3x6Board(levelConfig, shufflerStrategy);
      default:
        throw new Error(`Tipo de tabuleiro não suportado: ${boardType}`);
    }
  }

  // Detecta tipo do board pelo tamanho (2x2, 3x3, 4x4, 3x6)
  static determineBoardType(levelConfig) {
    const { rows, cols } = levelConfig.size;
    const totalTiles = rows * cols;

    if (totalTiles <= 4) {
      return '2x2';
    } else if (totalTiles <= 9) {
      return '3x3';
    } else if (totalTiles <= 16) {
      return '4x4';
    } else {
      return '3x6';
    }
  }

  // Board 2x2 - embaralhamento leve
  static async create2x2Board(levelConfig, shufflerStrategy) {
    return this.createBaseBoard(levelConfig, shufflerStrategy, {
      animationDelay: 100,
      shuffleIntensity: 'light'
    });
  }

  // Board 3x3 - embaralhamento médio
  static async create3x3Board(levelConfig, shufflerStrategy) {
    return this.createBaseBoard(levelConfig, shufflerStrategy, {
      animationDelay: 150,
      shuffleIntensity: 'medium'
    });
  }

  // Board 4x4 - embaralhamento pesado
  static async create4x4Board(levelConfig, shufflerStrategy) {
    return this.createBaseBoard(levelConfig, shufflerStrategy, {
      animationDelay: 200,
      shuffleIntensity: 'heavy'
    });
  }

  // Board 3x6 - embaralhamento extremo
  static async create3x6Board(levelConfig, shufflerStrategy) {
    return this.createBaseBoard(levelConfig, shufflerStrategy, {
      animationDelay: 250,
      shuffleIntensity: 'extreme'
    });
  }

  // Método base que cria e embaralha qualquer board
  static async createBaseBoard(levelConfig, shufflerStrategy, options = {}) {
    try {
      const solvedBoard = createSolvedBoard(levelConfig);
      const shuffleResult = shufflerStrategy.shuffle(solvedBoard, levelConfig);

      return {
        board: shuffleResult.board,
        solutionMoves: shuffleResult.solutionMoves,
        levelConfig,
        metadata: {
          createdAt: new Date().toISOString(),
          boardType: this.determineBoardType(levelConfig),
          options,
          totalTiles: levelConfig.size.rows * levelConfig.size.cols,
          difficulty: levelConfig.difficulty || '2x2'
        }
      };
    } catch (error) {
      console.error('Erro ao criar tabuleiro:', error);
      throw new Error(`Falha ao criar tabuleiro: ${error.message}`);
    }
  }

  // Valida se config do nível tá com os dados necessários
  static validateLevelConfig(levelConfig) {
    if (!levelConfig) {
      throw new Error('A configuração de nível é obrigatória');
    }

    if (!levelConfig?.size?.rows || !levelConfig?.size?.cols) {
      throw new Error('A configuração de nível deve incluir tamanho com linhas e colunas');
    }

    if (levelConfig?.size?.rows <= 1 || levelConfig?.size?.cols <= 1) {
      throw new Error('O tabuleiro deve ter pelo menos 2x2');
    }

    return true;
  }

  // Cria board vazio com espaço em branco no final
  static createEmptyBoard(rows, cols) {
    const size = rows * cols;
    return Array.from({ length: size }, (_, index) => 
      index === size - 1 ? 0 : index + 1
    );
  }

  // Clona board pra evitar mutação acidental
  static cloneBoard(board) {
    return [...board];
  }
}