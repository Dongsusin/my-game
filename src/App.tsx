import React, { useState, useEffect } from "react";
import { games } from "./components/games";
import GameCard from "./components/GameCard";
import "./assets/styles.css";

const App: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 키보드 방향키 이벤트 등록
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

  return (
    <div
      className="app"
      style={{ backgroundImage: `url(${games[selectedIndex].image})` }}
    >
      <div className="game-list">
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
