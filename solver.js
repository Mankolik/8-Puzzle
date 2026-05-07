(function exposeSolver(global) {
  const BOARD_SIZE = 3;

  function boardToKey(board) {
    return board.join("");
  }

  function validateBoard(board, name) {
    const sorted = [...board].sort((a, b) => a - b);
    const expected = Array.from({ length: 9 }, (_, index) => index);
    if (board.length !== 9 || sorted.some((value, index) => value !== expected[index])) {
      return `${name} must contain each number from 0 to 8 exactly once.`;
    }
    return "";
  }

  function inversionCount(sequence) {
    const withoutBlank = sequence.filter((number) => number !== 0);
    let inversions = 0;
    for (let i = 0; i < withoutBlank.length; i += 1) {
      for (let j = i + 1; j < withoutBlank.length; j += 1) {
        if (withoutBlank[i] > withoutBlank[j]) inversions += 1;
      }
    }
    return inversions;
  }

  function isSolvable(start, goal) {
    return inversionCount(start) % 2 === inversionCount(goal) % 2;
  }

  function manhattanDistance(board, goalPositions) {
    return board.reduce((distance, tile, index) => {
      if (tile === 0) return distance;
      const goalIndex = goalPositions.get(tile);
      const currentRow = Math.floor(index / BOARD_SIZE);
      const currentColumn = index % BOARD_SIZE;
      const goalRow = Math.floor(goalIndex / BOARD_SIZE);
      const goalColumn = goalIndex % BOARD_SIZE;
      return distance + Math.abs(currentRow - goalRow) + Math.abs(currentColumn - goalColumn);
    }, 0);
  }

  function getNeighbors(board) {
    const blankIndex = board.indexOf(0);
    const blankRow = Math.floor(blankIndex / BOARD_SIZE);
    const blankColumn = blankIndex % BOARD_SIZE;
    const moves = [
      [blankRow - 1, blankColumn],
      [blankRow + 1, blankColumn],
      [blankRow, blankColumn - 1],
      [blankRow, blankColumn + 1],
    ];

    return moves
      .filter(([row, column]) => row >= 0 && row < BOARD_SIZE && column >= 0 && column < BOARD_SIZE)
      .map(([row, column]) => {
        const swapIndex = row * BOARD_SIZE + column;
        const next = [...board];
        [next[blankIndex], next[swapIndex]] = [next[swapIndex], next[blankIndex]];
        return next;
      });
  }

  function reconstructPath(goalKey, parent) {
    const path = [];
    let key = goalKey;
    while (parent.has(key)) {
      const entry = parent.get(key);
      path.push(entry.board);
      key = entry.previousKey;
    }
    const firstEntry = parent.get(goalKey);
    if (firstEntry) {
      let startBoard = firstEntry.previousBoard;
      while (parent.has(boardToKey(startBoard))) {
        startBoard = parent.get(boardToKey(startBoard)).previousBoard;
      }
      path.push(startBoard);
    }
    return path.reverse();
  }

  function solvePuzzle(start, goal) {
    const startKey = boardToKey(start);
    const goalKey = boardToKey(goal);
    if (startKey === goalKey) return [[...start]];

    const goalPositions = new Map(goal.map((tile, index) => [tile, index]));
    const open = [{ board: start, key: startKey, g: 0, f: manhattanDistance(start, goalPositions) }];
    const parent = new Map();
    const bestCost = new Map([[startKey, 0]]);

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f || a.g - b.g);
      const current = open.shift();

      if (current.key === goalKey) {
        return reconstructPath(current.key, parent);
      }

      for (const neighbor of getNeighbors(current.board)) {
        const key = boardToKey(neighbor);
        const nextCost = current.g + 1;
        if (!bestCost.has(key) || nextCost < bestCost.get(key)) {
          bestCost.set(key, nextCost);
          parent.set(key, { previousKey: current.key, board: neighbor, previousBoard: current.board });
          open.push({
            board: neighbor,
            key,
            g: nextCost,
            f: nextCost + manhattanDistance(neighbor, goalPositions),
          });
        }
      }
    }

    return [];
  }

  global.PuzzleSolver = {
    boardToKey,
    getNeighbors,
    isSolvable,
    solvePuzzle,
    validateBoard,
  };
})(typeof window === "undefined" ? globalThis : window);

if (typeof module !== "undefined") {
  module.exports = globalThis.PuzzleSolver;
}
