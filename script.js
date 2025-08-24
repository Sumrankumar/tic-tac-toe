console.log("Welcome to Tic Tac Toe - Enhanced Version with AI!");

// Game state variables
let gameState = {
    turn: "X",
    isGameOver: false,
    board: ["", "", "", "", "", "", "", "", ""],
    scores: { X: 0, O: 0 },
    soundEnabled: true,
    gameHistory: [],
    gameMode: "2player", // "2player" or "computer"
    difficulty: "medium" // "easy", "medium", "hard"
};

// Audio elements
let music = new Audio("music.mp3");
let audioTurn = new Audio("ting.mp3");
let gameover = new Audio("gameover.mp3");

// DOM elements
const boxes = document.querySelectorAll('.box');
const currentPlayerElement = document.getElementById('currentPlayer');
const infoElement = document.querySelector('.info');
const resetButton = document.getElementById('reset');
const newGameButton = document.getElementById('newGame');
const soundToggleButton = document.getElementById('soundToggle');
const scoreXElement = document.querySelector('.scoreX');
const scoreOElement = document.querySelector('.scoreO');
const lineElement = document.querySelector('.line');
const imgElement = document.querySelector('.imgbox img');
const mode2PlayerButton = document.getElementById('mode2Player');
const modeComputerButton = document.getElementById('modeComputer');
const difficultySelector = document.getElementById('difficultySelector');
const difficultySelect = document.getElementById('difficulty');

// Win combinations with proper positioning
const winCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal left to right
    [2, 4, 6]  // Diagonal right to left
];

// Line positions for win animation
const linePositions = [
    { x: 5, y: 5, rotation: 0 },    // Top row
    { x: 5, y: 15, rotation: 0 },   // Middle row
    { x: 5, y: 25, rotation: 0 },   // Bottom row
    { x: -5, y: 15, rotation: 90 }, // Left column
    { x: 5, y: 15, rotation: 90 },  // Middle column
    { x: 15, y: 15, rotation: 90 }, // Right column
    { x: 5, y: 15, rotation: 45 },  // Diagonal left to right
    { x: 5, y: 15, rotation: 135 }  // Diagonal right to left
];

// Initialize the game
function initGame() {
    updateDisplay();
    addEventListeners();
    loadScores();
    loadGameMode();
}

// Add event listeners
function addEventListeners() {
    boxes.forEach((box, index) => {
        box.addEventListener('click', () => handleBoxClick(index));
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleBoxClick(index);
            }
        });
    });

    resetButton.addEventListener('click', resetGame);
    newGameButton.addEventListener('click', newGame);
    soundToggleButton.addEventListener('click', toggleSound);
    mode2PlayerButton.addEventListener('click', () => switchGameMode('2player'));
    modeComputerButton.addEventListener('click', () => switchGameMode('computer'));
    difficultySelect.addEventListener('change', (e) => {
        gameState.difficulty = e.target.value;
        saveGameMode();
    });
}

// Switch game mode
function switchGameMode(mode) {
    gameState.gameMode = mode;
    
    // Update button states
    mode2PlayerButton.classList.toggle('active', mode === '2player');
    modeComputerButton.classList.toggle('active', mode === 'computer');
    
    // Show/hide difficulty selector
    difficultySelector.style.display = mode === 'computer' ? 'block' : 'none';
    
    // Reset game when switching modes
    resetGame();
    
    // Update display
    updateDisplay();
    
    // Save mode preference
    saveGameMode();
}

// Save game mode preferences
function saveGameMode() {
    localStorage.setItem('ticTacToeGameMode', JSON.stringify({
        mode: gameState.gameMode,
        difficulty: gameState.difficulty
    }));
}

// Load game mode preferences
function loadGameMode() {
    const savedMode = localStorage.getItem('ticTacToeGameMode');
    if (savedMode) {
        const { mode, difficulty } = JSON.parse(savedMode);
        gameState.gameMode = mode;
        gameState.difficulty = difficulty;
        
        // Update UI
        mode2PlayerButton.classList.toggle('active', mode === '2player');
        modeComputerButton.classList.toggle('active', mode === 'computer');
        difficultySelector.style.display = mode === 'computer' ? 'block' : 'none';
        difficultySelect.value = difficulty;
    }
}

// Handle box click
function handleBoxClick(index) {
    if (gameState.isGameOver || gameState.board[index] !== "") {
        return;
    }

    // Play sound if enabled
    if (gameState.soundEnabled) {
        audioTurn.play().catch(e => console.log("Audio play failed:", e));
    }

    // Update board
    gameState.board[index] = gameState.turn;
    boxes[index].querySelector('.boxtext').textContent = gameState.turn;
    
    // Add animation class
    boxes[index].classList.add('played');

    // Check for win or draw
    if (checkWin()) {
        handleGameEnd('win');
    } else if (checkDraw()) {
        handleGameEnd('draw');
    } else {
        // Continue game
        gameState.turn = gameState.turn === "X" ? "O" : "X";
        updateDisplay();
        
        // If playing against computer and it's computer's turn
        if (gameState.gameMode === 'computer' && gameState.turn === 'O') {
            setTimeout(() => {
                makeComputerMove();
            }, 500); // Small delay for better UX
        }
    }
}

// Make computer move
function makeComputerMove() {
    if (gameState.isGameOver) return;
    
    let moveIndex;
    
    switch (gameState.difficulty) {
        case 'easy':
            moveIndex = getRandomMove();
            break;
        case 'medium':
            moveIndex = Math.random() < 0.7 ? getSmartMove() : getRandomMove();
            break;
        case 'hard':
            moveIndex = getSmartMove();
            break;
        default:
            moveIndex = getRandomMove();
    }
    
    if (moveIndex !== -1) {
        // Simulate click
        handleBoxClick(moveIndex);
    }
}

// Get random move
function getRandomMove() {
    const emptyCells = gameState.board
        .map((cell, index) => cell === "" ? index : -1)
        .filter(index => index !== -1);
    
    if (emptyCells.length === 0) return -1;
    
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Get smart move (AI logic)
function getSmartMove() {
    // First, try to win
    let moveIndex = findWinningMove('O');
    if (moveIndex !== -1) return moveIndex;
    
    // Second, block player from winning
    moveIndex = findWinningMove('X');
    if (moveIndex !== -1) return moveIndex;
    
    // Third, take center if available
    if (gameState.board[4] === "") return 4;
    
    // Fourth, take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => gameState.board[index] === "");
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Finally, take any available edge
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(index => gameState.board[index] === "");
    if (availableEdges.length > 0) {
        return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }
    
    return -1;
}

// Find winning move for a player
function findWinningMove(player) {
    for (let i = 0; i < winCombinations.length; i++) {
        const [a, b, c] = winCombinations[i];
        const combination = [gameState.board[a], gameState.board[b], gameState.board[c]];
        
        // Count player's marks and empty cells
        const playerCount = combination.filter(cell => cell === player).length;
        const emptyCount = combination.filter(cell => cell === "").length;
        
        if (playerCount === 2 && emptyCount === 1) {
            // Find the empty cell
            if (gameState.board[a] === "") return a;
            if (gameState.board[b] === "") return b;
            if (gameState.board[c] === "") return c;
        }
    }
    return -1;
}

// Check for win
function checkWin() {
    for (let i = 0; i < winCombinations.length; i++) {
        const [a, b, c] = winCombinations[i];
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            
            // Animate winning line
            animateWinningLine(i);
            return true;
        }
    }
    return false;
}

// Check for draw
function checkDraw() {
    return gameState.board.every(cell => cell !== "");
}

// Handle game end
function handleGameEnd(result) {
    gameState.isGameOver = true;
    
    if (result === 'win') {
        // Update scores
        gameState.scores[gameState.turn]++;
        saveScores();
        
        // Play win sound
        if (gameState.soundEnabled) {
            gameover.play().catch(e => console.log("Audio play failed:", e));
        }
        
        // Show celebration
        imgElement.style.width = "200px";
        
        // Update display
        const winner = gameState.turn;
        const opponent = gameState.gameMode === 'computer' && winner === 'X' ? 'You' : winner;
        infoElement.innerHTML = `<b>${opponent} Won! 🎉</b>`;
        
        // Add to history
        gameState.gameHistory.push({
            winner: gameState.turn,
            date: new Date().toLocaleDateString(),
            board: [...gameState.board],
            mode: gameState.gameMode,
            difficulty: gameState.difficulty
        });
        
    } else if (result === 'draw') {
        infoElement.innerHTML = `<b>It's a Draw! 🤝</b>`;
        
        // Add to history
        gameState.gameHistory.push({
            winner: 'Draw',
            date: new Date().toLocaleDateString(),
            board: [...gameState.board],
            mode: gameState.gameMode,
            difficulty: gameState.difficulty
        });
    }
    
    updateScoreDisplay();
}

// Animate winning line
function animateWinningLine(combinationIndex) {
    const position = linePositions[combinationIndex];
    lineElement.style.width = "20vw";
    lineElement.style.transform = `translate(${position.x}vw, ${position.y}vw) rotate(${position.rotation}deg)`;
}

// Reset game (keep scores)
function resetGame() {
    gameState.board = ["", "", "", "", "", "", "", "", ""];
    gameState.turn = "X";
    gameState.isGameOver = false;
    
    // Clear board display
    boxes.forEach(box => {
        box.querySelector('.boxtext').textContent = "";
        box.classList.remove('played');
    });
    
    // Reset line and image
    lineElement.style.width = "0vw";
    imgElement.style.width = "0px";
    
    updateDisplay();
}

// New game (reset scores)
function newGame() {
    if (confirm("Are you sure you want to start a new game? This will reset all scores.")) {
        gameState.scores = { X: 0, O: 0 };
        saveScores();
        resetGame();
        updateScoreDisplay();
    }
}

// Toggle sound
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    soundToggleButton.textContent = gameState.soundEnabled ? "🔊" : "🔇";
    soundToggleButton.setAttribute('aria-label', 
        gameState.soundEnabled ? 'Mute Sound' : 'Unmute Sound');
}

// Update display
function updateDisplay() {
    currentPlayerElement.textContent = gameState.turn;
    
    if (!gameState.isGameOver) {
        let turnText = `Turn for <b>${gameState.turn}</b>`;
        
        if (gameState.gameMode === 'computer') {
            if (gameState.turn === 'X') {
                turnText = `Your turn <b>X</b>`;
            } else {
                turnText = `Computer's turn <b>O</b>`;
            }
        }
        
        infoElement.innerHTML = turnText;
    }
}

// Update score display
function updateScoreDisplay() {
    scoreXElement.textContent = gameState.scores.X;
    scoreOElement.textContent = gameState.scores.O;
}

// Save scores to localStorage
function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(gameState.scores));
}

// Load scores from localStorage
function loadScores() {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
        gameState.scores = JSON.parse(savedScores);
        updateScoreDisplay();
    }
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        resetGame();
    } else if (e.key === 'n' || e.key === 'N') {
        newGame();
    } else if (e.key === 'm' || e.key === 'M') {
        toggleSound();
    }
});

// Add hover sound effect (optional)
boxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
        if (gameState.soundEnabled && !gameState.isGameOver) {
            // Could add a subtle hover sound here
        }
    });
});

// Add some fun Easter eggs
console.log("🎮 Tic Tac Toe Enhanced Edition with AI!");
console.log("💡 Tips: Press 'R' to reset, 'N' for new game, 'M' to toggle sound");
console.log("🤖 New: Play against the computer with 3 difficulty levels!");
console.log("🚀 Enjoy the improved gaming experience!");

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);