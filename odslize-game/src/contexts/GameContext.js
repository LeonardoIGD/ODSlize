import { createContext, useContext } from 'react';
import { useGameState } from '../hooks/game/useGameState';

const GameContext = createContext();

// Imagens dos ODS
export const ODS_IMAGES = [
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-1.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-2.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-3.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-4.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-5.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-6.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-7.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-8.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-9.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-10.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-11.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-12.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-13.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-14.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-15.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-16.svg',
  'https://odslize-game.s3.us-east-1.amazonaws.com/assets/web/ods-logos/SDG-17.svg'
];

// Game Provider usando State Pattern e hooks personalizados
export const GameProvider = ({ children }) => {
  const gameState = useGameState();

  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
};

// Hook para usar o contexto do jogo
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame deve ser usado dentro de um GameProvider');
  }
  return context;
};
