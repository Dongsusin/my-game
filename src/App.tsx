import React, { useState, useEffect, useRef } from "react";
import { games } from "./components/games";
import GameCard from "./components/GameCard";
import "./styles.css";

const App: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // 방향키 이동
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

  // 선택된 카드 중앙 정렬
  useEffect(() => {
    const list = listRef.current;
    if (list) {
      const selectedCard = list.children[selectedIndex] as HTMLElement;
      if (selectedCard) {
        selectedCard.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="app-container">
      <div className="game-box">
        {/* 상단 게임 이미지 */}
        <div className="game-preview">
          <img
            src={games[selectedIndex].image}
            alt={games[selectedIndex].title}
          />
        </div>

        {/* 하단 게임 리스트 */}
        <div className="game-list-wrapper" ref={listRef}>
          {games.map((game, index) => (
            <div key={game.id} onClick={() => setSelectedIndex(index)}>
              <GameCard game={game} selected={index === selectedIndex} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
