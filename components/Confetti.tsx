'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  drift: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  width: number;
  height: number;
  borderRadius: string;
}

const COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#ff6b9d', '#c44dff', '#00d4ff', '#ff9f43',
];

interface ConfettiProps {
  active: boolean;
  seed?: number;
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Confetti({ active, seed = 1 }: ConfettiProps) {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    if (!active) return [];

    const rand = mulberry32(seed || 1);

    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 44; i++) {
      const width = 6 + Math.floor(rand() * 10);
      const height = 6 + Math.floor(rand() * 14);
      const isRound = rand() > 0.65;

      newPieces.push({
        id: i,
        x: rand() * 100,
        drift: (rand() - 0.5) * 18,
        color: COLORS[Math.floor(rand() * COLORS.length)],
        delay: rand() * 0.5,
        duration: 2.2 + rand() * 1.8,
        rotation: rand() * 360,
        width,
        height,
        borderRadius: isRound ? '999px' : `${Math.floor(rand() * 4)}px`,
      });
    }

    return newPieces;
  }, [active, seed]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.x}vw`,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: '100vh',
            x: [`${piece.x}vw`, `${piece.x + piece.drift}vw`],
            rotate: piece.rotation + 900,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
            borderRadius: piece.borderRadius,
            boxShadow: `0 0 10px ${piece.color}55`,
          }}
        />
      ))}
    </div>
  );
}
