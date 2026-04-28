document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const minesCountElement = document.getElementById('mines-count');
    const timerElement = document.getElementById('timer');
    const resetButton = document.getElementById('reset-button');
    const difficultySelect = document.getElementById('difficulty');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverMessage = document.getElementById('game-over-message');
    const playAgainButton = document.getElementById('play-again-button');

    let board = [];
    let rows = 9;
    let cols = 9;
    let mines = 10;
    let cellsOpened = 0;
    let flagsPlaced = 0;
    let gameStarted = false;
    let gameOver = false;
    let timerInterval;
    let seconds = 0;

    const difficulties = {
        easy: { rows: 8, cols: 10, mines: 10 },
        medium: { rows: 14, cols: 20, mines: 40 },
        hard: { rows: 20, cols: 24, mines: 99 } 
    };

    function initGame() {
        const difficulty = difficultySelect.value;
        rows = difficulties[difficulty].rows;
        cols = difficulties[difficulty].cols;
        mines = difficulties[difficulty].mines;

        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        // Déterminer la taille des cellules en fonction de la difficulté
        let cellSize = 30; 
        if (difficulty === 'hard') {
            cellSize = 25; 
        }
        
        // Appliquer la taille des cellules via une variable CSS pour le style
        boardElement.style.setProperty('--cell-size', `${cellSize}px`);
        
        // Calculer la largeur du plateau en fonction de la taille des cellules
        boardElement.style.width = `${cols * cellSize + 4}px`;
        
        board = Array(rows).fill(0).map(() => Array(cols).fill({
            isMine: false,
            isOpen: false,
            isFlagged: false,
            minesAround: 0
        }));
        cellsOpened = 0;
        flagsPlaced = 0;
        gameStarted = false;
        gameOver = false;
        minesCountElement.textContent = mines;
        resetButton.textContent = '😊';
        gameOverScreen.classList.add('hidden');
        stopTimer();
        seconds = 0;
        timerElement.textContent = '00:00';

        createBoardCells();
    }

    function createBoardCells() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('contextmenu', handleCellRightClick);
                boardElement.appendChild(cell);
            }
        }
    }

    function placeMines(initialRow, initialCol) {
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);

            // S'assurer que la mine n'est pas placée sur le clic initial ou ses voisins immédiats
            if (!board[r][c].isMine && !(r >= initialRow - 1 && r <= initialRow + 1 && c >= initialCol - 1 && c <= initialCol + 1)) {
                board[r][c] = { ...board[r][c], isMine: true };
                minesPlaced++;
            }
        }
        calculateMinesAround();
    }

    function calculateMinesAround() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!board[r][c].isMine) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                                count++;
                            }
                        }
                    }
                    board[r][c] = { ...board[r][c], minesAround: count };
                }
            }
        }
    }

    function handleCellClick(event) {
        if (gameOver) return;

        const cellElement = event.target;
        const r = parseInt(cellElement.dataset.row);
        const c = parseInt(cellElement.dataset.col);

        if (!gameStarted) {
            gameStarted = true;
            startTimer();
            placeMines(r, c); // Placer les mines après le premier clic
        }

        if (board[r][c].isOpen || board[r][c].isFlagged) return;

        if (board[r][c].isMine) {
            revealMines(r, c);
            endGame(false); 
        } else {
            openCell(r, c);
            checkWin();
        }
    }

    function handleCellRightClick(event) {
        event.preventDefault(); 
        if (gameOver || !gameStarted) return;

        const cellElement = event.target;
        const r = parseInt(cellElement.dataset.row);
        const c = parseInt(cellElement.dataset.col);

        if (board[r][c].isOpen) return;

        if (board[r][c].isFlagged) {
            board[r][c] = { ...board[r][c], isFlagged: false };
            cellElement.classList.remove('flagged');
            cellElement.textContent = '';
            flagsPlaced--;
        } else if (flagsPlaced < mines) {
            board[r][c] = { ...board[r][c], isFlagged: true };
            cellElement.classList.add('flagged');
            cellElement.textContent = '🚩';
            flagsPlaced++;
        }
        minesCountElement.textContent = mines - flagsPlaced;
    }

    function openCell(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c].isOpen || board[r][c].isMine || board[r][c].isFlagged) {
            return;
        }

        board[r][c] = { ...board[r][c], isOpen: true };
        const cellElement = boardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        cellElement.classList.add('opened');
        cellsOpened++;

        if (board[r][c].minesAround > 0) {
            cellElement.textContent = board[r][c].minesAround;
            cellElement.dataset.mines = board[r][c].minesAround; 
        } else {
            // Révèle aussi les voisins si il n'y a pas de bombes autour
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    openCell(r + dr, c + dc);
                }
            }
        }
    }

    function revealMines(explodedRow, explodedCol) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellElement = boardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (board[r][c].isMine) {
                    cellElement.classList.add('mine');
                    cellElement.textContent = '💣';
                    if (r === explodedRow && c === explodedCol) {
                        cellElement.classList.add('exploded');
                    }
                } else if (board[r][c].isFlagged) {
                    // Montrer les mauvais drapeaux
                    cellElement.textContent = '❌';
                    cellElement.style.backgroundColor = '#f0f0f0';
                }
            }
        }
    }

    function checkWin() {
        if (cellsOpened === (rows * cols) - mines) {
            endGame(true); 
        }
    }

    function endGame(win) {
        gameOver = true;
        stopTimer();
        if (win) {
            gameOverMessage.textContent = '🎉 Vous avez gagné ! 🎉';
            resetButton.textContent = '😎';
            // Mettre un drapeau sur les mines restantes
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (board[r][c].isMine && !board[r][c].isFlagged) {
                        const cellElement = boardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                        cellElement.classList.add('flagged');
                        cellElement.textContent = '🚩';
                        flagsPlaced++;
                    }
                }
            }
            minesCountElement.textContent = mines - flagsPlaced;
        } else {
            gameOverMessage.textContent = '💥 Game Over ! 💥';
            resetButton.textContent = '😵';
        }
        gameOverScreen.classList.remove('hidden');
    }

    function startTimer() {
        stopTimer(); 
        timerInterval = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timerElement.textContent = 
                `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    
    resetButton.addEventListener('click', initGame);
    difficultySelect.addEventListener('change', initGame);
    playAgainButton.addEventListener('click', initGame);

    
    initGame();
});