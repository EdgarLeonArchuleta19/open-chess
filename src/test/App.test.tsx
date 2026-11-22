import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../app/App';

describe('OpenChess — Application UI & Easter Egg Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the minimalist home screen with all 3 game modes and theme toggle', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/Sala con Amigos/i)).toBeInTheDocument();
    expect(screen.getByText(/Contra el Bot/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Jugadores Local/i)).toBeInTheDocument();

    // Toggle dark -> light mode
    const themeBtn = screen.getByRole('button', {
      name: /Cambiar a tema claro/i,
    });
    await user.click(themeBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('starts a local 2-player game, plays a move, and supports undo/redo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /2 Jugadores Local/i }));

    expect(
      await screen.findByRole('grid', { name: /Tablero de ajedrez OpenChess/i })
    ).toBeInTheDocument();

    // Play e2 -> e4
    await user.click(screen.getByTestId('square-e2'));
    await user.click(screen.getByTestId('square-e4'));

    expect(screen.getByText(/Turno de Negras/i)).toBeInTheDocument();
    expect(screen.getByText(/1 jugada/i)).toBeInTheDocument();

    // Undo
    await user.click(screen.getByRole('button', { name: /Deshacer/i }));
    expect(screen.getByText(/Turno de Blancas/i)).toBeInTheDocument();

    // Redo
    await user.click(screen.getByRole('button', { name: /Rehacer/i }));
    expect(screen.getByText(/Turno de Negras/i)).toBeInTheDocument();
  });

  it('preserves and unlocks the 2019 CETis 107 Easter Egg when answering "rochin"', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: /Icono misterioso CETis 107/i })
    );

    expect(
      screen.getByText(/¿Cuál es el mejor profesor del CETis 107\?\?/i)
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Escribe el apellido del profe/i);
    await user.type(input, 'rochin');
    await user.click(screen.getByRole('button', { name: /Desbloquear/i }));

    expect(
      screen.getByText(/CÁPSULA DEL TIEMPO \(2019\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Abrir Vista Original/i })
    ).toHaveAttribute('href', expect.stringContaining('mipagina/index.html'));
  });
});
