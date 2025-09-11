import React, { useState, useEffect, useRef } from "react";
import { games } from "./components/games"; // 경로 확인
import GameCard from "./components/GameCard";
import "./styles.css";

const App: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

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

  // 선택된 게임을 화면 가운데로 스크롤
  useEffect(() => {
    if (listRef.current) {
      const selectedCard = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedCard) {
        const scrollLeft =
          selectedCard.offsetLeft -
          listRef.current.clientWidth / 2 +
          selectedCard.clientWidth / 2;
        listRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // 게임 배열 반복 → 무한 느낌
  const extendedGames = [...games, ...games, ...games];

  return (
    <div
      className="app"
      style={{ backgroundImage: `url(${games[selectedIndex].image})` }}
    >
      <div className="game-list" ref={listRef}>
        {extendedGames.map((game, index) => {
          const realIndex = index % games.length;
          return (
            <div
              key={`${game.id}-${index}`}
              onClick={() => setSelectedIndex(realIndex)}
            >
              <GameCard game={game} selected={realIndex === selectedIndex} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
