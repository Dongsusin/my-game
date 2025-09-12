import React, { useState, useEffect } from "react";
import { games } from "./components/games";
import GameCard from "./components/GameCard";
import "./styles.css";

const App: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 키보드 방향키로 이동
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev + 1) % games.length);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev - 1 + games.length) % games.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 리스트를 움직이도록 offset 계산
  const cardWidth = 160; // 카드 폭 + gap(140px + padding/여백 대략)
  const offset =
    -(selectedIndex * cardWidth) + window.innerWidth / 2 - cardWidth / 2;

  return (
    <div
      className="app"
      style={{ backgroundImage: `url(${games[selectedIndex].image})` }}
    >
      {/* 선택창 (고정) */}
      <div className="selector" />

      {/* 움직이는 게임 리스트 */}
      <div
        className="game-list"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {games.map((game, index) => (
          <div key={game.id} onClick={() => setSelectedIndex(index)}>
            <GameCard game={game} selected={index === selectedIndex} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
