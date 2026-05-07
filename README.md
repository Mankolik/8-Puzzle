# 8-Puzzle Solver

A small browser app for configuring and solving an 8-puzzle. The current version uses numbered squares `0` through `8`, where `0` represents the empty tile. It is structured so the numbered positions can later be replaced with image slices for a custom goal picture.

## Features

- Editable start board: copy the tile order from the puzzle on your screen.
- Editable goal board: define the target arrangement that the solver should reach.
- Number palette that swaps duplicate numbers automatically, keeping each board valid.
- A* search with Manhattan distance for shortest-path solving.
- Playback that advances one move every 0.7 seconds.
- Pause, single-step, reset, shuffle, and goal-reset controls.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static web server:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.
