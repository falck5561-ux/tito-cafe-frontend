import React from 'react';
import Dino from 'react-chrome-dino';
// 1. Importamos el hook para saber el tema actual
import { useTheme } from '../context/ThemeContext';

function DinoGame() {
  // 2. Obtenemos el tema actual ('light' o 'dark')
  const { theme } = useTheme();

  return (
    <div className="container text-center" style={{ paddingTop: '5rem' }}>
      <h2 className="mb-3">¡Oops! Parece que no hay conexión.</h2>
      <p className="lead text-muted">Mientras vuelve el internet, ¿por qué no juegas un rato?</p>
      <div className="mt-4 p-3 border rounded">
        {/* 3. Le pasamos el tema al componente del juego */}
        {/* Si el tema de la app es 'dark', el juego también se pondrá en modo oscuro. */}
        <Dino dark={theme === 'dark'} />
      </div>
    </div>
  );
}

export default DinoGame;

