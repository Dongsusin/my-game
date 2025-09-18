import React, { useEffect, useState } from "react";
import "./Sudoku.css";

// -------------------- 스도쿠 유틸 함수 --------------------
const isSafe = (
  board: number[][],
  row: number,
  col: number,
  num: number
): boolean => {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[startRow + r][startCol + c] === num) return false;
    }
  }
  return true;
};

const fillBoard = (board: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
          () => Math.random() - 0.5
        );
        for (const num of numbers) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const makePuzzle = (solution: number[][], clues: number = 40): number[][] => {
  const puzzle = solution.map((row) => [...row]);
  let cellsToRemove = 81 - clues;
  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      cellsToRemove--;
    }
  }
  return puzzle;
};

// -------------------- 컴포넌트 --------------------
const Sudoku: React.FC = () => {
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [userBoard, setUserBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // 퍼즐 생성
  useEffect(() => {
    const emptyBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillBoard(emptyBoard);
    const solved = emptyBoard.map((row) => [...row]);
    const newPuzzle = makePuzzle(solved, 40);
    setSolution(solved);
    setPuzzle(newPuzzle);
    setUserBoard(newPuzzle.map((row) => [...row])); // 사용자 입력 보드
  }, []);

  // 키 입력 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      if (puzzle[row][col] !== 0) return; // 원래 주어진 숫자는 수정 불가

      if (/^[1-9]$/.test(e.key)) {
        const value = parseInt(e.key, 10);
        const newBoard = userBoard.map((row) => [...row]);
        newBoard[row][col] = value;
        setUserBoard(newBoard);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        const newBoard = userBoard.map((row) => [...row]);
        newBoard[row][col] = 0;
        setUserBoard(newBoard);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, puzzle, userBoard]);

  const checkWin = (): boolean => {
    return JSON.stringify(userBoard) === JSON.stringify(solution);
  };

  return (
    <div className="sudoku-wrapper">
      <div className="sudoku-container">
        {userBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {row.map((cell, colIndex) => {
              const isOriginal = puzzle[rowIndex][colIndex] !== 0;
              const isSelected =
                selectedCell?.row === rowIndex &&
                selectedCell?.col === colIndex;
              const isWrong =
                !isOriginal &&
                cell !== 0 &&
                cell !== solution[rowIndex][colIndex];

              return (
                <div
                  key={colIndex}
                  className={`sudoku-cell 
                    ${
                      (Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) %
                        2 ===
                      0
                        ? "block-even"
                        : "block-odd"
                    }
                    ${isOriginal ? "fixed" : "editable"}
                    ${isSelected ? "sudikuselected" : ""}
                    ${isWrong ? "wrong" : ""}`}
                  onClick={() =>
                    setSelectedCell({ row: rowIndex, col: colIndex })
                  }
                >
                  {cell !== 0 ? cell : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="sudoku-buttons">
        {checkWin() ? (
          <p className="win-text">🎉 축하합니다! 퍼즐을 완료했습니다 🎉</p>
        ) : (
          <p>빈 칸을 채워보세요</p>
        )}
      </div>
    </div>
  );
};

export default Sudoku;
