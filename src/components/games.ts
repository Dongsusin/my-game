export interface Game {
  id: number;
  title: string;
  image: string;
}

export const games: Game[] = [
  { id: 1, title: "2048", image: "/images/2048.png" },
  { id: 2, title: "테트리스", image: "/images/tetris.png" },
  { id: 3, title: "스도쿠", image: "/images/sudoku.png" },
  { id: 4, title: "총알 피하기", image: "/images/gun.png" },
  { id: 5, title: "팩맨", image: "/images/pacman.png" },
  { id: 6, title: "무한의계단", image: "/images/infinite_stairs.png" },
  { id: 7, title: "얼불춤", image: "/images/icefire.png" },
  { id: 8, title: "핵트리스", image: "/images/hectrix.png" },
  { id: 9, title: "수박게임", image: "/images/watermelon.png" },
];
