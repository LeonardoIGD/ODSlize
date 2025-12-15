import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StartingState } from '../../patterns/state/StartingState';
import { LEVEL_CONFIGS } from '../../patterns/strategy/ShufflerStrategy';
import { ODS_IMAGES } from '../../contexts/GameContext';
import { shouldUseOdsImages } from '../../config/gameConfig';
import { useAuth } from '../../contexts/AuthContext';

// Hook para gerenciar o estado do jogo usando State Pattern
export const useGameState = () => {
  // Obter contexto de autenticação para passar aos estados
  const auth = useAuth();
  const [stateData, setStateData] = useState({
    currentLevel: 1,
    selectedLevel: 1,
    currentImageIndex: 0,
    unlockedLevels: [1],
    moves: 0,
    timeElapsed: 0,
    soundEnabled: true,
    isLevelCompleted: false,
    completedBySolving: false,
    board: [],
    solutionMoves: [],
    moveHistory: [],
    isShuffling: false,
    isSolving: false,
    isGameReady: false,
    currentODS: null
  });

  // Estados para ODS Display
  const [odsDisplay, setOdsDisplay] = useState({
    title: '',
    code: '',
    logoUrl: '',
    isVisible: false
  });

  // Estados para modais
  const [modals, setModals] = useState({
    completion: {
      isVisible: false,
      data: null
    },
    allLevelsCompleted: {
      isVisible: false,
      data: null
    }
  });

  const [currentState, setCurrentState] = useState(null);
  const stateDataRef = useRef(stateData);
  const initializedRef = useRef(false);

  useEffect(() => {
    stateDataRef.current = stateData;
  }, [stateData]);

  // Funções para controle do ODS Display
  const updateODSDisplay = useCallback((data) => {
    setOdsDisplay({
      title: data.title || '',
      code: data.code || '',
      logoUrl: data.logoUrl || '',
      isVisible: true
    });
  }, []);

  const hideODSDisplay = useCallback(() => {
    setOdsDisplay(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Funções para controle dos modais
  const showCompletionModal = useCallback((data) => {
    setModals(prev => ({
      ...prev,
      completion: {
        isVisible: true,
        data
      }
    }));
  }, []);

  const hideCompletionModal = useCallback(() => {
    setModals(prev => ({
      ...prev,
      completion: {
        isVisible: false,
        data: null
      }
    }));
  }, []);

  const showAllLevelsCompletedModal = useCallback((data) => {
    setModals(prev => ({
      ...prev,
      allLevelsCompleted: {
        isVisible: true,
        data
      }
    }));
  }, []);

  const hideAllLevelsCompletedModal = useCallback(() => {
    setModals(prev => ({
      ...prev,
      allLevelsCompleted: {
        isVisible: false,
        data: null
      }
    }));
  }, []);

  // Game context para os estados do jogo
  const gameContext = useMemo(() => ({
    setState: (newState) => {
      setCurrentState(newState);
    },

    getStateData: () => stateDataRef.current,

    setStateData: (newData) => {
      setStateData(prev => {
        const updatedState = { ...prev, ...newData };
        stateDataRef.current = updatedState;
        return updatedState;
      });
    },

    getLevelConfig: (level) => LEVEL_CONFIGS[level],
    getLevelConfigs: () => LEVEL_CONFIGS,
    getOdsImages: () => ODS_IMAGES,

    getShufflerStrategy: () => {
      const { RandomMovesStrategy } = require('../../patterns/strategy/ShufflerStrategy');
      return new RandomMovesStrategy();
    },

    // Adicionar getCurrentUser ao gameContext para que os estados possam acessar
    getCurrentUser: () => {
      return auth.user;
    },

    updateODSDisplay,
    hideODSDisplay,

    showCompletionModal,
    hideCompletionModal,
    showAllLevelsCompletedModal,
    hideAllLevelsCompletedModal
  }), [auth.user, updateODSDisplay, hideODSDisplay, showCompletionModal, hideCompletionModal, showAllLevelsCompletedModal, hideAllLevelsCompletedModal]);

  useEffect(() => {
    if (!currentState && !initializedRef.current) {
      initializedRef.current = true;
      const initialState = new StartingState(gameContext);
      setCurrentState(initialState);
      initialState.enter();
    }
  }, [currentState, gameContext]);

  const selectLevel = useCallback((level) => {
    if (currentState?.selectLevel) {
      return currentState.selectLevel(level);
    }
    return false;
  }, [currentState]);

  const startLevel = useCallback(async () => {
    if (currentState?.startLevel) {
      const result = await currentState.startLevel();
      return result;
    }
    return false;
  }, [currentState]);

  const makeMove = useCallback((pieceIndex) => {
    if (currentState?.makeMove) {
      const result = currentState.makeMove(pieceIndex);
      return result;
    }

    return false;
  }, [currentState]);

  const solveLevel = useCallback(() => {
    if (currentState?.solveLevel) {
      return currentState.solveLevel();
    }
  }, [currentState]);

  const restartLevel = useCallback(() => {
    if (currentState?.restartLevel) {
      return currentState.restartLevel();
    }
  }, [currentState]);

  const revealBoard = useCallback(() => {
    if (currentState?.revealBoard) {
      return currentState.revealBoard();
    }
    return false;
  }, [currentState]);

  const startGame = useCallback(() => {
    if (currentState?.startGame) {
      return currentState.startGame();
    }
  }, [currentState]);

  const goToHome = useCallback(() => {
    if (currentState?.goToHome) {
      return currentState.goToHome();
    }
  }, [currentState]);

  const toggleSound = useCallback(() => {
    setStateData(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  }, []);

  // Função para obter configuração de nível
  const getLevelConfig = useCallback((level) => {
    return LEVEL_CONFIGS[level];
  }, []);

  // Inicializa jogo com StartingState
  const initializeGame = useCallback(async (level) => {
    setStateData(prev => ({ ...prev, selectedLevel: level }));
    
    // Inicializa com StartingState
    const { StartingState } = await import('../../patterns/state/StartingState');
    const startingState = new StartingState({
      getStateData: () => stateDataRef.current,
      setStateData,
      setState: setCurrentState,
      getLevelConfig,
      updateODSDisplay,
      hideODSDisplay,
      showCompletionModal,
      hideCompletionModal
    });
    setCurrentState(startingState);
    startingState.enter();
  }, [getLevelConfig, updateODSDisplay, hideODSDisplay, showCompletionModal, hideCompletionModal]);

  const currentLevelConfig = useMemo(() => {
    const level = stateData.currentLevel || stateData.selectedLevel || 1;
    return LEVEL_CONFIGS[level];
  }, [stateData.currentLevel, stateData.selectedLevel]);

  const selectedLevelConfig = useMemo(() => 
    LEVEL_CONFIGS[stateData.selectedLevel], 
    [stateData.selectedLevel]
  );

  const currentImage = useMemo(() => 
    shouldUseOdsImages() ? ODS_IMAGES[stateData.currentImageIndex] : null, 
    [stateData.currentImageIndex]
  );

  const maxLevel = useMemo(() => 
    Object.keys(LEVEL_CONFIGS).length, 
    []
  );

  const solutionAvailable = useMemo(() => 
    stateData.solutionMoves && stateData.solutionMoves.length > 0, 
    [stateData.solutionMoves]
  );

  const currentStateName = useMemo(() => {
    const name = currentState ? currentState.getStateName() : 'Unknown';
    return name;
  }, [currentState]);

  return {
    ...stateData,

    currentLevelConfig,
    selectedLevelConfig,
    currentImage,
    maxLevel,
    solutionAvailable,
    currentStateName,

    // Estados dos componentes
    odsDisplay,
    modals,

    selectLevel,
    startLevel,
    makeMove,
    solveLevel,
    restartLevel,
    startGame,
    revealBoard,
    goToHome,
    toggleSound,

    // Controle do ODS Display
    updateODSDisplay,
    hideODSDisplay,

    // Controle dos modais
    showCompletionModal,
    hideCompletionModal,
    showAllLevelsCompletedModal,
    hideAllLevelsCompletedModal,

    initializeGame,
    getLevelConfig,
    levelConfigs: LEVEL_CONFIGS,
    odsImages: ODS_IMAGES
  };
};