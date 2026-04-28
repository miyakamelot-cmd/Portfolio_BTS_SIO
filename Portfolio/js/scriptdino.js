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
    let speed = 5; 
    let maxSpeed = 15; 
    let speedIncreaseInterval = 300; 
    let animationFrameId;

    // Dino
    const dino = {
        x: 50,
        y: canvas.height - 50,  
        width: 30,
        height: 20,
        velocityY: 0,
        gravity: 0.8,
        jumpStrength: -12,
        isJumping: false,

        draw: function() {
            ctx.fillStyle = '#228B22'; 

            // Corps principal 
            const radius = 5;
            const x = this.x;
            const y = this.y;
            const w = this.width;
            const h = this.height;

            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.fill();

            // Queue 
            ctx.beginPath();
            ctx.moveTo(x, y + h * 0.6);
            ctx.lineTo(x - w * 0.4, y + h * 0.8);
            ctx.lineTo(x+10, y + h);
            ctx.closePath();
            ctx.fill();

            // Tête 
            ctx.fillStyle = '#32CD32'; 
            const headSize = w * 0.5;
            ctx.fillRect(x + w * 0.7, y - headSize * 0.6, headSize, headSize);

            // Œil 
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x + w * 0.85, y - headSize * 0.3, 3, 0, Math.PI * 2);
            ctx.fill();
        },

        update: function() {
            if (this.isJumping) {
                this.velocityY += this.gravity;
                this.y += this.velocityY;

                if (this.y >= canvas.height - this.height - ground.height) { 
                    this.y = canvas.height - this.height - ground.height;
                    this.isJumping = false;
                    this.velocityY = 0;
                }
            }
        },

        jump: function() {
            if (!this.isJumping) {
                this.velocityY = this.jumpStrength;
                this.isJumping = true;
            }
        },

        reset: function() {
            this.y = canvas.height - this.height - ground.height; 
            this.velocityY = 0;
            this.isJumping = false;
        }
    };

    // Obstacles (Arbres)
    const obstacles = {
        position: [],
        minGap: 400, 
        maxGap: 800, 
        minHeight: 40,
        maxHeight: 70,
        minWidth: 25,
        maxWidth: 40,

        draw: function() {
            for (let i = 0; i < this.position.length; i++) {
                let o = this.position[i];
                
                // Tronc de l'arbre
                ctx.fillStyle = '#8B4513'; 
                const trunkWidth = o.width * 0.5;
                const trunkHeight = o.height * 0.5;
                ctx.fillRect(o.x + (o.width - trunkWidth) / 2, 
                            canvas.height - ground.height - trunkHeight, 
                            trunkWidth, trunkHeight);

                // Feuillage de l'arbre
                ctx.fillStyle = '#2E8B57'; 
                
                // Base du feuillage (cercle principal)
                ctx.beginPath();
                ctx.arc(o.x + o.width / 2, 
                        canvas.height - ground.height - trunkHeight + 10 - o.height * 0.3, 
                        o.width * 0.6, 0, Math.PI * 2);
                ctx.fill();

                // Ajouter quelques cercles supplémentaires
                ctx.beginPath();
                ctx.arc(o.x + o.width / 2 - o.width * 0.2, 
                        canvas.height - ground.height - trunkHeight + 10 - o.height * 0.4, 
                        o.width * 0.4, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(o.x + o.width / 2 + o.width * 0.2, 
                        canvas.height - ground.height - trunkHeight + 10 - o.height * 0.4, 
                        o.width * 0.4, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(o.x + o.width / 2, 
                        canvas.height - ground.height - trunkHeight + 10 - o.height * 0.5, 
                        o.width * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        },

        update: function() {
            if (gameRunning) {
                // Générer de nouveaux arbres
                if (frames === 1 || (this.position.length > 0 && canvas.width - this.position[this.position.length - 1].x > Math.random() * (this.maxGap - this.minGap) + this.minGap)) {
                    const width = Math.random() * (this.maxWidth - this.minWidth) + this.minWidth;
                    const height = Math.random() * (this.maxHeight - this.minHeight) + this.minHeight;
                    this.position.push({
                        x: canvas.width,
                        width: width,
                        height: height
                    });
                }

                for (let i = 0; i < this.position.length; i++) {
                    let o = this.position[i];

                    // Déplacer les arbres vers la gauche
                    o.x -= speed;

                    // Collision avec le Dino
                    const dinoRight = dino.x + dino.width;
                    const dinoBottom = dino.y + dino.height;
                    const obstacleRight = o.x + o.width;
                    
                    // Zone de collision pour le tronc seulement
                    const trunkWidth = o.width * 0.4;
                    const trunkX = o.x + (o.width - trunkWidth) / 2;
                    const trunkTop = canvas.height - ground.height - (o.height * 0.4);

                    if (dinoRight > trunkX && dino.x < trunkX + trunkWidth && dinoBottom > trunkTop) {
                        gameOver();
                    }

                    // Supprimer les arbres hors de l'écran
                    if (o.x + o.width <= 0) {
                        this.position.shift();
                    }
                }
            }
        },

        reset: function() {
            this.position = [];
        }
    };

    // Sol 
    const ground = {
        x: 0,
        y: canvas.height - 30, 
        width: canvas.width,
        height: 30,
        draw: function() {
            
        }
    };

    // Arrière-plan
    function drawBackground() {
        // Ciel
        ctx.fillStyle = '#a7d9ed'; 
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

        // Mettre à jour et dessiner le Dino
        dino.update();
        dino.draw();

        // Mettre à jour et dessiner les obstacles
        obstacles.update();
        obstacles.draw();

        // Mettre à jour le score
        if (gameRunning) {
            frames++;
            score = Math.floor(frames / 10); 
            scoreElement.textContent = score;

            // Augmenter la vitesse progressivement
            if (frames % speedIncreaseInterval === 0 && speed < maxSpeed) {
                speed += 0.5;
            }
        }

        if (gameRunning) {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    // Démarrer le jeu
    function startGame() {
        gameRunning = true;
        score = 0;
        frames = 0;
        speed = 5 ; // Réinitialiser la vitesse
        scoreElement.textContent = score;

        dino.reset();
        obstacles.reset();

        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        gameLoop();
    }

    // Game over
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationFrameId); // Arrêter la boucle d'animation
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }

    // Événements
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    actionButton.addEventListener('click', () => {
        if (gameRunning) dino.jump();
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!gameRunning && startScreen.classList.contains('hidden')) {
                startGame();
            } else if (gameRunning) {
                dino.jump();
            }
            e.preventDefault(); // Empêche le défilement de la page avec la barre espace
        }
    });

    canvas.addEventListener('click', () => {
        if (gameRunning) {
            dino.jump();
        }
    });

    // Support tactile pour mobile
    canvas.addEventListener('touchstart', (e) => {
        if (gameRunning) {
            dino.jump();
            e.preventDefault();
        }
    });
});