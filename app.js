const STEP_DELAY_MS = 700;
const DEFAULT_START = [1, 2, 3, 4, 5, 6, 7, 0, 8];
const DEFAULT_GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const TILE_IMAGE_PATHS = Array.from({ length: 9 }, (_, number) => `Fossils/Fossil${number}.jpeg`);

const {
  boardToKey,
  getNeighbors,
  isSolvable,
  solvePuzzle,
  validateBoard,
} = window.PuzzleSolver;

const startBoardElement = document.querySelector("#startBoard");
const goalBoardElement = document.querySelector("#goalBoard");
const paletteElement = document.querySelector("#numberPalette");
const statusText = document.querySelector("#statusText");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const stepButton = document.querySelector("#stepButton");
const resetButton = document.querySelector("#resetButton");
const shuffleStartButton = document.querySelector("#shuffleStart");
const resetGoalButton = document.querySelector("#resetGoal");

const state = {
  start: [...DEFAULT_START],
  goal: [...DEFAULT_GOAL],
  selectedBoard: "start",
  selectedIndex: 0,
  solution: [],
  playbackIndex: 0,
  timerId: null,
};

function setStatus(message, type = "") {
  statusText.textContent = message;
  statusText.className = `status ${type}`.trim();
}

function isPlaying() {
  return state.timerId !== null;
}

function getSelectedBoard() {
  return state.selectedBoard === "goal" ? state.goal : state.start;
}

function render() {
  renderBoard(startBoardElement, state.start, "start");
  renderBoard(goalBoardElement, state.goal, "goal");
  renderPalette();
  const hasSolution = state.solution.length > 0;
  pauseButton.disabled = !isPlaying();
  stepButton.disabled = isPlaying();
  resetButton.disabled = !hasSolution && boardToKey(state.start) === boardToKey(DEFAULT_START);
}

function renderBoard(element, board, boardName) {
  element.innerHTML = "";
  board.forEach((number, index) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = [
      "tile",
      number === 0 ? "empty" : "",
      state.selectedBoard === boardName && state.selectedIndex === index ? "selected" : "",
      isPlaying() ? "locked" : "",
    ].filter(Boolean).join(" ");
    decorateTile(tile, number);
    tile.setAttribute("aria-label", `${boardName} position ${index + 1}, fossil tile ${number}`);
    tile.addEventListener("click", () => {
      if (isPlaying()) return;
      state.selectedBoard = boardName;
      state.selectedIndex = index;
      render();
    });
    element.append(tile);
  });
}

function decorateTile(element, number) {
  element.style.setProperty("--tile-image", `url("${TILE_IMAGE_PATHS[number]}")`);

  const label = document.createElement("span");
  label.className = "tile-number";
  label.textContent = number;
  label.setAttribute("aria-hidden", "true");
  element.append(label);
}

function renderPalette() {
  const selectedBoard = getSelectedBoard();
  paletteElement.innerHTML = "";
  for (let number = 0; number <= 8; number += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = ["palette-button", selectedBoard.includes(number) ? "used" : ""].filter(Boolean).join(" ");
    decorateTile(button, number);
    button.setAttribute("aria-label", `Put fossil tile ${number} in selected square`);
    button.addEventListener("click", () => setSelectedTile(number));
    paletteElement.append(button);
  }
}

function setSelectedTile(number) {
  if (isPlaying()) return;
  const board = getSelectedBoard();
  const existingIndex = board.indexOf(number);
  const currentValue = board[state.selectedIndex];

  if (existingIndex !== -1 && existingIndex !== state.selectedIndex) {
    board[existingIndex] = currentValue;
  }

  board[state.selectedIndex] = number;
  clearSolution();
  render();
}

function clearSolution() {
  stopPlayback();
  state.solution = [];
  state.playbackIndex = 0;
}

function resetPlayback() {
  stopPlayback();
  if (state.solution.length > 0) {
    state.start = [...state.solution[0]];
  } else {
    state.start = [...DEFAULT_START];
  }
  state.playbackIndex = 0;
  setStatus("Playback reset. Press Start to solve again.");
  render();
}

function startSolving() {
  stopPlayback();
  const startError = validateBoard(state.start, "Start board");
  const goalError = validateBoard(state.goal, "Goal board");

  if (startError || goalError) {
    setStatus(startError || goalError, "error");
    render();
    return;
  }

  if (!isSolvable(state.start, state.goal)) {
    setStatus("This start board cannot reach that goal board. Swap any two non-zero tiles and try again.", "error");
    render();
    return;
  }

  if (state.solution.length === 0 || state.playbackIndex >= state.solution.length - 1) {
    state.solution = solvePuzzle([...state.start], [...state.goal]);
    state.playbackIndex = 0;
  }

  if (state.solution.length <= 1) {
    setStatus("Already solved.", "success");
    render();
    return;
  }

  setStatus(`Solution found: ${state.solution.length - 1} moves. Playing one move every 0.7 seconds.`, "success");
  state.timerId = window.setInterval(playNextStep, STEP_DELAY_MS);
  render();
}

function playNextStep() {
  if (state.playbackIndex >= state.solution.length - 1) {
    stopPlayback();
    setStatus("Solved! The start board now matches the goal board.", "success");
    render();
    return;
  }

  state.playbackIndex += 1;
  state.start = [...state.solution[state.playbackIndex]];
  setStatus(`Move ${state.playbackIndex} of ${state.solution.length - 1}.`);
  render();
}

function stopPlayback() {
  if (state.timerId !== null) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function pausePlayback() {
  stopPlayback();
  setStatus("Paused. Press Start to continue or Step once to move manually.");
  render();
}

function stepOnce() {
  if (state.solution.length === 0 || state.playbackIndex >= state.solution.length - 1) {
    startSolving();
    stopPlayback();
    if (state.solution.length > 1) playNextStep();
    render();
  } else {
    playNextStep();
  }
}

function shuffleStartBoard() {
  clearSolution();
  let shuffled = [...state.goal];
  for (let i = 0; i < 80; i += 1) {
    const neighbors = getNeighbors(shuffled);
    shuffled = neighbors[Math.floor(Math.random() * neighbors.length)];
  }
  state.start = shuffled;
  state.selectedBoard = "start";
  state.selectedIndex = state.start.indexOf(0);
  setStatus("Shuffled a solvable start board.");
  render();
}

startButton.addEventListener("click", startSolving);
pauseButton.addEventListener("click", pausePlayback);
stepButton.addEventListener("click", stepOnce);
resetButton.addEventListener("click", resetPlayback);
shuffleStartButton.addEventListener("click", shuffleStartBoard);
resetGoalButton.addEventListener("click", () => {
  clearSolution();
  state.goal = [...DEFAULT_GOAL];
  state.selectedBoard = "goal";
  state.selectedIndex = state.goal.indexOf(0);
  setStatus("Goal reset to the standard 1-8 layout.");
  render();
});

render();
