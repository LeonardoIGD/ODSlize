// Config geral do jogo (tema, display, gameplay)
export const GAME_CONFIG = {
  display: {
    useOdsImages: false,
    theme: {
      primaryColor: '#2B8B81',
      secondaryColor: '#E28F39',
      dangerColor: '#CA1942'
    }
  },

  gameplay: {
    animationDelay: 300,
    autoSave: true,
    soundEnabled: true
  },

  development: {
    showDebugInfo: process.env.NODE_ENV === 'development',
    verboseLogs: false
  }
};

// Verifica se deve usar imagens dos ODS ou números
export const shouldUseOdsImages = () => {
  return GAME_CONFIG.display.useOdsImages;
};

// Retorna título do jogo baseado no modo
export const getGameTitle = () => {
  return shouldUseOdsImages() 
    ? '🧩 ODSlize - Puzzle ODS'
    : '🧩 Jogo do Quinze - Puzzle Clássico';
};

// Retorna descrição do jogo baseado no modo
export const getGameDescription = () => {
  return shouldUseOdsImages() 
    ? 'Desafie sua mente com quebra-cabeças dos Objetivos de Desenvolvimento Sustentável!'
    : 'Desafie sua mente com este clássico quebra-cabeça deslizante!';
};

// Define tipo de conteúdo das peças (image ou number)
export const getPieceContentType = () => {
  return shouldUseOdsImages() ? 'image' : 'number';
};
