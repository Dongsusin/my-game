import React, { useEffect, useState } from "react";
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
  const newGrid = grid.map((r) => [...r]);
  const empties: { row: number; col: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid[r][c] === 0) empties.push({ row: r, col: c });
    }
  }
  if (empties.length === 0) return newGrid;
  const chosen = empties[Math.floor(Math.random() * empties.length)];
  newGrid[chosen.row][chosen.col] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

const transpose = (g: Grid): Grid =>
  g[0].map((_, colIndex) => g.map((row) => row[colIndex]));

const arraysEqual = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

const slideRowLeft = (row: number[]) => {
  const arr = row.filter((v) => v !== 0);
  const res: number[] = [];
  let points = 0;
  for (let i = 0; i < arr.length; i++) {
    if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
      const newVal = arr[i] * 2;
      res.push(newVal);
      points += newVal;
      i++;
    } else {
      res.push(arr[i]);
    }
  }
  while (res.length < GRID_SIZE) res.push(0);
  return { newRow: res, points };
};

const moveLeft = (g: Grid) => {
  let moved = false;
  let totalPoints = 0;
  const newGrid = g.map((row) => {
    const { newRow, points } = slideRowLeft(row);
    if (!arraysEqual(newRow, row)) moved = true;
    totalPoints += points;
    return newRow;
  });
  return { newGrid, moved, totalPoints };
};

const moveRight = (g: Grid) => {
  let moved = false;
  let totalPoints = 0;
  const newGrid = g.map((row) => {
    const reversed = [...row].reverse();
    const { newRow, points } = slideRowLeft(reversed);
    const finalRow = [...newRow].reverse();
    if (!arraysEqual(finalRow, row)) moved = true;
    totalPoints += points;
    return finalRow;
  });
  return { newGrid, moved, totalPoints };
};

const moveUp = (g: Grid) => {
  const t = transpose(g);
  const { newGrid: movedT, moved, totalPoints } = moveLeft(t);
  const final = transpose(movedT);
  return { newGrid: final, moved, totalPoints };
};

const moveDown = (g: Grid) => {
  const t = transpose(g);
  const { newGrid: movedT, moved, totalPoints } = moveRight(t);
  const final = transpose(movedT);
  return { newGrid: final, moved, totalPoints };
};

// 게임 종료 판정
const isGameOver = (g: Grid) => {
  // 빈칸 있으면 아직 진행 가능
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (g[r][c] === 0) return false;
    }
  }
  // 인접한 같은 값이 있으면 아직 진행 가능
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (
        (r + 1 < GRID_SIZE && g[r][c] === g[r + 1][c]) ||
        (c + 1 < GRID_SIZE && g[r][c] === g[r][c + 1])
      ) {
        return false;
      }
    }
  }
  return true;
};

const Game2048: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(() =>
    addRandomTile(addRandomTile(getEmptyGrid()))
  );
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() =>
    parseInt(localStorage.getItem("bestScore") || "0", 10)
  );
  const [gameOver, setGameOver] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return; // 게임 종료 시 입력 무시

      let result: {
        newGrid: Grid;
        moved: boolean;
        totalPoints: number;
      } | null = null;

      if (e.key === "ArrowLeft") {
        result = moveLeft(grid);
      } else if (e.key === "ArrowRight") {
        result = moveRight(grid);
      } else if (e.key === "ArrowUp") {
        result = moveUp(grid);
      } else if (e.key === "ArrowDown") {
        result = moveDown(grid);
      } else {
        return;
      }

      if (!result || !result.moved) return;

      const afterAdd = addRandomTile(result.newGrid);
      setGrid(afterAdd);

      const newScore = score + result.totalPoints;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem("bestScore", String(newScore));
      }

      if (isGameOver(afterAdd)) {
        setGameOver(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [grid, score, bestScore, gameOver]);

  const restartGame = () => {
    setGrid(addRandomTile(addRandomTile(getEmptyGrid())));
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="game2048">
      <h2>2048</h2>

      {/* 점수 / 최고점수 */}
      <div className="score-board">
        <div className="score-box">
          <p>Score</p>
          <span>{score}</span>
        </div>
        <div className="score-box">
          <p>Best</p>
          <span>{bestScore}</span>
        </div>
      </div>

      {/* 게임판 */}
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

      {/* 게임 종료 UI */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-box">
            <h1>Game Over</h1>
            <div className="buttons">
              <button onClick={() => setGameOver(false)}>게임 종료</button>
              <button onClick={restartGame}>다시 하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game2048;
