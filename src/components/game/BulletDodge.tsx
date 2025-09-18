import React, { useEffect, useRef, useState } from "react";

interface Bullet {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

const BulletDodge: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [player, setPlayer] = useState({ x: 300, y: 300, size: 12 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [running, setRunning] = useState(true);
  const [time, setTime] = useState(0);
  const keys = useRef<{ [key: string]: boolean }>({});

  // 최신 상태 ref
  const playerRef = useRef(player);
  const bulletsRef = useRef(bullets);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);
  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);

  // 난이도 조절
  const getBulletSpeed = () => 2 + time * 0.01;
  const getSpawnInterval = () => Math.max(300, 1000 - time * 20);

  // 키 입력 관리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;

      // 게임오버 상태에서 Enter → 재시작
      if (!running && e.key === "Enter") {
        restartGame();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [running]);

  // 플레이어 이동
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayer((prev) => {
        if (!running) return prev;
        const speed = 5;
        let { x, y } = prev;
        if (keys.current["ArrowUp"]) y -= speed;
        if (keys.current["ArrowDown"]) y += speed;
        if (keys.current["ArrowLeft"]) x -= speed;
        if (keys.current["ArrowRight"]) x += speed;

        const canvas = canvasRef.current;
        if (canvas) {
          x = Math.max(prev.size, Math.min(canvas.width - prev.size, x));
          y = Math.max(prev.size, Math.min(canvas.height - prev.size, y));
        }
        return { ...prev, x, y };
      });
    }, 16);
    return () => clearInterval(interval);
  }, [running]);

  // 총알 생성
  useEffect(() => {
    if (!running) return;

    const spawn = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const size = canvas.width;
      const side = Math.floor(Math.random() * 4);
      let x = 0,
        y = 0;

      if (side === 0) {
        x = Math.random() * size;
        y = 0;
      } else if (side === 1) {
        x = Math.random() * size;
        y = size;
      } else if (side === 2) {
        x = 0;
        y = Math.random() * size;
      } else {
        x = size;
        y = Math.random() * size;
      }

      const dirX = playerRef.current.x - x;
      const dirY = playerRef.current.y - y;
      const length = Math.hypot(dirX, dirY);
      const dx = dirX / length;
      const dy = dirY / length;

      setBullets((prev) => [...prev, { x, y, dx, dy }]);

      setTimeout(spawn, getSpawnInterval());
    };

    const id = setTimeout(spawn, getSpawnInterval());
    return () => clearTimeout(id);
  }, [running, time]);

  // 게임 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      if (!running) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 플레이어
      const p = playerRef.current;
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      const speed = getBulletSpeed();

      // 총알 업데이트
      setBullets((prev) =>
        prev
          .map((b) => ({
            ...b,
            x: b.x + b.dx * speed,
            y: b.y + b.dy * speed,
          }))
          .filter((b) => {
            const dist = Math.hypot(b.x - p.x, b.y - p.y);
            if (dist < p.size + 10) {
              setRunning(false);
              return false;
            }
            return true;
          })
      );

      // 총알 그리기
      ctx.fillStyle = "black";
      bulletsRef.current.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(loop);
    };

    loop();
  }, [running, time]);

  // 생존 시간
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);

  // 게임 재시작
  const restartGame = () => {
    setPlayer({ x: 300, y: 300, size: 12 });
    setBullets([]);
    setTime(0);
    setRunning(true);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // 화면 전체 높이
        background: "#f0f0f0",
      }}
    >
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          style={{ border: "2px solid black", background: "white" }}
        />

        {/* 오버레이 */}
        {!running && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
              게임 오버!
            </h1>
            <p style={{ fontSize: "24px" }}>Enter 키를 눌러 재시작하세요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulletDodge;
