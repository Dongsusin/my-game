// File: src/components/game/Tetris.tsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./Tetris.module.css";

type Cell = number; // 0 empty, >0 color id

const COLS = 10;
const ROWS = 10;
const START_SPEED = 500;

const SHAPES: { [key: string]: number[][][] } = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
  ],
  J: [
    [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0],
    ],
    [
      [0, 2, 2],
      [0, 2, 0],
      [0, 2, 0],
    ],
    [
      [0, 0, 0],
      [2, 2, 2],
      [0, 0, 2],
    ],
    [
      [0, 2, 0],
      [0, 2, 0],
      [2, 2, 0],
    ],
  ],
  L: [
    [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ],
    [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ],
    [
      [0, 0, 0],
      [3, 3, 3],
      [3, 0, 0],
    ],
    [
      [3, 3, 0],
      [0, 3, 0],
      [0, 3, 0],
    ],
  ],
  O: [
    [
      [4, 4],
      [4, 4],
    ],
  ],
  S: [
    [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ],
    [
      [0, 5, 0],
      [0, 5, 5],
      [0, 0, 5],
    ],
  ],
  T: [
    [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0],
    ],
    [
      [0, 6, 0],
      [0, 6, 6],
      [0, 6, 0],
    ],
    [
      [0, 0, 0],
      [6, 6, 6],
      [0, 6, 0],
    ],
    [
      [0, 6, 0],
      [6, 6, 0],
      [0, 6, 0],
    ],
  ],
  Z: [
    [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ],
    [
      [0, 0, 7],
      [0, 7, 7],
      [0, 7, 0],
    ],
  ],
};

const SHAPE_KEYS = Object.keys(SHAPES);

function makeEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  const rotations = SHAPES[key];
  const rotationIndex = 0;
  const matrix = rotations[rotationIndex];
  return {
    key,
    rotations,
    rotationIndex,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: -matrix.length + 1,
    id: Object.values(SHAPES).indexOf(rotations) + 1 || 1,
  };
}

function rotateMatrix(piece: any, dir = 1) {
  const len = piece.rotations.length;
  const next = (piece.rotationIndex + dir + len) % len;
  return { ...piece, rotationIndex: next, matrix: piece.rotations[next] };
}

function collide(board: number[][], piece: any, offsetX = 0, offsetY = 0) {
  const { matrix, x, y } = piece;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const newX = x + c + offsetX;
        const newY = y + r + offsetY;
        if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
        if (newY >= 0 && board[newY][newX]) return true;
      }
    }
  }
  return false;
}

function merge(board: number[][], piece: any) {
  const newBoard = board.map((row) => row.slice());
  const { matrix, x, y } = piece;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const newY = y + r;
        const newX = x + c;
        if (newY >= 0) newBoard[newY][newX] = matrix[r][c];
      }
    }
  }
  return newBoard;
}

function clearLines(board: number[][]) {
  let lines = 0;
  const newBoard: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every((cell) => cell !== 0)) {
      lines++;
    } else {
      newBoard.push(board[r]);
    }
  }
  while (newBoard.length < ROWS) newBoard.unshift(Array(COLS).fill(0));
  return { board: newBoard, lines };
}

export default function Tetris() {
  const [board, setBoard] = useState<number[][]>(() => makeEmptyBoard());
  const [piece, setPiece] = useState<any>(() => randomPiece());
  const [nextPiece, setNextPiece] = useState<any>(() => randomPiece());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const dropRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (e.key === "p") {
        setIsPaused((v) => !v);
        return;
      }
      if (isPaused) return;

      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowDown") softDrop();
      if (e.key === " ") hardDrop();
      if (e.key === "ArrowUp") rotate(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [piece, board, isPaused, isGameOver]);

  useEffect(() => {
    if (isPaused || isGameOver) return;
    const speed = Math.max(100, START_SPEED - (level - 1) * 50);
    dropRef.current = window.setInterval(() => {
      drop();
    }, speed);
    return () => {
      if (dropRef.current) window.clearInterval(dropRef.current);
    };
  }, [board, piece, isPaused, isGameOver, level]);

  function move(dir: number) {
    if (!piece) return;
    const moved = { ...piece, x: piece.x + dir };
    if (!collide(board, moved)) setPiece(moved);
  }

  function rotate(dir = 1) {
    if (!piece) return;
    const rotated = rotateMatrix(piece, dir);
    const kicks = [0, -1, 1, -2, 2];
    for (let k of kicks) {
      const test = { ...rotated, x: rotated.x + k };
      if (!collide(board, test)) {
        setPiece(test);
        return;
      }
    }
  }

  function softDrop() {
    if (!piece) return;
    const moved = { ...piece, y: piece.y + 1 };
    if (!collide(board, moved)) {
      setPiece(moved);
    } else {
      lockPiece();
    }
  }

  function hardDrop() {
    if (!piece) return;
    let dropped = { ...piece };
    while (!collide(board, { ...dropped, y: dropped.y + 1 })) {
      dropped.y++;
    }
    setPiece(dropped);
    lockPiece(dropped);
  }

  function drop() {
    if (!piece) return;
    const moved = { ...piece, y: piece.y + 1 };
    if (!collide(board, moved)) {
      setPiece(moved);
    } else {
      lockPiece();
    }
  }

  function lockPiece(p = piece) {
    if (!p) return;
    const newBoard = merge(board, p);
    const { board: clearedBoard, lines } = clearLines(newBoard);
    if (lines > 0) {
      const points = [0, 40, 100, 300, 1200];
      setScore((s) => s + points[lines] * level);
      setLinesCleared((l) => l + lines);
      setLevel((lv) => Math.floor((linesCleared + lines) / 10) + 1);
    }
    setBoard(clearedBoard);

    const np = nextPiece;
    setPiece({
      ...np,
      x: Math.floor((COLS - np.matrix[0].length) / 2),
      y: -np.matrix.length + 1,
    });
    setNextPiece(randomPiece());

    if (
      collide(clearedBoard, {
        ...np,
        x: Math.floor((COLS - np.matrix[0].length) / 2),
        y: -np.matrix.length + 1,
      })
    ) {
      setIsGameOver(true);
      if (dropRef.current) window.clearInterval(dropRef.current);
    }
  }

  function restart() {
    setBoard(makeEmptyBoard());
    setPiece(randomPiece());
    setNextPiece(randomPiece());
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setIsPaused(false);
    setIsGameOver(false);
  }

  const displayBoard = merge(board, piece);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2>테트리스</h2>
        <div className={styles.controlsSmall}>
          이동: ← → ↓ 회전:↑ 하강:space 일시정지:p
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.board}>
          {displayBoard.map((row, rIdx) => (
            <div key={rIdx} className={styles.row}>
              {row.map((cell, cIdx) => (
                <div
                  key={cIdx}
                  className={`${styles.cell} ${cell ? styles[`c${cell}`] : ""}`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className={styles.side}>
          <div className={styles.info}>
            <div>점수</div>
            <div className={styles.big}>{score}</div>
          </div>
          <div className={styles.info}>
            <div>레벨</div>
            <div className={styles.big}>{level}</div>
          </div>
          <div className={styles.info}>
            <div>라인</div>
            <div className={styles.big}>{linesCleared}</div>
          </div>

          <div className={styles.nextTitle}>Next</div>
          <div className={styles.nextBox}>
            {nextPiece.matrix.map((row: number[], r: number) => (
              <div key={r} className={styles.nextRow}>
                {row.map((cell, c) => (
                  <div
                    key={c}
                    className={`${styles.nextCell} ${
                      cell ? styles[`c${cell}`] : ""
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className={styles.buttons}>
            <button onClick={restart} className={styles.btn}>
              Restart
            </button>
            <button
              onClick={() => setIsPaused((p) => !p)}
              className={styles.btn}
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
          </div>

          {isGameOver && <div className={styles.gameOver}>GAME OVER</div>}
        </div>
      </div>
    </div>
  );
}
