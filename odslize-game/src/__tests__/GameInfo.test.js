import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import GameInfo from '../components/game/GameInfo';

const mockProps = {
  moves: 10,
  timeElapsed: 120,
  currentLevel: 2,
  levelConfig: { size: { rows: 3, cols: 3 } },
};

describe('GameInfo Component', () => {
  test('renderiza corretamente as informações do jogo', () => {
    render(<GameInfo {...mockProps} />);
    expect(screen.getByText(/Nível/i)).toBeInTheDocument();
    expect(screen.getByText(/Movimentos/i)).toBeInTheDocument();
  });
});
