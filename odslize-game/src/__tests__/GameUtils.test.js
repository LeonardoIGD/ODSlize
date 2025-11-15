// Exemplo de teste de função utilitária simples
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import Button from '../components/common/Button';

describe('Button component', () => {
  test('renderiza com o texto correto', () => {
    render(<Button>Iniciar Jogo</Button>);
    const buttonElement = screen.getByText(/Iniciar Jogo/i);
    expect(buttonElement).toBeInTheDocument();
  });

test('possui a classe padrão de botão', () => {
  render(<Button>OK</Button>);
  const button = screen.getByRole('button');
  expect(button).toHaveClass('btn');
  expect(button).toHaveClass('btn-primary');
});

});
