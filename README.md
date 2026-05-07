# 8-Puzzle Solver

A small browser app for configuring and solving an 8-puzzle. The current version uses numbered squares `0` through `8`, where `0` represents the empty tile, and can automatically use tile images from the `Fossils/` folder when they are present.

## Public page

Use the GitHub Pages version here: <https://mankolik.github.io/8-Puzzle>

## Features

- Editable start board: copy the tile order from the puzzle on your screen.
- Editable goal board: define the target arrangement that the solver should reach.
- Optional image tiles loaded from `Fossils/` for tile numbers `1` through `8`.
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

## Fossils image tiles

To replace the numbered squares with fossil images, add files to `Fossils/` using one of these naming styles for each tile number `1` through `8`:

- `1.png`, `2.png`, ... `8.png`
- `tile-1.png`, `tile-2.png`, ... `tile-8.png`
- `tile1.png`, `tile2.png`, ... `tile8.png`

The app also checks `.jpg`, `.jpeg`, `.webp`, and `.svg` extensions. Tile `0` stays as the empty square.
