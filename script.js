document.addEventListener('DOMContentLoaded', () => {
    // Основные переменные
    const gridContainer = document.getElementById('grid-container');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const newGameButton = document.getElementById('new-game');
    const retryButton = document.getElementById('retry');
    const gameMessageContainer = document.querySelector('.game-message');
    const gameMessageText = document.querySelector('.game-message p');
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;
    let won = false;
    bestScoreDisplay.textContent = bestScore;
    function initGame() {
        createGrid();
        addRandomTile();
        addRandomTile();
        updateGrid();
    }
    function createGrid() {
        gridContainer.innerHTML = '';
        grid = Array(4).fill().map(() => Array(4).fill(0));
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const gridCell = document.createElement('div');
                gridCell.classList.add('grid-cell');
                gridCell.setAttribute('data-row', i);
                gridCell.setAttribute('data-col', j);
                gridContainer.appendChild(gridCell);
            }
        }
    }
    function addRandomTile() {
        if (isFull()) return;
        let added = false;
        while (!added) {
            const row = Math.floor(Math.random() * 4);
            const col = Math.floor(Math.random() * 4);
            if (grid[row][col] === 0) {
                grid[row][col] = Math.random() < 0.9 ? 2 : 4;
                added = true;
            }
        }
    }
    function isFull() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    function updateGrid() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = grid[i][j];
                const cell = gridContainer.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const existingTile = cell.querySelector('.tile');
                if (existingTile) {
                    cell.removeChild(existingTile);
                }
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.classList.add('tile', `tile-${value}`);
                    if (value > 2048) {
                        tile.classList.add('tile-super');
                    }
                    tile.textContent = value;
                    cell.appendChild(tile);
                }
            }
        }
    }
    function move(direction) {
        if (gameOver) return;
        let moved = false;
        const oldGrid = JSON.parse(JSON.stringify(grid));
        switch (direction) {
            case 'up':
                moved = moveUp();
                break;
            case 'right':
                moved = moveRight();
                break;
            case 'down':
                moved = moveDown();
                break;
            case 'left':
                moved = moveLeft();
                break;
        }
        if (moved) {
            addRandomTile();
            updateGrid();
            checkGameStatus();
        }
    }
    function moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = grid[i];
            const originalRow = [...row];
            const newRow = slideAndMerge(row);
            grid[i] = newRow;
            if (!moved && !arraysEqual(originalRow, newRow)) {
                moved = true;
            }
        }
        return moved;
    }
    function moveRight() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = [...grid[i]].reverse();
            const originalRow = [...row];
            const newRow = slideAndMerge(row);
            grid[i] = newRow.reverse();
            if (!moved && !arraysEqual(originalRow, newRow)) {
                moved = true;
            }
        }
        return moved;
    }
    function moveUp() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
            const originalColumn = [...column];
            const newColumn = slideAndMerge(column);
            for (let i = 0; i < 4; i++) {
                grid[i][j] = newColumn[i];
            }
            if (!moved && !arraysEqual(originalColumn, newColumn)) {
                moved = true;
            }
        }
        return moved;
    }
    function moveDown() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]].reverse();
            const originalColumn = [...column];
            const newColumn = slideAndMerge(column);
            const reversedColumn = newColumn.reverse();
            for (let i = 0; i < 4; i++) {
                grid[i][j] = reversedColumn[i];
            }
            if (!moved && !arraysEqual(originalColumn, newColumn)) {
                moved = true;
            }
        }
        return moved;
    }
    function slideAndMerge(row) {
        let newRow = row.filter(val => val !== 0);
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                newRow[i + 1] = 0;
                score += newRow[i];
                updateScore();
                if (newRow[i] === 2048 && !won) {
                    won = true;
                    showGameMessage('Победа!', 'game-won');
                }
            }
        }
        newRow = newRow.filter(val => val !== 0);
        while (newRow.length < 4) {
            newRow.push(0);
        }
        return newRow;
    }
    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }
    function updateScore() {
        scoreDisplay.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            bestScoreDisplay.textContent = bestScore;
            localStorage.setItem('bestScore', bestScore);
        }
    }
    function checkGameStatus() {
        if (isFull() && !canMove()) {
            gameOver = true;
            showGameMessage('Игра окончена!', 'game-over');
        }
    }
    function canMove() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i][j] === grid[i][j + 1]) {
                    return true;
                }
            }
        }
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === grid[i + 1][j]) {
                    return true;
                }
            }
        }
        return false;
    }
    function showGameMessage(message, className) {
        gameMessageText.textContent = message;
        gameMessageContainer.classList.add(className);
    }
    function resetGame() {
        grid = [];
        score = 0;
        gameOver = false;
        won = false;
        scoreDisplay.textContent = '0';
        gameMessageContainer.className = 'game-message';
        initGame();
    }
    newGameButton.addEventListener('click', resetGame);
    retryButton.addEventListener('click', resetGame);
    document.addEventListener('keydown', event => {
        if (gameOver) return;
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                move('up');
                break;
            case 'ArrowRight':
                event.preventDefault();
                move('right');
                break;
            case 'ArrowDown':
                event.preventDefault();
                move('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                move('left');
                break;
        }
    });
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    gridContainer.addEventListener('touchstart', event => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }, false);
    gridContainer.addEventListener('touchend', event => {
        touchEndX = event.changedTouches[0].clientX;
        touchEndY = event.changedTouches[0].clientY;
        handleSwipe();
    }, false);
    function handleSwipe() {
        const xDiff = touchEndX - touchStartX;
        const yDiff = touchEndY - touchStartY;
        if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 30) {
            if (xDiff > 0) {
                move('right');
            } else {
                move('left');
            }
        } else if (Math.abs(yDiff) > 30) {
            if (yDiff > 0) {
                move('down');
            } else {
                move('up');
            }
        }
    }
    initGame();
});