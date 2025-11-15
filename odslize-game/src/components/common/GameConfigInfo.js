import React from 'react';
import { GAME_CONFIG, shouldUseOdsImages, getGameTitle } from '../../config/gameConfig';

const GameConfigInfo = ({ className = '' }) => {
  if (!GAME_CONFIG.development.showDebugInfo) {
    return null;
  }

  return (
    <div className={`game-config-info ${className}`} style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      fontFamily: 'monospace'
    }}>
      <div><strong>🔧 Config Debug</strong></div>
      <div> Modo: {shouldUseOdsImages() ? 'Imagens ODS' : 'Números'}</div>
      <div> Título: {getGameTitle()}</div>
      <div> Som: {GAME_CONFIG.gameplay.soundEnabled ? 'On' : 'Off'}</div>
      <hr style={{ margin: '5px 0', border: '1px solid #666' }} />
    </div>
  );
};

export default GameConfigInfo;