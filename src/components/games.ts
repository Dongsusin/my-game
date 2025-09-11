export interface Game {
  id: number;
  title: string;
  image: string;
}

export const games: Game[] = [
  { id: 1, title: "2048", image: "/images/2048.png" },
  { id: 2, title: "테트리스", image: "/images/tetris.png" },
  { id: 3, title: "스와이프 벽돌깨기", image: "/images/brick.png" },
];
