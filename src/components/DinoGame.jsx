import React from 'react';
import Dino from 'react-chrome-dino'; // Se importa el nuevo componente

function DinoGame() {
  return (
    <div className="container text-center" style={{ paddingTop: '5rem' }}>
      <h2 className="mb-3">¡Oops! Parece que no hay conexión.</h2>
      <p className="lead text-muted">Mientras vuelve el internet, ¿por qué no juegas un rato?</p>
      <div className="mt-4 p-3 border rounded">
        {/* Se utiliza el nuevo componente Dino */}
        <Dino />
      </div>
    </div>
  );
}

export default DinoGame;

