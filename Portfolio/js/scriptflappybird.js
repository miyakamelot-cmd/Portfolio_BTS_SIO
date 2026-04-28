        document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas.getContext('2d');
            const scoreElement = document.getElementById('score');
            const finalScoreElement = document.getElementById('final-score');
            const startScreen = document.getElementById('start-screen');
            const gameOverScreen = document.getElementById('game-over-screen');
            const startButton = document.getElementById('start-button');
            const restartButton = document.getElementById('restart-button');
            const actionButton = document.getElementById('action-button');
            
            // Ajuster la taille du canvas
            function resizeCanvas() {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
            
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            
            // Variables du jeu
            let gameRunning = false;
            let score = 0;
            let frames = 0;
            
            // Oiseau
            const bird = {
                x: 50,
                y: canvas.height / 2,
                width: 34,
                height: 24,
                gravity: 0.5,
                velocity: 0,
                jump: -8,
                
                draw: function() {
                    ctx.fillStyle = '#FFD700'; 
                    ctx.beginPath();
                    ctx.ellipse(this.x, this.y, this.width/2, this.height/2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Bec
                    ctx.fillStyle = '#FF8C00';
                    ctx.beginPath();
                    ctx.moveTo(this.x + this.width/2 + 10, this.y);
                    ctx.lineTo(this.x - this.width/2 + 30, this.y + 5);
                    ctx.lineTo(this.x - this.width/2 + 30, this.y - 5);
                    ctx.fill();
                    
                    // Œil
                    ctx.fillStyle = 'black';
                    ctx.beginPath();
                    ctx.arc(this.x + 5, this.y - 5, 4, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(this.x + 6, this.y - 6, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Ailes
                    ctx.fillStyle = '#FFA500';
                    ctx.beginPath();
                    ctx.ellipse(this.x - 5, this.y + 2, 10, 8, Math.PI/4, 0, Math.PI * 2);
                    ctx.fill();
                },
                
                update: function() {
                    // Appliquer la gravité
                    this.velocity += this.gravity;
                    this.y += this.velocity;
                    
                    // Limites de l'écran
                    if (this.y >= canvas.height - this.height/2) {
                        this.y = canvas.height - this.height/2;
                        gameOver();
                    }
                    
                    if (this.y <= this.height/2) {
                        this.y = this.height/2;
                        this.velocity = 0;
                    }
                },
                
                flap: function() {
                    this.velocity = this.jump;
                },
                
                reset: function() {
                    this.y = canvas.height / 2;
                    this.velocity = 0;
                }
            };
            
            // Tuyaux
            const pipes = {
                position: [],
                
                // Configuration
                width: 60,
                gap: 170,
                minYPos: 80, // Position Y minimale pour le haut du tuyau
                maxYPos: 300, // Position Y maximale pour le haut du tuyau
                dx: 2,
                
                draw: function() {
                    for (let i = 0; i < this.position.length; i++) {
                        let p = this.position[i];
                        
                        // Tuyau du haut
                        ctx.fillStyle = '#2E8B57';
                        ctx.fillRect(p.x, 0, this.width, p.y);
                        
                        // Tuyau du bas
                        let bY = p.y + this.gap;
                        ctx.fillRect(p.x, bY, this.width, canvas.height - bY);
                        
                        // Bordure des tuyaux
                        ctx.fillStyle = '#1F7042';
                        ctx.fillRect(p.x - 2, 0, 4, p.y);
                        ctx.fillRect(p.x - 2, bY, 4, canvas.height - bY);
                        
                        ctx.fillRect(p.x, p.y - 15, this.width, 15);
                        ctx.fillRect(p.x, bY, this.width, 15);
                    }
                },
                
                update: function() {
                    if (gameRunning) {
                        if (frames % 100 === 0) {
                            // Générer une position Y aléatoire mais garantissant que le passage reste à l'écran
                            const minGapFromTop = this.minYPos;
                            const maxGapFromTop = Math.min(this.maxYPos, canvas.height - this.gap - 50);
                            const randomY = Math.floor(Math.random() * (maxGapFromTop - minGapFromTop + 1)) + minGapFromTop;
                            
                            this.position.push({
                                x: canvas.width,
                                y: randomY,
                                passed: false
                            });
                        }
                        
                        for (let i = 0; i < this.position.length; i++) {
                            let p = this.position[i];
                            
                            // Déplacer les tuyaux vers la gauche
                            p.x -= this.dx;
                            
                            // Si le tuyau est dépassé par l'oiseau et n'a pas encore été comptabilisé
                            if (p.x + this.width < bird.x && !p.passed) {
                                score++;
                                scoreElement.textContent = score;
                                p.passed = true;
                            }
                            
                            // Collision avec les tuyaux
                            const birdTop = bird.y - bird.height/2;
                            const birdBottom = bird.y + bird.height/2;
                            const birdLeft = bird.x - bird.width/2;
                            const birdRight = bird.x + bird.width/2;
                            
                            const pipeRight = p.x + this.width;
                            const gapTop = p.y;
                            const gapBottom = p.y + this.gap;
                            
                            // Vérifier si l'oiseau traverse le tuyau horizontalement
                            const horizontalCollision = birdRight > p.x && birdLeft < pipeRight;
                            
                            // Vérifier si l'oiseau n'est pas dans l'ouverture verticale
                            const verticalCollision = birdTop < gapTop || birdBottom > gapBottom;
                            
                            if (horizontalCollision && verticalCollision) {
                                gameOver();
                            }
                            
                            // Supprimer les tuyaux hors de l'écran
                            if (p.x + this.width <= 0) {
                                this.position.shift();
                            }
                        }
                    }
                },
                
                reset: function() {
                    this.position = [];
                }
            };
            
            // Arrière-plan
            function drawBackground() {
                // Ciel
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Nuages
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(100, 80, 30, 0, Math.PI * 2);
                ctx.arc(130, 70, 35, 0, Math.PI * 2);
                ctx.arc(160, 85, 25, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(canvas.width - 100, 120, 40, 0, Math.PI * 2);
                ctx.arc(canvas.width - 130, 110, 35, 0, Math.PI * 2);
                ctx.arc(canvas.width - 160, 125, 30, 0, Math.PI * 2);
                ctx.fill();
                
                // Sol
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
                
                ctx.fillStyle = '#9ACD32';
                ctx.fillRect(0, canvas.height - 30, canvas.width, 5);
            }
            
            // Boucle de jeu
            function gameLoop() {
                // Effacer le canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Dessiner l'arrière-plan
                drawBackground();
                
                // Mettre à jour et dessiner les tuyaux
                pipes.update();
                pipes.draw();
                
                // Mettre à jour et dessiner l'oiseau
                bird.update();
                bird.draw();
                
                frames++;
                
                if (gameRunning) {
                    requestAnimationFrame(gameLoop);
                }
            }
            
            // Démarrer le jeu
            function startGame() {
                gameRunning = true;
                score = 0;
                frames = 0;
                scoreElement.textContent = score;
                
                bird.reset();
                pipes.reset();
                
                startScreen.classList.add('hidden');
                gameOverScreen.classList.add('hidden');
                
                gameLoop();
            }
            
            // Game over
            function gameOver() {
                gameRunning = false;
                finalScoreElement.textContent = score;
                gameOverScreen.classList.remove('hidden');
            }
            
            // Événements
            startButton.addEventListener('click', startGame);
            restartButton.addEventListener('click', startGame);
            actionButton.addEventListener('click', () => {
                if (gameRunning) bird.flap();
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space') {
                    if (!gameRunning && startScreen.classList.contains('hidden')) {
                        startGame();
                    } else if (gameRunning) {
                        bird.flap();
                    }
                    e.preventDefault();
                }
            });
            
            canvas.addEventListener('click', () => {
                if (gameRunning) {
                    bird.flap();
                }
            });
            
            // Support tactile pour mobile
            canvas.addEventListener('touchstart', (e) => {
                if (gameRunning) {
                    bird.flap();
                    e.preventDefault();
                }
            });
        });