import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/game/useGameState';

describe('useGameState Hook', () => {
  test('alterna o som corretamente', () => {
    const { result } = renderHook(() => useGameState());
    const initialSound = result.current.soundEnabled;

    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.soundEnabled).toBe(!initialSound);
  });

  test('seleciona um nível corretamente', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.selectLevel(2);
    });
    expect(result.current.selectedLevel).toBe(2);
  });
});
