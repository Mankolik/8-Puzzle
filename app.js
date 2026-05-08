const STEP_DELAY_MS = 1000;
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
const paletteElement = document.querySelector("#numberPalette");
const statusText = document.querySelector("#statusText");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const stepButton = document.querySelector("#stepButton");
const resetButton = document.querySelector("#resetButton");
const shuffleStartButton = document.querySelector("#shuffleStart");

const state = {
  start: [...DEFAULT_START],
  selectedIndex: 0,
  draggedIndex: null,
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

function render() {
  renderBoard(startBoardElement, state.start);
  renderPalette();
  const hasSolution = state.solution.length > 0;
  pauseButton.disabled = !isPlaying();
  stepButton.disabled = isPlaying();
  resetButton.disabled = !hasSolution && boardToKey(state.start) === boardToKey(DEFAULT_START);
}

function renderBoard(element, board) {
  element.innerHTML = "";
  board.forEach((number, index) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.draggable = !isPlaying();
    tile.dataset.index = index;
    tile.className = [
      "tile",
      number === 0 ? "empty" : "",
      state.selectedIndex === index ? "selected" : "",
      state.draggedIndex === index ? "dragging" : "",
      isPlaying() ? "locked" : "",
    ].filter(Boolean).join(" ");
    decorateTile(tile, number);
    tile.setAttribute("aria-label", `Start position ${index + 1}, fossil tile ${number}`);
    tile.addEventListener("click", () => selectStartTile(index));
    tile.addEventListener("dragstart", (event) => handleDragStart(event, index));
    tile.addEventListener("dragover", allowTileDrop);
    tile.addEventListener("drop", (event) => handleTileDrop(event, index));
    tile.addEventListener("dragend", handleDragEnd);
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
  paletteElement.innerHTML = "";
  for (let number = 0; number <= 8; number += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = ["palette-button", state.start.includes(number) ? "used" : ""].filter(Boolean).join(" ");
    decorateTile(button, number);
    button.setAttribute("aria-label", `Put fossil tile ${number} in selected start square`);
    button.addEventListener("click", () => setSelectedTile(number));
    paletteElement.append(button);
  }
}

function selectStartTile(index) {
  if (isPlaying()) return;
  state.selectedIndex = index;
  render();
}

function setSelectedTile(number) {
  if (isPlaying()) return;
  const existingIndex = state.start.indexOf(number);
  const currentValue = state.start[state.selectedIndex];

  if (existingIndex !== -1 && existingIndex !== state.selectedIndex) {
    state.start[existingIndex] = currentValue;
  }

  state.start[state.selectedIndex] = number;
  clearSolution();
  render();
}

function handleDragStart(event, index) {
  if (isPlaying()) {
    event.preventDefault();
    return;
  }

  state.draggedIndex = index;
  event.currentTarget.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(index));
}

function allowTileDrop(event) {
  if (isPlaying()) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function handleTileDrop(event, dropIndex) {
  event.preventDefault();
  if (isPlaying()) return;

  const dragIndexData = event.dataTransfer.getData("text/plain");
  const dragIndex = Number(dragIndexData);
  const fromIndex = dragIndexData !== "" && Number.isInteger(dragIndex) ? dragIndex : state.draggedIndex;
  swapStartTiles(fromIndex, dropIndex);
}

function handleDragEnd() {
  if (state.draggedIndex === null) return;
  state.draggedIndex = null;
  render();
}

function swapStartTiles(fromIndex, toIndex) {
  if (
    fromIndex === null
    || fromIndex === toIndex
    || fromIndex < 0
    || fromIndex >= state.start.length
    || toIndex < 0
    || toIndex >= state.start.length
  ) {
    state.draggedIndex = null;
    render();
    return;
  }

  [state.start[fromIndex], state.start[toIndex]] = [state.start[toIndex], state.start[fromIndex]];
  state.selectedIndex = toIndex;
  state.draggedIndex = null;
  clearSolution();
  setStatus("Start board updated. Press Start to solve the new configuration.");
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

  if (startError) {
    setStatus(startError, "error");
    render();
    return;
  }

  if (!isSolvable(state.start, DEFAULT_GOAL)) {
    setStatus("This start board cannot reach the standard goal. Swap any two non-zero tiles and try again.", "error");
    render();
    return;
  }

  if (state.solution.length === 0 || state.playbackIndex >= state.solution.length - 1) {
    state.solution = solvePuzzle([...state.start], [...DEFAULT_GOAL]);
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
    setStatus("Solved! The start board now matches the standard goal.", "success");
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
  let shuffled = [...DEFAULT_GOAL];
  for (let i = 0; i < 80; i += 1) {
    const neighbors = getNeighbors(shuffled);
    shuffled = neighbors[Math.floor(Math.random() * neighbors.length)];
  }
  state.start = shuffled;
  state.selectedIndex = state.start.indexOf(0);
  setStatus("Shuffled a solvable start board.");
  render();
}

startButton.addEventListener("click", startSolving);
pauseButton.addEventListener("click", pausePlayback);
stepButton.addEventListener("click", stepOnce);
resetButton.addEventListener("click", resetPlayback);
shuffleStartButton.addEventListener("click", shuffleStartBoard);

render();
