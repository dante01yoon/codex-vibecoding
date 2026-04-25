const canvas = document.querySelector("[data-snake-canvas]");
const scoreDisplay = document.querySelector("[data-score]");
const bestScoreDisplay = document.querySelector("[data-best-score]");
const statusDisplay = document.querySelector("[data-game-status]");
const restartButton = document.querySelector("[data-game-restart]");
const directionButtons = document.querySelectorAll("[data-direction]");

if (
  canvas instanceof HTMLCanvasElement &&
  scoreDisplay &&
  bestScoreDisplay &&
  statusDisplay &&
  restartButton
) {
  const context = canvas.getContext("2d");
  const cellCount = 24;
  const cellSize = canvas.width / cellCount;
  const storageKey = "aiic-snake-best-score";
  const directions = {
    up: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
  };
  const keyDirections = {
    ArrowUp: "up",
    KeyW: "up",
    ArrowRight: "right",
    KeyD: "right",
    ArrowDown: "down",
    KeyS: "down",
    ArrowLeft: "left",
    KeyA: "left",
  };

  let snake;
  let food;
  let direction;
  let queuedDirection;
  let score;
  let bestScore = readBestScore();
  let gameState = "idle";
  let lastStepTime = 0;

  function readBestScore() {
    try {
      const savedScore = Number(localStorage.getItem(storageKey));
      return Number.isFinite(savedScore) ? savedScore : 0;
    } catch {
      return 0;
    }
  }

  function saveBestScore(nextBestScore) {
    try {
      localStorage.setItem(storageKey, String(nextBestScore));
    } catch {
      // The game still works when storage is unavailable.
    }
  }

  function createInitialSnake(initialDirection) {
    const center = Math.floor(cellCount / 2);
    const bodyStep = {
      x: -initialDirection.x,
      y: -initialDirection.y,
    };

    return [
      { x: center, y: center },
      { x: center + bodyStep.x, y: center + bodyStep.y },
      { x: center + bodyStep.x * 2, y: center + bodyStep.y * 2 },
    ];
  }

  function resetGame(nextDirection = "right", nextState = "idle") {
    direction = directions[nextDirection];
    queuedDirection = directions[nextDirection];
    snake = createInitialSnake(direction);
    score = 0;
    food = createFood();
    gameState = nextState;
    lastStepTime = 0;
    updateScore();
    updateStatus();
    updateControls(nextDirection);
    drawGame();
  }

  function createFood() {
    const openCells = [];

    for (let y = 0; y < cellCount; y += 1) {
      for (let x = 0; x < cellCount; x += 1) {
        if (!snake.some((segment) => segment.x === x && segment.y === y)) {
          openCells.push({ x, y });
        }
      }
    }

    return openCells[Math.floor(Math.random() * openCells.length)];
  }

  function updateScore() {
    scoreDisplay.textContent = String(score);
    bestScoreDisplay.textContent = String(bestScore);
  }

  function updateStatus() {
    if (gameState === "playing") {
      statusDisplay.textContent = "좋습니다. 신호를 이어가고 있습니다.";
      return;
    }

    if (gameState === "game-over") {
      statusDisplay.textContent = "게임이 끝났습니다. 다시 시작해보세요.";
      return;
    }

    statusDisplay.textContent = "방향을 정하면 게임이 시작됩니다.";
  }

  function updateControls(activeDirection) {
    directionButtons.forEach((button) => {
      button.dataset.active = String(button.dataset.direction === activeDirection);
    });
  }

  function isOpposite(nextDirection, currentDirection) {
    return (
      nextDirection.x + currentDirection.x === 0 &&
      nextDirection.y + currentDirection.y === 0
    );
  }

  function setDirection(directionName) {
    const nextDirection = directions[directionName];

    if (!nextDirection) {
      return;
    }

    if (gameState !== "playing") {
      resetGame(directionName, "playing");
      return;
    }

    if (snake.length > 1 && isOpposite(nextDirection, direction)) {
      return;
    }

    queuedDirection = nextDirection;
    updateControls(directionName);
  }

  function moveSnake() {
    direction = queuedDirection;

    const head = snake[0];
    const nextHead = {
      x: head.x + direction.x,
      y: head.y + direction.y,
    };
    const hitWall =
      nextHead.x < 0 ||
      nextHead.x >= cellCount ||
      nextHead.y < 0 ||
      nextHead.y >= cellCount;
    const willEat = nextHead.x === food.x && nextHead.y === food.y;
    const bodyCollisionZone = willEat ? snake : snake.slice(0, -1);
    const hitSelf = bodyCollisionZone.some(
      (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
    );

    if (hitWall || hitSelf) {
      endGame();
      return;
    }

    snake.unshift(nextHead);

    if (willEat) {
      score += 1;
      bestScore = Math.max(bestScore, score);
      saveBestScore(bestScore);
      food = createFood();
      updateScore();
      return;
    }

    snake.pop();
  }

  function endGame() {
    gameState = "game-over";
    updateStatus();
  }

  function drawGame() {
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawFood();
    drawSnake();
  }

  function drawBoard() {
    context.fillStyle = "#07101a";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255, 255, 255, 0.05)";
    context.lineWidth = 1;

    for (let line = 0; line <= cellCount; line += 1) {
      const position = line * cellSize;
      context.beginPath();
      context.moveTo(position, 0);
      context.lineTo(position, canvas.height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, position);
      context.lineTo(canvas.width, position);
      context.stroke();
    }
  }

  function drawFood() {
    const centerX = food.x * cellSize + cellSize / 2;
    const centerY = food.y * cellSize + cellSize / 2;

    context.fillStyle = "#ff6f91";
    context.beginPath();
    context.arc(centerX, centerY, cellSize * 0.34, 0, Math.PI * 2);
    context.fill();
  }

  function drawSnake() {
    snake.forEach((segment, index) => {
      const inset = index === 0 ? 3 : 4;
      context.fillStyle = index === 0 ? "#f6c453" : "#15d6ff";
      context.fillRect(
        segment.x * cellSize + inset,
        segment.y * cellSize + inset,
        cellSize - inset * 2,
        cellSize - inset * 2,
      );
    });
  }

  function getStepDelay() {
    return Math.max(78, 145 - Math.floor(score / 4) * 8);
  }

  function loop(timestamp) {
    if (gameState === "playing") {
      if (!lastStepTime) {
        lastStepTime = timestamp;
      }

      if (timestamp - lastStepTime >= getStepDelay()) {
        moveSnake();
        drawGame();
        lastStepTime = timestamp;
      }
    }

    requestAnimationFrame(loop);
  }

  restartButton.addEventListener("click", () => {
    resetGame("right", "playing");
  });

  directionButtons.forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      setDirection(button.dataset.direction);
    });
  });

  document.addEventListener("keydown", (event) => {
    const directionName = keyDirections[event.code];

    if (!directionName) {
      return;
    }

    event.preventDefault();
    setDirection(directionName);
  });

  resetGame();
  requestAnimationFrame(loop);
}
