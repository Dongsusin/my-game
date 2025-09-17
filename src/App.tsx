// File: src/App.tsx
import React, { useState, useEffect, useRef } from "react";
import { games } from "./components/games";
import GameCard from "./components/GameCard";
import Game2048 from "./components/game/2048";
import Tetris from "./components/game/Tetris";
import "./styles.css";

const App: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLaunchScreen, setShowLaunchScreen] = useState(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 방향키 이동 및 Enter 실행
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 게임 실행 중이거나 실행창이 켜져있으면 선택리스트 조작 금지
      if (currentGame || showLaunchScreen) {
        if (e.key === "Enter" && currentGame) {
          // 게임 실행 중에 Enter → 게임 종료
          setCurrentGame(null);
        } else if (e.key === "Enter" && showLaunchScreen && !currentGame) {
          // 실행창에서 Enter → 게임 시작
          const selectedGame = games[selectedIndex].title;
          if (selectedGame === "2048") {
            setCurrentGame("2048");
          } else if (selectedGame === "테트리스") {
            setCurrentGame("Tetris");
          }
          setShowLaunchScreen(false);
        }
        return; // 방향키는 무시
      }

      // 선택 리스트 이동 (게임/실행창이 아닐 때만)
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev + 1) % games.length);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev - 1 + games.length) % games.length);
      } else if (e.key === "Enter") {
        // 실행창 열기
        setShowLaunchScreen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLaunchScreen, currentGame, selectedIndex]);

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
      {/* 게임 실행 중이면 게임만 표시 */}
      {currentGame ? (
        <div className="game-container">
          {/* 종료 버튼 */}
          <button className="exit-button" onClick={() => setCurrentGame(null)}>
            게임 종료 ✖
          </button>

          {currentGame === "2048" && <Game2048 />}
          {currentGame === "Tetris" && <Tetris />}
        </div>
      ) : (
        <>
          <div className="game-box">
            {/* 상단 게임 이미지 */}
            <div className="game-preview">
              <img
                src={games[selectedIndex].image}
                alt={games[selectedIndex].title}
              />
            </div>

            {/* 깜빡이는 안내문구 */}
            <div className="enter-hint blink">Enter 키로 게임을 실행하세요</div>

            {/* 하단 게임 리스트 */}
            <div className="game-list-wrapper" ref={listRef}>
              {games.map((game, index) => (
                <div key={game.id} onClick={() => setSelectedIndex(index)}>
                  <GameCard game={game} selected={index === selectedIndex} />
                </div>
              ))}
            </div>
          </div>

          {/* 실행창 */}
          {showLaunchScreen && (
            <div className="launch-screen">
              <div className="launch-content">
                <h1>{games[selectedIndex].title}</h1>
                <p className="blink"> Enter 키를 눌러 시작하세요</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
