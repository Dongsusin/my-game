import React, { useState, useEffect } from "react";
import "./2048.css";

type Grid = number[][];

const GRID_SIZE = 4;

const getEmptyGrid = (): Grid =>
  Array(GRID_SIZE)
    .fill(0)
    .map(() => Array(GRID_SIZE).fill(0));

const getRandomPosition = () => ({
  row: Math.floor(Math.random() * GRID_SIZE),
  col: Math.floor(Math.random() * GRID_SIZE),
});

const addRandomTile = (grid: Grid): Grid => {
  const newGrid = grid.map((row) => [...row]);
  let added = false;
  while (!added) {
    const { row, col } = getRandomPosition();
    if (newGrid[row][col] === 0) {
      newGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
      added = true;
    }
  }
  return newGrid;
};

const Game2048: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(() =>
    addRandomTile(addRandomTile(getEmptyGrid()))
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    let newGrid = grid.map((row) => [...row]);

    const slide = (row: number[]): number[] => {
      let arr = row.filter((val) => val !== 0);
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
          arr[i] *= 2;
          arr[i + 1] = 0;
        }
      }
      arr = arr.filter((val) => val !== 0);
      while (arr.length < GRID_SIZE) arr.push(0);
      return arr;
    };

    if (e.key === "ArrowLeft") {
      newGrid = newGrid.map((row) => slide(row));
    } else if (e.key === "ArrowRight") {
      newGrid = newGrid.map((row) => slide(row.reverse()).reverse());
    } else if (e.key === "ArrowUp") {
      newGrid = newGrid[0]
        .map((_, col) => slide(newGrid.map((row) => row[col])))
        .map((_, col, arr) => arr.map((row) => row[col]));
    } else if (e.key === "ArrowDown") {
      newGrid = newGrid[0]
        .map((_, col) =>
          slide(newGrid.map((row) => row[col]).reverse()).reverse()
        )
        .map((_, col, arr) => arr.map((row) => row[col]));
    } else {
      return;
    }

    setGrid(addRandomTile(newGrid));
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="game2048">
      <h2>2048</h2>
      <div className="grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell cell-${cell}`}
            >
              {cell !== 0 ? cell : ""}
            </div>
          ))
        )}
      </div>
      <p className="blink">←↑↓→ 키로 움직이세요</p>
      <p className="blink">Enter 키를 누르면 게임 종료</p>
    </div>
  );
};

export default Game2048;
