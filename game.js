// Game Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
let score = 0;
let highScore = localStorage.getItem('snakeChaseHighScore') || 0;
let animationId;

// Game Settings
const GAME_SPEED = 60; // FPS
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const LANE_COUNT = 3;
const LANE_WIDTH = CANVAS_WIDTH / LANE_COUNT;
const LANE_HEIGHT = CANVAS_HEIGHT;

// Road settings
const ROAD_COLOR = '#333';
const LANE_LINE_COLOR = '#fff';
const SHOULDER_COLOR = '#222';

// Player (Snake) settings
const SNAKE_SIZE = 30;
const SNAKE_COLOR = '#00ff00';
const SNAKE_SPEED = 3;
const SNAKE_BOOST_SPEED = 6;

// Mouse settings
const MOUSE_SIZE = 20;
const MOUSE_COLOR = '#ffff00';
const MOUSE_SPEED = 2;

// Obstacle settings
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 60;
const OBSTACLE_COLOR = '#ff0000';
const OBSTACLE_SPEED = 4;

// Game Objects
let snake = {
    x: LANE_WIDTH * 1.5 - SNAKE_SIZE / 2, // Start in middle lane
    y: CANVAS_HEIGHT - 80,
    lane: 1, // 0, 1, 2 for left, middle, right
    speed: SNAKE_SPEED,
    size: SNAKE_SIZE,
    targetLane: 1,
    isBoosting: false,
    boostCooldown: 0
};

let mouse = {
    x: LANE_WIDTH * 0.5 - MOUSE_SIZE / 2,
    y: 100,
    lane: 0,
    speed: MOUSE_SPEED,
    size: MOUSE_SIZE,
    direction: 1, // 1 for right, -1 for left
    changeDirectionTimer: 0
};

let obstacles = [];
let particles = [];

// Input handling
let keys = {};
let lastTime = 0;

// Initialize high score display
document.getElementById('high-score').textContent = highScore;

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (gameState === 'playing') {
        handleGameInput(e.code);
    } else if (gameState === 'paused' && e.code === 'KeyP') {
        resumeGame();
    }
    
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Mobile touch controls
function setupMobileControls() {
    const isMobile = window.innerWidth <= 768;
    const mobileControls = document.getElementById('mobile-controls');
    
    if (isMobile) {
        mobileControls.style.display = 'flex';
        
        // Lane controls
        document.getElementById('lane-up').addEventListener('touchstart', (e) => {
            e.preventDefault();
            changeLane(-1);
        });
        
        document.getElementById('lane-down').addEventListener('touchstart', (e) => {
            e.preventDefault();
            changeLane(1);
        });
        
        // Speed controls
        let speedInterval;
        document.getElementById('speed-up').addEventListener('touchstart', (e) => {
            e.preventDefault();
            speedInterval = setInterval(() => {
                if (snake.y > 50) snake.y -= 2;
            }, 50);
        });
        
        document.getElementById('speed-up').addEventListener('touchend', () => {
            clearInterval(speedInterval);
        });
        
        document.getElementById('slow-down').addEventListener('touchstart', (e) => {
            e.preventDefault();
            speedInterval = setInterval(() => {
                if (snake.y < CANVAS_HEIGHT - 100) snake.y += 1;
            }, 50);
        });
        
        document.getElementById('slow-down').addEventListener('touchend', () => {
            clearInterval(speedInterval);
        });
        
        // Boost control
        document.getElementById('boost').addEventListener('touchstart', (e) => {
            e.preventDefault();
            activateBoost();
        });
    }
}

// Game Functions
function handleGameInput(keyCode) {
    switch(keyCode) {
        case 'ArrowUp':
        case 'KeyW':
            changeLane(-1);
            break;
        case 'ArrowDown':
        case 'KeyS':
            changeLane(1);
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (snake.y > 50) snake.y -= 2;
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (snake.y < CANVAS_HEIGHT - 100) snake.y += 2;
            break;
        case 'Space':
            activateBoost();
            break;
        case 'KeyP':
            pauseGame();
            break;
    }
}

function changeLane(direction) {
    const newLane = Math.max(0, Math.min(2, snake.lane + direction));
    if (newLane !== snake.lane) {
        snake.targetLane = newLane;
        snake.lane = newLane;
        playSound('move');
    }
}

function activateBoost() {
    if (snake.boostCooldown <= 0) {
        snake.isBoosting = true;
        snake.boostCooldown = 120; // 2 seconds at 60fps
        setTimeout(() => {
            snake.isBoosting = false;
        }, 500); // Boost lasts 0.5 seconds
        playSound('boost');
    }
}

function startGame() {
    gameState = 'playing';
    score = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    
    // Reset game objects
    resetGameObjects();
    
    // Start game loop
    gameLoop();
    playBackgroundMusic();
}

function restartGame() {
    startGame();
}

function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        document.getElementById('pause-screen').style.display = 'flex';
        stopBackgroundMusic();
    }
}

function resumeGame() {
    if (gameState === 'paused') {
        gameState = 'playing';
        document.getElementById('pause-screen').style.display = 'none';
        playBackgroundMusic();
    }
}

function gameOver() {
    gameState = 'gameOver';
    document.getElementById('final-score').textContent = score;
    
    // Check for high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeChaseHighScore', highScore);
        document.getElementById('high-score').textContent = highScore;
        document.getElementById('new-high-score').style.display = 'block';
    } else {
        document.getElementById('new-high-score').style.display = 'none';
    }
    
    document.getElementById('game-over-screen').style.display = 'flex';
    stopBackgroundMusic();
    playSound('gameOver');
}

function resetGameObjects() {
    // Reset snake
    snake.x = LANE_WIDTH * 1.5 - SNAKE_SIZE / 2;
    snake.y = CANVAS_HEIGHT - 80;
    snake.lane = 1;
    snake.targetLane = 1;
    snake.speed = SNAKE_SPEED;
    snake.isBoosting = false;
    snake.boostCooldown = 0;
    
    // Reset mouse
    mouse.x = LANE_WIDTH * 0.5 - MOUSE_SIZE / 2;
    mouse.y = 100;
    mouse.lane = 0;
    mouse.direction = 1;
    mouse.changeDirectionTimer = 0;
    
    // Clear obstacles and particles
    obstacles = [];
    particles = [];
}

function gameLoop(currentTime = 0) {
    if (gameState !== 'playing') return;
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Update game objects
    updateSnake();
    updateMouse();
    updateObstacles();
    updateParticles();
    checkCollisions();
    
    // Render everything
    render();
    
    // Continue game loop
    animationId = requestAnimationFrame(gameLoop);
}

function updateSnake() {
    // Update boost cooldown
    if (snake.boostCooldown > 0) {
        snake.boostCooldown--;
    }
    
    // Move snake towards target lane
    const targetX = LANE_WIDTH * snake.targetLane + LANE_WIDTH / 2 - SNAKE_SIZE / 2;
    if (Math.abs(snake.x - targetX) > 2) {
        snake.x += (targetX - snake.x) * 0.2;
    } else {
        snake.x = targetX;
    }
    
    // Apply current speed (boost or normal)
    const currentSpeed = snake.isBoosting ? SNAKE_BOOST_SPEED : snake.speed;
    
    // Auto-move snake forward slightly
    if (snake.y > 50) {
        snake.y -= currentSpeed * 0.3;
    }
}

function updateMouse() {
    // Move mouse horizontally
    mouse.x += mouse.direction * mouse.speed;
    
    // Change direction timer
    mouse.changeDirectionTimer++;
    if (mouse.changeDirectionTimer > 60) { // Change direction every second
        if (Math.random() < 0.3) { // 30% chance to change direction
            mouse.direction *= -1;
        }
        mouse.changeDirectionTimer = 0;
    }
    
    // Keep mouse within lane boundaries
    const leftBound = mouse.lane * LANE_WIDTH + 10;
    const rightBound = (mouse.lane + 1) * LANE_WIDTH - mouse.size - 10;
    
    if (mouse.x <= leftBound || mouse.x >= rightBound) {
        mouse.direction *= -1;
        mouse.x = Math.max(leftBound, Math.min(rightBound, mouse.x));
    }
    
    // Occasionally change lanes
    if (Math.random() < 0.005) { // 0.5% chance per frame
        const newLane = Math.floor(Math.random() * LANE_COUNT);
        if (newLane !== mouse.lane) {
            mouse.lane = newLane;
            mouse.x = newLane * LANE_WIDTH + LANE_WIDTH / 2 - mouse.size / 2;
        }
    }
    
    // Move mouse down slowly
    mouse.y += 0.5;
    
    // Reset mouse position if it goes off screen
    if (mouse.y > CANVAS_HEIGHT + 50) {
        mouse.y = -50;
        mouse.lane = Math.floor(Math.random() * LANE_COUNT);
        mouse.x = mouse.lane * LANE_WIDTH + LANE_WIDTH / 2 - mouse.size / 2;
    }
}

function updateObstacles() {
    // Spawn new obstacles
    if (Math.random() < 0.02) { // 2% chance per frame
        const lane = Math.floor(Math.random() * LANE_COUNT);
        obstacles.push({
            x: lane * LANE_WIDTH + LANE_WIDTH / 2 - OBSTACLE_WIDTH / 2,
            y: -OBSTACLE_HEIGHT,
            lane: lane,
            width: OBSTACLE_WIDTH,
            height: OBSTACLE_HEIGHT,
            speed: OBSTACLE_SPEED + Math.random() * 2
        });
    }
    
    // Update obstacle positions
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.y += obstacle.speed;
        
        // Remove obstacles that are off screen
        if (obstacle.y > CANVAS_HEIGHT + 50) {
            obstacles.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Check snake-mouse collision
    if (checkCollision(snake, mouse)) {
        score += 10;
        document.getElementById('score').textContent = score;
        
        // Create celebration particles
        createParticles(mouse.x + mouse.size / 2, mouse.y + mouse.size / 2, '#ffff00');
        
        // Reset mouse position
        mouse.y = -50;
        mouse.lane = Math.floor(Math.random() * LANE_COUNT);
        mouse.x = mouse.lane * LANE_WIDTH + LANE_WIDTH / 2 - mouse.size / 2;
        
        playSound('catch');
    }
    
    // Check snake-obstacle collisions
    for (const obstacle of obstacles) {
        if (checkCollision(snake, obstacle)) {
            // Create explosion particles
            createParticles(snake.x + snake.size / 2, snake.y + snake.size / 2, '#ff0000');
            gameOver();
            return;
        }
    }
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + (obj2.width || obj2.size) &&
           obj1.x + (obj1.width || obj1.size) > obj2.x &&
           obj1.y < obj2.y + (obj2.height || obj2.size) &&
           obj1.y + (obj1.height || obj1.size) > obj2.y;
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            color: color
        });
    }
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw road
    drawRoad();
    
    // Draw game objects
    drawMouse();
    drawObstacles();
    drawSnake();
    drawParticles();
    
    // Draw UI elements
    drawBoostMeter();
}

function drawRoad() {
    // Draw road background
    ctx.fillStyle = ROAD_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw shoulders
    ctx.fillStyle = SHOULDER_COLOR;
    ctx.fillRect(0, 0, 20, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 20, 0, 20, CANVAS_HEIGHT);
    
    // Draw lane lines
    ctx.strokeStyle = LANE_LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    
    for (let i = 1; i < LANE_COUNT; i++) {
        const x = i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    ctx.setLineDash([]); // Reset line dash
}

function drawSnake() {
    // Draw boost effect
    if (snake.isBoosting) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(snake.x - 5, snake.y - 5, snake.size + 10, snake.size + 10);
    }
    
    // Draw snake body
    ctx.fillStyle = SNAKE_COLOR;
    ctx.fillRect(snake.x, snake.y, snake.size, snake.size);
    
    // Draw snake eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(snake.x + 5, snake.y + 8, 4, 4);
    ctx.fillRect(snake.x + snake.size - 9, snake.y + 8, 4, 4);
    
    // Draw snake outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(snake.x, snake.y, snake.size, snake.size);
}

function drawMouse() {
    // Draw mouse body
    ctx.fillStyle = MOUSE_COLOR;
    ctx.fillRect(mouse.x, mouse.y, mouse.size, mouse.size);
    
    // Draw mouse ears
    ctx.fillStyle = MOUSE_COLOR;
    ctx.fillRect(mouse.x + 2, mouse.y - 3, 4, 5);
    ctx.fillRect(mouse.x + mouse.size - 6, mouse.y - 3, 4, 5);
    
    // Draw mouse tail
    ctx.strokeStyle = MOUSE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mouse.x + mouse.size / 2, mouse.y + mouse.size);
    ctx.lineTo(mouse.x + mouse.size / 2 + 5, mouse.y + mouse.size + 8);
    ctx.stroke();
    
    // Draw mouse outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(mouse.x, mouse.y, mouse.size, mouse.size);
}

function drawObstacles() {
    ctx.fillStyle = OBSTACLE_COLOR;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    
    for (const obstacle of obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Draw obstacle details (like a car)
        ctx.fillStyle = '#fff';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 10, 8, 6);
        ctx.fillRect(obstacle.x + obstacle.width - 13, obstacle.y + 10, 8, 6);
        ctx.fillStyle = OBSTACLE_COLOR;
    }
}

function drawParticles() {
    for (const particle of particles) {
        const alpha = particle.life / 30;
        ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fillRect(particle.x, particle.y, 3, 3);
    }
}

function drawBoostMeter() {
    const meterWidth = 100;
    const meterHeight = 10;
    const meterX = CANVAS_WIDTH - meterWidth - 20;
    const meterY = 20;
    
    // Draw meter background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(meterX - 5, meterY - 5, meterWidth + 10, meterHeight + 10);
    
    // Draw meter border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
    
    // Draw boost availability
    if (snake.boostCooldown > 0) {
        const progress = (120 - snake.boostCooldown) / 120;
        ctx.fillStyle = '#ff6b00';
        ctx.fillRect(meterX + 1, meterY + 1, (meterWidth - 2) * progress, meterHeight - 2);
    } else {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(meterX + 1, meterY + 1, meterWidth - 2, meterHeight - 2);
    }
    
    // Draw label
    ctx.fillStyle = '#fff';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText('BOOST', meterX, meterY - 8);
}

// Initialize game
function init() {
    setupMobileControls();
    
    // Resize canvas for mobile
    function resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        const containerWidth = container.clientWidth;
        
        if (window.innerWidth <= 768) {
            const scale = Math.min(containerWidth / CANVAS_WIDTH, 0.8);
            canvas.style.width = (CANVAS_WIDTH * scale) + 'px';
            canvas.style.height = (CANVAS_HEIGHT * scale) + 'px';
        } else {
            canvas.style.width = CANVAS_WIDTH + 'px';
            canvas.style.height = CANVAS_HEIGHT + 'px';
        }
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start with the start screen
    document.getElementById('start-screen').style.display = 'flex';
}

// Initialize when page loads
window.addEventListener('load', init);
