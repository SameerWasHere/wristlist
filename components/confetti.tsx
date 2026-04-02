"use client";

import { useEffect, useState } from "react";

interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

const COLORS = ["#8a7a5a", "#6b5b3a", "#f5f0e3", "#d4cfc5", "#b8a88a", "#1a1814"];
const PIECE_COUNT = 60;
const DURATION = 4500;

export function Confetti({ show, onComplete }: ConfettiProps) {
  const [visible, setVisible] = useState(false);
  const [pieces, setPieces] = useState<
    { id: number; left: number; color: string; delay: number; size: number; rotation: number; drift: number }[]
  >([]);

  useEffect(() => {
    if (show) {
      const generated = Array.from({ length: PIECE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 1.5,
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 80,
      }));
      setPieces(generated);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, DURATION);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {pieces.map((p) => (
          <div
            key={p.id}
            className="absolute confetti-piece"
            style={{
              left: `${p.left}%`,
              top: "-20px",
              width: `${p.size}px`,
              height: `${p.size * 1.4}px`,
              backgroundColor: p.color,
              borderRadius: p.size > 8 ? "1px" : "50%",
              transform: `rotate(${p.rotation}deg)`,
              animationDelay: `${p.delay}s`,
              ["--drift" as string]: `${p.drift}px`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes confettiFall {
          0% {
            opacity: 1;
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) translateX(var(--drift)) rotate(720deg);
          }
        }
        .confetti-piece {
          animation: confettiFall 3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
