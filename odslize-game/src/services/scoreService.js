class ScoreService {
  constructor() {
    this.storageKey = 'odslize_scores';
    this.apiBaseUrl = 'https://63ip9pdb30.execute-api.us-east-1.amazonaws.com/prod-v1';
  }

  // Pega scores salvos no localStorage
  getLocalScores() {
    try {
      const scores = localStorage.getItem(this.storageKey);
      return scores ? JSON.parse(scores) : [];
    } catch (error) {
      console.error('Error loading local scores:', error);
      return [];
    }
  }

  // Salva score no localStorage (user não logado)
  saveLocalScore(scoreData) {
    try {
      const scores = this.getLocalScores();
      const newScore = {
        id: Date.now().toString(),
        level: scoreData.level,
        moves: scoreData.moves,
        time: scoreData.time,
        timestamp: new Date().toISOString(),
        userId: null
      };

      scores.push(newScore);

      // Limita a 50 scores pra não lotar o storage
      const sortedScores = scores.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const limitedScores = sortedScores.slice(0, 50);

      localStorage.setItem(this.storageKey, JSON.stringify(limitedScores));
      return newScore;
    } catch (error) {
      console.error('Error saving local score:', error);
      return null;
    }
  }

  // Busca todos os scores do user na API
  async getUserScores(userId) {
    try {
      if (!userId) return [];

      const response = await fetch(`${this.apiBaseUrl}/score?userId=${encodeURIComponent(userId)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return Array.isArray(data) ? data : (data.scores || []);
    } catch (error) {
      const userStorageKey = `${this.storageKey}_user_${userId}`;
      const scores = localStorage.getItem(userStorageKey);

      return scores ? JSON.parse(scores) : [];
    }
  }

  // Pega melhor score do user em um nível específico
  async getUserScoresByLevel(userId, level) {
    try {
      if (!userId || !level) {
        return { bestScore: null, totalGames: 0 };
      }

      const url = `${this.apiBaseUrl}/score?userId=${encodeURIComponent(userId)}&level=${encodeURIComponent(level)}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Erro ao buscar scores:', response.status);
        return { bestScore: null, totalGames: 0 };
      }

      const data = await response.json();
      
      // Parse do body se necessário
      const parsedData = typeof data.body === 'string' ? JSON.parse(data.body) : data;
      const scores = parsedData.scores || [];
      
      if (scores.length === 0) {
        return { bestScore: null, totalGames: 0 };
      }

      // Encontrar o melhor score (menor tempo)
      const bestScore = scores.reduce((best, current) => {
        if (!best || current.time < best.time) {
          return current;
        }
        return best;
      }, null);

      return {
        bestScore: bestScore,
        totalGames: scores.length,
        allScores: scores
      };
    } catch (error) {
      console.error('Erro ao buscar scores por nível:', error);
      return { bestScore: null, totalGames: 0 };
    }
  }

  // Busca top 10 ranking de um nível
  async getLeaderboard(level) {
    try {
      if (!level) {
        console.error('Level não fornecido');
        return { topScores: [], totalPlayers: 0 };
      }

      const url = `${this.apiBaseUrl}/leaderboard?level=${encodeURIComponent(level)}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Erro ao buscar leaderboard:', response.status);
        return { topScores: [], totalPlayers: 0 };
      }

      const data = await response.json();
      
      return {
        message: data.message,
        level: data.level,
        totalPlayers: data.totalPlayers,
        topScores: data.topScores || [],
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Erro ao buscar leaderboard:', error);
      return { topScores: [], totalPlayers: 0 };
    }
  }

  // Manda score do user logado pra API
  async saveUserScore(userId, username, scoreData) {
    try {
      if (!userId) {
        console.error('userId não fornecido');
        return null;
      }
      if (!username) {
        console.warn('Username não fornecido, usando userId como fallback');
        username = userId;
      }
      
      const newScore = {
        userId: userId,
        username: username,
        level: String(scoreData.level),
        movements: Number.parseInt(scoreData.moves, 10),
        time: Number.parseInt(scoreData.time, 10)
      };

      // Tentar salvar via API
      const response = await fetch(`${this.apiBaseUrl}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newScore)
      });
      
      
      if (response.ok) {
        const savedScore = await response.json();
        return savedScore;
      } else {
        const errorText = await response.text();
        console.error('Erro HTTP ao salvar score:');
        console.error('   Status:', response.status);
        console.error('   Status Text:', response.statusText);
        console.error('   Response Body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao salvar score na API:', error.message);
      console.error('   Tipo de erro:', error.name);
      console.error('   Stack:', error.stack);
      
      // Fallback para localStorage em caso de erro na API
      try {
        const userStorageKey = `${this.storageKey}_user_${userId}`;
        const scores = await this.getUserScores(userId);
        
        const newScore = {
          id: Date.now().toString(),
          level: scoreData.level,
          moves: scoreData.moves,
          time: scoreData.time,
          timestamp: new Date().toISOString(),
          userId: userId
        };
        
        scores.push(newScore);
        localStorage.setItem(userStorageKey, JSON.stringify(scores));
        return newScore;
      } catch (fallbackError) {
        console.error('Erro ao salvar no localStorage:', fallbackError);
        return null;
      }
    }
  }

  // Retorna melhores scores agrupados por nível
  async getBestScores(userId = null, level = null) {
    try {
      let scores = [];
      
      if (userId) {
        scores = await this.getUserScores(userId);
      } else {
        scores = this.getLocalScores();
      }

      if (level) {
        scores = scores.filter(score => score.level === level);
      }

      // Agrupar por nível e pegar o melhor score de cada
      const bestByLevel = {};
      scores.forEach(score => {
        const levelKey = score.level;
        if (!bestByLevel[levelKey] || this.isBetterScore(score, bestByLevel[levelKey])) {
          bestByLevel[levelKey] = score;
        }
      });

      return Object.values(bestByLevel).sort((a, b) => a.level - b.level);
    } catch (error) {
      console.error('Error getting best scores:', error);
      return [];
    }
  }

  // Compara dois scores pra ver qual é melhor (menos movimentos/tempo)
  isBetterScore(newScore, existingScore) {
    if (newScore.moves !== existingScore.moves) {
      return newScore.moves < existingScore.moves;
    }
    return newScore.time < existingScore.time;
  }

  // Calcula estatísticas do user (total de jogos, melhor nível, etc)
  async getUserStats(userId = null) {
    try {
      let scores = [];
      
      if (userId) {
        // Para usuários autenticados, tentar buscar estatísticas da API
        try {
          const response = await fetch(`${this.apiBaseUrl}/score?userId=${encodeURIComponent(userId)}`);
          
          if (response.ok) {
            const data = await response.json();
            scores = Array.isArray(data) ? data : (data.scores || []);
          } else {
            // Se a API falhar, usar getUserScores como fallback
            scores = await this.getUserScores(userId);
          }
        } catch (apiError) {
          console.error('Error fetching stats from API, using fallback:', apiError);
          scores = await this.getUserScores(userId);
        }
      } else {
        scores = this.getLocalScores();
      }

      if (scores.length === 0) {
        return {
          totalGames: 0,
          levelsCompleted: 0,
          averageMoves: 0,
          averageTime: 0,
          bestLevel: 0,
          bestTime: 0
        };
      }

      const uniqueLevels = [...new Set(scores.map(score => score.level))];
      const totalMoves = scores.reduce((sum, score) => sum + score.moves, 0);
      const totalTime = scores.reduce((sum, score) => sum + score.time, 0);
      const bestLevel = Math.max(...scores.map(score => score.level));
      const bestTime = Math.min(...scores.map(score => score.time));

      return {
        totalGames: scores.length,
        levelsCompleted: uniqueLevels.length,
        averageMoves: Math.round(totalMoves / scores.length),
        averageTime: Math.round(totalTime / scores.length),
        bestLevel: bestLevel,
        bestTime: bestTime
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalGames: 0,
        levelsCompleted: 0,
        averageMoves: 0,
        averageTime: 0,
        bestLevel: 0,
        bestTime: 0
      };
    }
  }

  // Move scores do localStorage pro user logado na API
  async migrateLocalScoresToUser(userId, username) {
    try {
      const localScores = this.getLocalScores();
      if (localScores.length === 0) return;

      if (!username) {
        console.warn('Username não fornecido para migração, usando userId como fallback');
        username = userId;
      }

      // Tentar migrar cada score para a API
      let successCount = 0;
      const failedScores = [];

      for (const score of localScores) {
        try {
          const scoreData = {
            level: score.level,
            moves: score.moves,
            time: score.time,
            timestamp: score.timestamp
          };

          const savedScore = await this.saveUserScore(userId, username, scoreData);
          if (savedScore) {
            successCount++;
          } else {
            failedScores.push(score);
          }
        } catch (error) {
          console.error('Error migrating individual score:', error);
          failedScores.push(score);
        }
      }

      // Se houver scores que falharam na migração, salvar como fallback no localStorage
      if (failedScores.length > 0) {
        const userStorageKey = `${this.storageKey}_user_${userId}`;
        const existingUserScores = await this.getUserScores(userId);
        const updatedFailedScores = failedScores.map(score => ({
          ...score,
          userId: userId
        }));
        const allScores = [...existingUserScores, ...updatedFailedScores];
        localStorage.setItem(userStorageKey, JSON.stringify(allScores));
      }
      
      // Limpar scores locais após migração (mesmo que alguns tenham falhado)
      localStorage.removeItem(this.storageKey);
      
    } catch (error) {
      console.error('Error during score migration:', error);
    }
  }

  // Limpa tudo do localStorage (debug only)
  clearAllData() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.storageKey));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export const scoreService = new ScoreService();