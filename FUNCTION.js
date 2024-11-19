// Navigation and UI Logic
function showGame(gameId) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('game-view').style.display = 'block';
    
    // Hide all game containers
    document.querySelectorAll('.game-container').forEach(container => {
        container.style.display = 'none';
    });
    
    // Show selected game
    document.getElementById(gameId).style.display = 'block';
    
    // Initialize specific game
    if (gameId === 'pingpong') {
        initPingPong();
    } else if (gameId === 'snake') {
        initSnake();
    } else if (gameId === 'memory') {
        startMemory();
    }
}

function backToHome() {
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('game-view').style.display = 'none';
}

// Category Filter Logic
document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.category-item').forEach(i => 
            i.classList.remove('active'));
        item.classList.add('active');

        // Filter games
        const category = item.textContent.toLowerCase();
        document.querySelectorAll('.game-card').forEach(card => {
            if (category === 'all games' || 
                card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Search Logic
document.querySelector('.search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.game-card').forEach(card => {
        const title = card.querySelector('.game-title').textContent.toLowerCase();
        const description = card.querySelector('.game-description')
            .textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Tic Tac Toe Logic
let currentPlayer = 'X';
let board = Array(9).fill('');
let gameActive = true;
let scores = { X: 0, O: 0 };

function makeMove(index) {
    if (board[index] === '' && gameActive) {
        board[index] = currentPlayer;
        document.getElementsByClassName('cell')[index].textContent = currentPlayer;
        
        if (checkWinner()) {
            scores[currentPlayer]++;
            updateScores();
            gameActive = false;
            setTimeout(() => {
                alert(`Player ${currentPlayer} wins!`);
            }, 100);
        } else if (board.every(cell => cell !== '')) {
            setTimeout(() => {
                alert("It's a draw!");
            }, 100);
            gameActive = false;
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }
    }
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winPatterns.some(pattern => 
        pattern.every(index => board[index] === currentPlayer));
}

function resetTicTacToe() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
}

function updateScores() {
    document.getElementById('scoreX').textContent = scores.X;
    document.getElementById('scoreO').textContent = scores.O;
}

// Ping Pong Logic
let pingpongCanvas, ctx;
let ballX, ballY, ballSpeedX, ballSpeedY;
let paddle1Y, paddle2Y;
let score = 0;
let highScore = 0;

function initPingPong() {
    pingpongCanvas = document.getElementById('pingpongCanvas');
    ctx = pingpongCanvas.getContext('2d');
    resetPingPong();
}

function resetPingPong() {
    ballX = pingpongCanvas.width / 2;
    ballY = pingpongCanvas.height / 2;
    ballSpeedX = 5;
    ballSpeedY = 2;
    paddle1Y = paddle2Y = (pingpongCanvas.height - 100) / 2;
    score = 0;
    updatePingPongScore();
}

function startPingPong() {
    resetPingPong();
    requestAnimationFrame(updatePingPong);
    
    pingpongCanvas.addEventListener('mousemove', (e) => {
        const rect = pingpongCanvas.getBoundingClientRect();
        paddle1Y = e.clientY - rect.top - 50;
    });
}

function updatePingPong() {
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    // AI paddle movement
    paddle2Y += (ballY - (paddle2Y + 50)) * 0.1;
    
    // Ball collision with top and bottom
    if (ballY < 0 || ballY > pingpongCanvas.height) {
        ballSpeedY = -ballSpeedY;
    }
    
    // Ball collision with paddles
    if (ballX < 20 && ballY > paddle1Y && ballY < paddle1Y + 100) {
        ballSpeedX = -ballSpeedX;
        score++;
        updatePingPongScore();
    }
    if (ballX > pingpongCanvas.width - 20 && ballY > paddle2Y && 
        ballY < paddle2Y + 100) {
        ballSpeedX = -ballSpeedX;
    }
    
    // Ball out of bounds
    if (ballX < 0 || ballX > pingpongCanvas.width) {
        if (score > highScore) {
            highScore = score;
            document.getElementById('pingpongHighScore').textContent = highScore;
        }
        resetPingPong();
    }
    
    // Draw everything
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, pingpongCanvas.width, pingpongCanvas.height);
    
    ctx.fillStyle = 'white';
    // Draw paddles
    ctx.fillRect(10, paddle1Y, 10, 100);
    ctx.fillRect(pingpongCanvas.width - 20, paddle2Y, 10, 100);
    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    requestAnimationFrame(updatePingPong);
}

function updatePingPongScore() {
    document.getElementById('pingpongScore').textContent = score;
}

// Snake Game Logic
let snake = [];
let food = {};
let direction = 'right';
let snakeCanvas, snakeCtx;
let snakeScore = 0;
let snakeHighScore = 0;

function initSnake() {
    snakeCanvas = document.getElementById('snakeCanvas');
    snakeCtx = snakeCanvas.getContext('2d');
    resetSnake();
}

function resetSnake() {
    snake = [
        {x: 200, y: 200},
        {x: 190, y: 200},
        {x: 180, y: 200}
    ];
    direction = 'right';
    snakeScore = 0;
    createFood();
    updateSnakeScore();
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * (snakeCanvas.width/10)) * 10,
        y: Math.floor(Math.random() * (snakeCanvas.height/10)) * 10
    };
}

function startSnake() {
    resetSnake();
    if (window.snakeInterval) clearInterval(window.snakeInterval);
    window.snakeInterval = setInterval(updateSnake, 100);
    
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp': if(direction !== 'down') direction = 'up'; break;
            case 'ArrowDown': if(direction !== 'up') direction = 'down'; break;
            case 'ArrowLeft': if(direction !== 'right') direction = 'left'; break;
            case 'ArrowRight': if(direction !== 'left') direction = 'right'; break;
        }
    });
}

function updateSnake() {
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch(direction) {
        case 'up': head.y -= 10; break;
        case 'down': head.y += 10; break;
        case 'left': head.x -= 10; break;
        case 'right': head.x += 10; break;
    }
    
    if (head.x === food.x && head.y === food.y) {
        createFood();
        snakeScore += 10;
        updateSnakeScore();
    } else {
        snake.pop();
    }
    
    if (checkCollision(head)) {
        if (snakeScore > snakeHighScore) {
            snakeHighScore = snakeScore;
            document.getElementById('snakeHighScore').textContent = snakeHighScore;
        }
        clearInterval(window.snakeInterval);
        setTimeout(() => {
            alert('Game Over! Score: ' + snakeScore);
        }, 100);
        return;
    }
    
    snake.unshift(head);
    drawSnake();
}

function checkCollision(head) {
    return head.x < 0 || head.x >= snakeCanvas.width || 
           head.y < 0 || head.y >= snakeCanvas.height ||
           snake.some(segment => segment.x === head.x && segment.y === head.y);
}

function drawSnake() {
    snakeCtx.fillStyle = 'black';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    snakeCtx.fillStyle = 'lime';
    snake.forEach(segment => {
        snakeCtx.fillRect(segment.x, segment.y, 10, 10);
    });
    
    snakeCtx.fillStyle = 'red';
    snakeCtx.fillRect(food.x, food.y, 10, 10);
}

function updateSnakeScore() {
    document.getElementById('snakeScore').textContent = snakeScore;
}

// Memory Game Logic
const MEMORY_SYMBOLS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯'];
let memoryCards = [];
let flippedCards = [];
let moves = 0;
let matchedPairs = 0;
let bestScore = Infinity;

function startMemory() {
    moves = 0;
    matchedPairs = 0;
    document.getElementById('memoryMoves').textContent = moves;
    initMemoryBoard();
}

function initMemoryBoard() {
    const grid = document.querySelector('.memory-grid');
    grid.innerHTML = '';
    memoryCards = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]
        .sort(() => Math.random() - 0.5);
    
    memoryCards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(this)) return;
    
    this.textContent = this.dataset.symbol;
    this.classList.add('flipped');
    flippedCards.push(this);
    
    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('memoryMoves').textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.symbol === card2.dataset.symbol) {
        matchedPairs++;
        flippedCards = [];
        if (matchedPairs === MEMORY_SYMBOLS.length) {
            if (moves < bestScore) {
                bestScore = moves;
                document.getElementById('memoryBest').textContent = bestScore;
            }
            setTimeout(() => {
                alert('Congratulations! You won in ' + moves + ' moves!');
            }, 500);
        }
    } else {
        setTimeout(() => {
            card1.textContent = '';
            card2.textContent = '';
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Show home view by default
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('game-view').style.display = 'none';
});
