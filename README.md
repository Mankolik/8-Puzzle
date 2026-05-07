# 8-Puzzle Solver

A small browser app for configuring and solving an 8-puzzle with fossil photo tiles from `Fossils/Fossil0.jpeg` through `Fossils/Fossil8.jpeg`. Faint number overlays identify tiles `0` through `8`, where `0` represents the empty tile.

## Features

- Editable start board: copy the fossil tile order from the puzzle on your screen.
- Drag-and-drop tile swapping on the start board for quicker setup.
- Fixed standard goal arrangement: tiles `1` through `8`, followed by blank tile `0`.
- Fossil tile palette that swaps duplicate tiles automatically, keeping the start board valid.
- A* search with Manhattan distance for shortest-path solving.
- Playback that advances one move every 0.7 seconds.
- Pause, single-step, reset, and shuffle controls.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static web server:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.
