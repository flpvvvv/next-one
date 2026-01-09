'use client';

import { forwardRef, useImperativeHandle, useState, useCallback, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Person } from '@/types';

// Vibrant segment colors
const SEGMENT_COLORS = [
  '#FF6B6B', // coral
  '#4ECDC4', // teal
  '#FFE66D', // yellow
  '#FF8ED4', // pink
  '#95E1D3', // mint
  '#F38181', // salmon
  '#AA96DA', // lavender
  '#FCBAD3', // light pink
  '#A8D8EA', // sky blue
  '#FFB347', // orange
  '#87CEEB', // light blue
  '#DDA0DD', // plum
  '#98D8C8', // seafoam
  '#F7DC6F', // gold
  '#BB8FCE', // purple
];

interface WheelProps {
  people: Person[];
  onSpinEnd: (winner: Person) => void;
}

export interface WheelHandle {
  spin: () => void;
  isSpinning: boolean;
}

// Shuffle array randomly (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const Wheel = forwardRef<WheelHandle, WheelProps>(({ people, onSpinEnd }, ref) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [shuffledOrder, setShuffledOrder] = useState<string[]>([]);
  const controls = useAnimation();

  // Initialize shuffled order once when component mounts or people change completely
  useEffect(() => {
    if (shuffledOrder.length === 0 || !people.some(p => shuffledOrder.includes(p.id))) {
      // Initial shuffle - create random order of IDs
      setShuffledOrder(shuffleArray(people.map(p => p.id)));
    }
  }, [people, shuffledOrder]);

  // Get active (not picked) people in shuffled order
  const activePeople = shuffledOrder
    .map(id => people.find(p => p.id === id))
    .filter((p): p is Person => p !== undefined && !p.picked);

  const segmentAngle = activePeople.length > 0 ? 360 / activePeople.length : 360;

  const spin = useCallback(async () => {
    if (isSpinning || activePeople.length === 0) return;

    setIsSpinning(true);

    // Pick a random winner index from active people
    const winnerIndex = Math.floor(Math.random() * activePeople.length);
    const winner = activePeople[winnerIndex];

    // Calculate where the wheel needs to stop
    // The pointer is at the top (12 o'clock = -90 degrees in SVG coordinates)
    // Segments are drawn starting from the top (-90 degrees)
    // Segment N's center in local wheel coords = N * segmentAngle + segmentAngle/2 - 90
    //
    // When wheel rotates by R degrees, segment appears at: localAngle + R
    // For segment to be at top (-90 or 270), we need:
    //   localAngle + R = 270 (mod 360)
    //   R = 270 - localAngle
    //   R = 270 - (N * segmentAngle + segmentAngle/2 - 90)
    //   R = 360 - (N + 0.5) * segmentAngle

    const targetRotation = 360 - (winnerIndex + 0.5) * segmentAngle;

    // Add multiple full rotations for excitement (5-8 full spins)
    const fullRotations = 5 + Math.floor(Math.random() * 4);

    // Small random offset within the segment for variety (stays within segment bounds)
    const offsetWithinSegment = (Math.random() - 0.5) * (segmentAngle * 0.5);

    // Normalize current rotation and calculate total
    const currentNormalized = ((rotation % 360) + 360) % 360;
    const targetNormalized = ((targetRotation + offsetWithinSegment) % 360 + 360) % 360;

    // Calculate how much more we need to rotate to reach target
    let additionalRotation = targetNormalized - currentNormalized;
    if (additionalRotation < 0) additionalRotation += 360;

    const totalRotation = rotation + (fullRotations * 360) + additionalRotation;

    // Animate the spin
    await controls.start({
      rotate: totalRotation,
      transition: {
        duration: 4 + Math.random() * 2, // 4-6 seconds
        ease: [0.15, 0.85, 0.25, 1], // Custom easing: fast start, very dramatic slowdown
      },
    });

    setRotation(totalRotation);
    setIsSpinning(false);
    onSpinEnd(winner);
  }, [isSpinning, activePeople, rotation, segmentAngle, controls, onSpinEnd]);

  useImperativeHandle(ref, () => ({
    spin,
    isSpinning,
  }));

  // Generate SVG path for a segment
  const createSegmentPath = (index: number, total: number, radius: number) => {
    const angle = 360 / total;
    const startAngle = index * angle - 90; // Start from top
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Calculate text position - radial orientation (pointing outward from center)
  const getTextPosition = (index: number, total: number, radius: number) => {
    const angle = 360 / total;
    const midAngle = index * angle + angle / 2 - 90; // -90 to start from top
    const textRadius = radius * 0.6;
    const rad = (midAngle * Math.PI) / 180;
    const x = radius + textRadius * Math.cos(rad);
    const y = radius + textRadius * Math.sin(rad);
    // Rotate text to be radial (pointing outward), adjust for readability
    let textRotation = midAngle;
    // Flip text on the left side so it's always readable
    if (midAngle > 90 || midAngle < -90) {
      textRotation += 180;
    }
    return { x, y, rotation: textRotation };
  };

  const wheelSize = 420;
  const radius = wheelSize / 2;

  // Show message if no active people
  if (activePeople.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-white/10 rounded-full"
        style={{ width: wheelSize, height: wheelSize }}
      >
        <p className="text-white/60 text-xl">All names picked!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Pointer (fixed at top) */}
      <div className="absolute left-1/2 -top-2 -translate-x-1/2 z-20">
        <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px]
                        border-l-transparent border-r-transparent border-t-yellow-400
                        drop-shadow-lg"
             style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}
        />
      </div>

      {/* Wheel container with glow */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9b59b6, #ff6b6b)',
            filter: 'blur(20px)',
            opacity: 0.4,
            transform: 'scale(1.08)',
          }}
        />

        {/* Main wheel */}
        <motion.div
          animate={controls}
          initial={{ rotate: rotation }}
          className="relative"
          style={{ width: wheelSize, height: wheelSize }}
        >
          <svg
            width={wheelSize}
            height={wheelSize}
            viewBox={`0 0 ${wheelSize} ${wheelSize}`}
            className="drop-shadow-2xl"
          >
            {/* Segments - only active (not picked) people */}
            {activePeople.map((person, index) => {
              // Use original index for consistent colors
              const originalIndex = people.findIndex(p => p.id === person.id);
              const color = SEGMENT_COLORS[originalIndex % SEGMENT_COLORS.length];
              const textPos = getTextPosition(index, activePeople.length, radius);

              // Truncate long names
              const displayName = person.name.length > 14
                ? person.name.substring(0, 13) + '…'
                : person.name;

              return (
                <g key={person.id}>
                  {/* Segment */}
                  <path
                    d={createSegmentPath(index, activePeople.length, radius)}
                    fill={color}
                    stroke="#fff"
                    strokeWidth="3"
                  />
                  {/* Text - radial orientation */}
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    fill="#000"
                    fontSize={activePeople.length > 10 ? '12' : activePeople.length > 6 ? '14' : '16'}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                    className="pointer-events-none select-none"
                    style={{
                      textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                    }}
                  >
                    {displayName}
                  </text>
                </g>
              );
            })}

            {/* Center hub */}
            <circle
              cx={radius}
              cy={radius}
              r={radius * 0.12}
              fill="url(#hubGradient)"
              stroke="#fff"
              strokeWidth="4"
            />
            <circle
              cx={radius}
              cy={radius}
              r={radius * 0.06}
              fill="#222"
            />

            {/* Gradient definitions */}
            <defs>
              <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#888" />
                <stop offset="100%" stopColor="#333" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Decorative lights around the wheel */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 - 90) * (Math.PI / 180);
            const x = radius + (radius + 18) * Math.cos(angle);
            const y = radius + (radius + 18) * Math.sin(angle);
            return (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: x - 6,
                  top: y - 6,
                  backgroundColor: i % 2 === 0 ? '#ffd700' : '#ff6b6b',
                  boxShadow: `0 0 8px ${i % 2 === 0 ? '#ffd700' : '#ff6b6b'}`,
                }}
                animate={{
                  opacity: isSpinning ? [0.5, 1, 0.5] : 0.7,
                  scale: isSpinning ? [1, 1.3, 1] : 1,
                }}
                transition={{
                  duration: 0.2,
                  repeat: isSpinning ? Infinity : 0,
                  delay: i * 0.03,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

Wheel.displayName = 'Wheel';

export default Wheel;
