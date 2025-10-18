import React, { useRef, useEffect } from 'react';

function DinoGame() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // --- Ajuste responsivo ---
    function resizeCanvas() {
      canvas.width = Math.min(window.innerWidth * 0.9, 600);
      canvas.height = Math.min(window.innerHeight * 0.3, 200);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let GAME_WIDTH = canvas.width;
    let GAME_HEIGHT = canvas.height;

    // --- Variables ---
    let score = 0;
    let gameSpeed = 3;
    let isGameOver = false;
    let player, obstacles;
    let keys = {};

    // --- Controles (teclado + táctil) ---
    const keydownHandler = (e) => (keys[e.code] = true);
    const keyupHandler = (e) => (keys[e.code] = false);
    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);

    canvas.addEventListener('touchstart', () => {
      if (isGameOver) init();
      else if (player.isGrounded) player.dy = -player.jumpForce;
    });

    // --- Jugador (Erizo) ---
    class Player {
      constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.originalY = y;
        this.dy = 0;
        this.jumpForce = 9;
        this.gravity = 0.4;
        this.isGrounded = true;
      }

      draw() {
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;

        // Cuerpo redondo
        ctx.fillStyle = '#5a4634';
        ctx.beginPath();
        ctx.arc(cx, cy, this.w / 2, 0, Math.PI * 2);
        ctx.fill();

        // Púas traseras
        ctx.fillStyle = '#3a2e22';
        for (let i = 0; i < 8; i++) {
          const px = this.x + (i * this.w) / 10;
          const py = this.y + Math.sin(i * 0.8) * 3;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + 5, py - 10);
          ctx.lineTo(px + 10, py);
          ctx.fill();
        }

        // Ojo
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(cx + this.w / 4, cy - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(cx + this.w / 4, cy - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Nariz
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(cx + this.w / 2, cy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        if ((keys['Space'] || keys['ArrowUp']) && this.isGrounded) {
          this.dy = -this.jumpForce;
          this.isGrounded = false;
        }

        this.dy += this.gravity;
        this.y += this.dy;

        if (this.y + this.h >= this.originalY) {
          this.y = this.originalY - this.h;
          this.dy = 0;
          this.isGrounded = true;
        }

        this.draw();
      }
    }

    // --- Obstáculos ---
    class Obstacle {
      constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
      }

      draw() {
        ctx.fillStyle = '#8b5e3c';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#654321';
        ctx.fillRect(this.x + 2, this.y, this.w - 4, this.h - 3);
      }

      update() {
        this.x -= gameSpeed;
        this.draw();
      }
    }

    // --- Funciones del juego ---
    function spawnObstacle() {
      const size = Math.random() > 0.5 ? 25 : 40;
      const obstacle = new Obstacle(GAME_WIDTH, GAME_HEIGHT - size - 2, 15, size);
      obstacles.push(obstacle);
    }

    function checkCollision(p, o) {
      return (
        p.x < o.x + o.w &&
        p.x + p.w > o.x &&
        p.y < o.y + o.h &&
        p.y + p.h > o.y
      );
    }

    function drawScore() {
      ctx.fillStyle = '#333';
      ctx.font = `${Math.floor(canvas.height / 10)}px Poppins, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`Puntos: ${Math.floor(score / 5)}`, GAME_WIDTH - 10, 25);
    }

    // --- Bucle del juego ---
    let animationFrameId;
    let obstacleTimer = 100;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = '#f4ede3';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Suelo
      ctx.fillStyle = '#cbb89d';
      ctx.fillRect(0, GAME_HEIGHT - 2, GAME_WIDTH, 2);

      player.update();

      if (isGameOver) {
        ctx.fillStyle = '#333';
        ctx.font = '24px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🐾 Game Over 🐾', GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.font = '16px Poppins, sans-serif';
        ctx.fillText('Toca o presiona Espacio para reiniciar', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
        return;
      }

      obstacleTimer--;
      if (obstacleTimer <= 0) {
        spawnObstacle();
        obstacleTimer = 100 + Math.random() * 150 - gameSpeed * 10;
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.update();
        if (o.x + o.w < 0) obstacles.splice(i, 1);
        if (checkCollision(player, o)) isGameOver = true;
      }

      drawScore();
      score++;
      gameSpeed += 0.001;
    }

    function init() {
      GAME_WIDTH = canvas.width;
      GAME_HEIGHT = canvas.height;
      isGameOver = false;
      score = 0;
      gameSpeed = 3;
      obstacles = [];
      player = new Player(25, GAME_HEIGHT - 30, 30, 30);

      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animate();
    }

    init();

    // --- Limpieza ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('keydown', keydownHandler);
      document.removeEventListener('keyup', keyupHandler);
    };
  }, []);

  return (
    <div
      className="text-center"
      style={{
        paddingTop: '4rem',
        color: '#2b2b2b',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <h2>¡Oops! Parece que no hay conexión.</h2>
      <p className="lead">Mientras vuelve el internet, ¿por qué no juegas con el erizo?</p>
      <div className="mt-4 d-flex justify-content-center">
        <canvas
          ref={canvasRef}
          style={{
            border: '2px solid #d8c9b0',
            borderRadius: '10px',
            background: '#fffaf3',
            touchAction: 'none',
          }}
        />
      </div>
      <p className="mt-2 text-muted">Presiona o toca para saltar</p>
    </div>
  );
}

export default DinoGame;
