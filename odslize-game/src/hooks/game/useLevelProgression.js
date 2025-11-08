import { useState, useEffect, useCallback } from 'react';

// Hook para gerenciar a progressão de níveis do jogo
export const useLevelProgression = (initialUnlockedLevels = [1], maxLevel = 4) => {
  const [unlockedLevels, setUnlockedLevels] = useState(initialUnlockedLevels);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState([]);

  // Verifica se o nível está desbloqueado
  const isLevelUnlocked = useCallback((level) => {
    return unlockedLevels.includes(level);
  }, [unlockedLevels]);

  // Verifica se o nível está completo
  const isLevelCompleted = useCallback((level) => {
    return completedLevels.includes(level);
  }, [completedLevels]);

  // Desbloqueia o próximo nível
  const unlockNextLevel = useCallback((completedLevel) => {
    const nextLevel = completedLevel + 1;

    // Marca o nível atual como completo
    setCompletedLevels(prev => {
      if (!prev.includes(completedLevel)) {
        return [...prev, completedLevel];
      }
      return prev;
    });

    // Desbloqueia o próximo nível se existir e não estiver desbloqueado
    if (nextLevel <= maxLevel && !unlockedLevels.includes(nextLevel)) {
      setUnlockedLevels(prev => [...prev, nextLevel]);
      return true;
    }

    return false;
  }, [maxLevel, unlockedLevels]);

  // Obtém a porcentagem de progresso
  const getProgressPercentage = useCallback(() => {
    return Math.round((completedLevels.length / maxLevel) * 100);
  }, [completedLevels.length, maxLevel]);

  // Obtém o próximo nível disponível
  const getNextAvailableLevel = useCallback(() => {
    for (let level = 1; level <= maxLevel; level++) {
      if (isLevelUnlocked(level) && !isLevelCompleted(level)) {
        return level;
      }
    }
    return null;
  }, [maxLevel, isLevelUnlocked, isLevelCompleted]);

  // Verifica se todos os níveis estão completos
  const isGameCompleted = useCallback(() => {
    return completedLevels.length === maxLevel;
  }, [completedLevels.length, maxLevel]);

  // Reinicia a progressão (para novo jogo)
  const resetProgression = useCallback(() => {
    setUnlockedLevels([1]);
    setCurrentLevel(1);
    setCompletedLevels([]);
  }, []);

  // Carrega a progressão do localStorage
  const loadProgression = useCallback(() => {
    try {
      const saved = localStorage.getItem('odslize-progression');
      if (saved) {
        const { unlockedLevels: saved_unlocked, completedLevels: saved_completed } = JSON.parse(saved);
        setUnlockedLevels(saved_unlocked || [1]);
        setCompletedLevels(saved_completed || []);
      }
    } catch (error) {
      console.error('Error loading progression:', error);
    }
  }, []);

  // Salva a progressão no localStorage
  const saveProgression = useCallback(() => {
    try {
      const progressionData = {
        unlockedLevels,
        completedLevels,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('odslize-progression', JSON.stringify(progressionData));
    } catch (error) {
      console.error('Error saving progression:', error);
    }
  }, [unlockedLevels, completedLevels]);

  // Salva a progressão sempre que houver mudanças
  useEffect(() => {
    saveProgression();
  }, [saveProgression]);

  return {
    unlockedLevels,
    currentLevel,
    completedLevels,
    isLevelUnlocked,
    isLevelCompleted,
    unlockNextLevel,
    getProgressPercentage,
    getNextAvailableLevel,
    isGameCompleted,
    resetProgression,
    loadProgression,
    saveProgression,
    setCurrentLevel,
    progressPercentage: getProgressPercentage(),
    nextAvailableLevel: getNextAvailableLevel()
  };
};
