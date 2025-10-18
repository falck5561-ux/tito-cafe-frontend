import React, { useRef, useEffect } from 'react';

// Este componente contiene toda la lógica del juego y no necesita instalar NADA.
function DinoGame() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const GAME_WIDTH = canvas.width;
        const GAME_HEIGHT = canvas.height;

        // --- Variables del Juego ---
        let score = 0;
        let gameSpeed = 3;
        let isGameOver = false;
        let player = null;
        let obstacles = [];
        let keys = {};

        // --- Event Listeners ---
        const keydownHandler = (e) => { keys[e.code] = true; };
        const keyupHandler = (e) => { keys[e.code] = false; };
        document.addEventListener('keydown', keydownHandler);
        document.addEventListener('keyup', keyupHandler);

        // --- Clase del Personaje (Ahora dibuja un erizo) ---
        class Player {
            constructor(x, y, w, h) {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
                this.originalY = y;
                this.dy = 0; // Velocidad vertical
                this.jumpForce = 9;
                this.gravity = 0.4;
                this.isGrounded = true;
            }

            draw() {
                ctx.fillStyle = '#555'; // Color del erizo
                
                // Cuerpo del erizo (un semicírculo)
                ctx.beginPath();
                ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, Math.PI, 0, false);
                ctx.fill();

                // Púas
                ctx.fillStyle = '#666';
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + this.h / 2);
                ctx.lineTo(this.x + this.w / 2, this.y - 5);
                ctx.lineTo(this.x + this.w, this.y + this.h / 2);
                ctx.fill();

                // Ojo
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(this.x + this.w - 5, this.y + this.h / 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                // Salto
                if ((keys['Space'] || keys['ArrowUp']) && this.isGrounded) {
                    this.dy = -this.jumpForce;
                    this.isGrounded = false;
                }

                this.dy += this.gravity;
                this.y += this.dy;

                // Colisión con el suelo
                if (this.y + this.h > this.originalY) {
                    this.y = this.originalY - this.h;
                    this.dy = 0;
                    this.isGrounded = true;
                }

                this.draw();
            }
        }

        class Obstacle {
            constructor(x, y, w, h) {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
            }

            draw() {
                ctx.fillStyle = '#888';
                ctx.fillRect(this.x, this.y, this.w, this.h);
            }

            update() {
                this.x -= gameSpeed;
                this.draw();
            }
        }

        // --- Funciones del Juego ---
        function spawnObstacle() {
            const size = Math.random() > 0.5 ? 20 : 35; // Dos tamaños de cactus
            const obstacle = new Obstacle(GAME_WIDTH, GAME_HEIGHT - size, 15, size);
            obstacles.push(obstacle);
        }

        function updateScore() {
            score++;
            ctx.fillStyle = '#333';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`Score: ${Math.floor(score / 5)}`, GAME_WIDTH - 10, 30);
        }

        function checkCollision(p, o) {
            return p.x < o.x + o.w &&
                   p.x + p.w > o.x &&
                   p.y < o.y + o.h &&
                   p.y + p.h > o.y;
        }

        // --- Bucle principal del juego ---
        let animationFrameId;
        let obstacleTimer = 200;

        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            // Dibujar suelo
            ctx.fillStyle = '#ddd';
            ctx.fillRect(0, GAME_HEIGHT - 2, GAME_WIDTH, 2);

            player.update();

            // Lógica de Game Over y Reinicio
            if (isGameOver) {
                ctx.fillStyle = '#333';
                ctx.font = '30px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over', GAME_WIDTH / 2, GAME_HEIGHT / 2);
                ctx.font = '16px sans-serif';
                ctx.fillText('Presiona Espacio para reiniciar', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
                
                // Si se presiona espacio, se reinicia el juego.
                if (keys['Space']) {
                    init();
                }
                return; // Detiene el bucle de animación aquí
            }


            // Obstáculos
            obstacleTimer--;
            if (obstacleTimer <= 0) {
                spawnObstacle();
                obstacleTimer = 100 + Math.random() * 150 - gameSpeed * 10;
            }

            for (let i = obstacles.length - 1; i >= 0; i--) {
                let o = obstacles[i];
                o.update();
                if (o.x + o.w < 0) {
                    obstacles.splice(i, 1);
                }
                if (checkCollision(player, o)) {
                    isGameOver = true;
                }
            }

            updateScore();
            gameSpeed += 0.001; // Aumentar velocidad gradualmente
        }
        
        // --- Inicialización ---
        function init() {
            isGameOver = false;
            score = 0;
            gameSpeed = 3;
            obstacles = [];
            player = new Player(25, GAME_HEIGHT - 30, 30, 30); // Ajustamos tamaño para el erizo
            
            // Si ya hay un bucle corriendo, lo cancelamos antes de empezar uno nuevo
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            animate();
        }

        init();

        // --- Limpieza ---
        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('keydown', keydownHandler);
            document.removeEventListener('keyup', keyupHandler);
        };
    }, []);

    return (
        <div className="container text-center" style={{ paddingTop: '5rem' }}>
            <h2 className="mb-3">¡Oops! Parece que no hay conexión.</h2>
            <p className="lead text-muted">Mientras vuelve el internet, ¿por qué no juegas un rato?</p>
            <div className="mt-4 d-flex justify-content-center">
                <canvas ref={canvasRef} width="600" height="200" style={{ border: '1px solid #ccc' }} />
            </div>
            <p className="mt-2 text-muted">Presiona 'Espacio' para saltar</p>
        </div>
    );
}

export default DinoGame;

