import React from "react";
import type { Game } from "./games";

interface Props {
  game: Game;
  selected: boolean;
}

const GameCard: React.FC<Props> = ({ game, selected }) => {
  return (
    <div className={`game-card ${selected ? "selected" : ""}`}>
      <img src={game.image} alt={game.title} />
      <p>{game.title}</p>
    </div>
  );
};

export default GameCard;
