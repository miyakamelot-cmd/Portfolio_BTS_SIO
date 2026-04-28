document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    // D-Pad buttons
    const upButton = document.getElementById('up-button');
    const downButton = document.getElementById('down-button');
    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');

    const gridSize = 20; // Taille d'une case
    let tileCountX;
    let tileCountY;

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        tileCountX = Math.floor(canvas.width / gridSize);
        tileCountY = Math.floor(canvas.height / gridSize);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let snake = [];
    let food = {};
    let dx = gridSize; // Déplacement horizontal initial
    let dy = 0;        // Déplacement vertical initial
    let score = 0;
    let gameRunning = false;
    let changingDirection = false; // Pour éviter les changements de direction rapides
    let gameInterval;
    let gameSpeed = 150; // Vitesse du jeu

    function initGame() {
        snake = [
            { x: Math.floor(tileCountX / 2) * gridSize, y: Math.floor(tileCountY / 2) * gridSize },
            { x: (Math.floor(tileCountX / 2) - 1) * gridSize, y: Math.floor(tileCountY / 2) * gridSize }
        ];
        dx = gridSize;
        dy = 0;
        score = 0;
        scoreElement.textContent = score;
        changingDirection = false;
        gameSpeed = 150; // Réinitialiser la vitesse
        generateFood();
    }

    function generateFood() {
        let newFoodX, newFoodY;
        let collisionWithSnake;

        do {
            newFoodX = Math.floor(Math.random() * tileCountX) * gridSize;
            newFoodY = Math.floor(Math.random() * tileCountY) * gridSize;
            collisionWithSnake = false;
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === newFoodX && snake[i].y === newFoodY) {
                    collisionWithSnake = true;
                    break;
                }
            }
        } while (collisionWithSnake);

        food = { x: newFoodX, y: newFoodY };
    }

    function drawSnakePart(part, index) {
        ctx.fillStyle = '#4CAF50'; // Vert pour le corps du serpent
        ctx.strokeStyle = '#388E3C'; // Bordure plus foncée
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
        ctx.strokeRect(part.x, part.y, gridSize, gridSize);

        // Dessiner les yeux sur la tête du serpent
        if (index === 0) { // C'est la tête du serpent
            ctx.fillStyle = 'black';
            const eyeSize = gridSize / 5;
            const eyeOffset = gridSize / 4;

            if (dx === gridSize) { // Va à droite
                ctx.beginPath();
                ctx.arc(part.x + gridSize - eyeOffset, part.y + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(part.x + gridSize - eyeOffset, part.y + gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            } else if (dx === -gridSize) { // Va à gauche
                ctx.beginPath();
                ctx.arc(part.x + eyeOffset, part.y + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(part.x + eyeOffset, part.y + gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            } else if (dy === -gridSize) { // Va en haut
                ctx.beginPath();
                ctx.arc(part.x + eyeOffset, part.y + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(part.x + gridSize - eyeOffset, part.y + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            } else if (dy === gridSize) { // Va en bas
                ctx.beginPath();
                ctx.arc(part.x + eyeOffset, part.y + gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(part.x + gridSize - eyeOffset, part.y + gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function drawFood() {
        ctx.fillStyle = '#FF5722'; 
        ctx.strokeStyle = '#D84315';
        ctx.beginPath();
        ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    function draw() {
        // Dessiner le fond du canvas
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#a7d9ed'); // Couleur du ciel
        gradient.addColorStop(1, '#e0e0e0'); // Couleur du sol
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawFood();
        snake.forEach(drawSnakePart);
    }

    function moveSnake() {
        if (!gameRunning) return;

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Vérifier les collisions avec les murs
        const hitLeftWall = head.x < 0;
        const hitRightWall = head.x >= canvas.width;
        const hitTopWall = head.y < 0;
        const hitBottomWall = head.y >= canvas.height;

        if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall || checkSelfCollision(head)) {
            gameOver();
            return;
        }

        snake.unshift(head); // Ajouter la nouvelle tête

        const didEatFood = head.x === food.x && head.y === food.y;
        if (didEatFood) {
            score += 10;
            scoreElement.textContent = score;
            generateFood();
            // Augmenter la vitesse
            if (gameSpeed > 50) { // Limite de vitesse minimale
                gameSpeed -= 5;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
        } else {
            snake.pop(); // Supprimer la queue si pas de nourriture mangée
        }
        changingDirection = false; // Réinitialiser après le mouvement
    }

    function checkSelfCollision(head) {
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    }

    function changeDirection(event) {
        if (changingDirection) return;
        changingDirection = true;

        const keyPressed = event.keyCode;
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;

        const goingUp = dy === -gridSize;
        const goingDown = dy === gridSize;
        const goingRight = dx === gridSize;
        const goingLeft = dx === -gridSize;

        if (keyPressed === LEFT_KEY && !goingRight) {
            dx = -gridSize;
            dy = 0;
        }
        if (keyPressed === UP_KEY && !goingDown) {
            dx = 0;
            dy = -gridSize;
        }
        if (keyPressed === RIGHT_KEY && !goingLeft) {
            dx = gridSize;
            dy = 0;
        }
        if (keyPressed === DOWN_KEY && !goingUp) {
            dx = 0;
            dy = gridSize;
        }
    }

    function gameLoop() {
        moveSnake();
        draw();
    }

    function startGame() {
        gameRunning = true;
        initGame();
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        gameInterval = setInterval(gameLoop, gameSpeed);
    }

    function gameOver() {
        gameRunning = false;
        clearInterval(gameInterval);
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }

    // Événements
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    document.addEventListener('keydown', changeDirection);

    // D-Pad event listeners
    upButton.addEventListener('click', () => {
        if (!gameRunning && startScreen.classList.contains('hidden')) {
            startGame();
        } else if (gameRunning && dy !== gridSize) {
            dx = 0;
            dy = -gridSize;
            changingDirection = true; // Marquer le changement de direction
        }
    });
    downButton.addEventListener('click', () => {
        if (!gameRunning && startScreen.classList.contains('hidden')) {
            startGame();
        } else if (gameRunning && dy !== -gridSize) {
            dx = 0;
            dy = gridSize;
            changingDirection = true;
        }
    });
    leftButton.addEventListener('click', () => {
        if (!gameRunning && startScreen.classList.contains('hidden')) {
            startGame();
        } else if (gameRunning && dx !== gridSize) {
            dx = -gridSize;
            dy = 0;
            changingDirection = true;
        }
    });
    rightButton.addEventListener('click', () => {
        if (!gameRunning && startScreen.classList.contains('hidden')) {
            startGame();
        } else if (gameRunning && dx !== -gridSize) {
            dx = gridSize;
            dy = 0;
            changingDirection = true;
        }
    });
});