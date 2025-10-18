import React from 'react';
// 1. Se importa el nuevo componente del juego
import { OfflineGame } from 'react-offline-game';

function DinoGame() {
  return (
    <div className="container text-center" style={{ paddingTop: '5rem' }}>
      <h2 className="mb-3">¡Oops! Parece que no hay conexión.</h2>
      <p className="lead text-muted">Mientras vuelve el internet, ¿por qué no juegas un rato?</p>
      <div className="mt-4">
        {/* 2. Se utiliza el nuevo componente. Es más simple y no necesita props de tema. */}
        <OfflineGame />
      </div>
    </div>
  );
}

export default DinoGame;

