const assert = require("node:assert/strict");
const {
  getNeighbors,
  isSolvable,
  solvePuzzle,
  validateBoard,
} = require("../solver.js");

const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const oneMoveAway = [1, 2, 3, 4, 5, 6, 7, 0, 8];

assert.equal(validateBoard(goal, "Goal"), "");
assert.match(validateBoard([1, 1, 2, 3, 4, 5, 6, 7, 8], "Bad board"), /0 to 8/);
assert.equal(isSolvable(oneMoveAway, goal), true);
assert.equal(isSolvable([1, 2, 3, 4, 5, 6, 8, 7, 0], goal), false);
assert.deepEqual(solvePuzzle(goal, goal), [goal]);
assert.deepEqual(solvePuzzle(oneMoveAway, goal), [oneMoveAway, goal]);
assert.equal(getNeighbors(goal).length, 2);

const harderStart = [1, 2, 3, 5, 0, 6, 4, 7, 8];
const path = solvePuzzle(harderStart, goal);
assert.deepEqual(path[0], harderStart);
assert.deepEqual(path.at(-1), goal);
assert.equal(path.length, 5);

console.log("solver tests passed");
