// Serviço para gerenciar scores dos usuários
class ScoreService {
  constructor() {
    this.storageKey = 'odslize_scores';
    this.apiBaseUrl = 'https://63ip9pdb30.execute-api.us-east-1.amazonaws.com/prod-v1';
  }

  // Obter scores do usuário local (não autenticado)
  getLocalScores() {
    try {
      const scores = localStorage.getItem(this.storageKey);
      return scores ? JSON.parse(scores) : [];
    } catch (error) {
      console.error('Error loading local scores:', error);
      return [];
    }
  }

  // Salvar score local
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

      // Manter apenas os últimos 50 scores locais
      const sortedScores = scores.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const limitedScores = sortedScores.slice(0, 50);

      localStorage.setItem(this.storageKey, JSON.stringify(limitedScores));
      return newScore;
    } catch (error) {
      console.error('Error saving local score:', error);
      return null;
    }
  }

  // Obter scores do usuário autenticado via API
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

  // Salvar score do usuário autenticado via API
  async saveUserScore(userId, scoreData) {
    try {
      if (!userId) return null;
      
      const newScore = {
        level: scoreData.level,
        moves: scoreData.moves,
        time: scoreData.time,
        timestamp: new Date().toISOString(),
        userId: userId
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving user score to API:', error);
      
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
        console.error('Error saving to localStorage fallback:', fallbackError);
        return null;
      }
    }
  }

  // Obter melhores scores por nível
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

  // Determinar se um score é melhor que outro
  isBetterScore(newScore, existingScore) {
    if (newScore.moves !== existingScore.moves) {
      return newScore.moves < existingScore.moves;
    }
    return newScore.time < existingScore.time;
  }

  // Obter estatísticas do usuário
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

  // Migrar scores locais para usuário autenticado via API
  async migrateLocalScoresToUser(userId) {
    try {
      const localScores = this.getLocalScores();
      if (localScores.length === 0) return;

      console.log(`Starting migration of ${localScores.length} local scores to user ${userId}`);

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

          const savedScore = await this.saveUserScore(userId, scoreData);
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
      
      console.log(`Migration completed: ${successCount} scores migrated successfully, ${failedScores.length} stored locally as fallback`);
    } catch (error) {
      console.error('Error during score migration:', error);
    }
  }

  // Limpar todos os dados (útil para desenvolvimento)
  clearAllData() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.storageKey));
      keys.forEach(key => localStorage.removeItem(key));
      console.log('All score data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export const scoreService = new ScoreService();