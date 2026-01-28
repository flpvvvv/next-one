'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Person } from '@/types';
import NameInput from '@/components/NameInput';
import NameList from '@/components/NameList';
import GameArena from '@/components/GameArena';
import { primeSound } from '@/lib/sound';

type AppPhase = 'input' | 'list' | 'game';

// Shuffle array randomly (Fisher-Yates). Called only from user events.
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>('input');
  const [people, setPeople] = useState<Person[]>([]);
  const [shuffledOrder, setShuffledOrder] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('next-one:soundEnabled') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('next-one:soundEnabled', soundEnabled ? '1' : '0');
    } catch {
      // Ignore: localStorage may be unavailable
    }
  }, [soundEnabled]);

  const handleNamesSubmit = (parsedPeople: Person[]) => {
    setPeople(parsedPeople);
    setPhase('list');
  };

  const handleUpdatePeople = (updatedPeople: Person[]) => {
    setPeople(updatedPeople);
  };

  const handleStartGame = () => {
    const shuffledPeople = shuffleArray(people);
    setPeople(shuffledPeople);
    setShuffledOrder(shuffledPeople.map(p => p.id));
    setPhase('game');
  };

  const handleBackToInput = () => {
    setPhase('input');
  };

  const handleNewGame = () => {
    setPeople([]);
    setShuffledOrder([]);
    setPhase('input');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 px-4 md:py-6 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-3xl font-black text-white flex items-center gap-2 md:gap-3"
          >
            <Image src="/logo.svg" alt="Who's next?" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
            <span className="hidden sm:inline">Who&apos;s next?</span>
            <span className="sm:hidden">Next?</span>
          </motion.h1>

          {phase !== 'input' && (
            <div className="flex items-center gap-2 md:gap-3">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  if (next) {
                    await primeSound();
                  }
                }}
                aria-pressed={soundEnabled}
                aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
                className="px-2 py-1.5 md:px-3 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg
                           text-white text-xs md:text-sm font-medium transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                title={soundEnabled ? 'Sound on' : 'Sound off'}
              >
                <span className="hidden sm:inline">{soundEnabled ? '🔊 Sound' : '🔇 Sound'}</span>
                <span className="sm:hidden" aria-hidden="true">{soundEnabled ? '🔊' : '🔇'}</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewGame}
                aria-label="Start new game"
                className="px-2 py-1.5 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg
                           text-white text-xs md:text-sm font-medium transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
              >
                <span className="hidden sm:inline">🆕 New Game</span>
                <span className="sm:hidden" aria-hidden="true">🆕</span>
              </motion.button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 py-4 md:px-8 md:py-8">
        <AnimatePresence mode="wait">
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <NameInput onNamesSubmit={handleNamesSubmit} />
            </motion.div>
          )}

          {phase === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <NameList
                people={people}
                onUpdate={handleUpdatePeople}
                onStartGame={handleStartGame}
                onBack={handleBackToInput}
              />
            </motion.div>
          )}

          {phase === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <GameArena
                initialPeople={people}
                shuffledOrder={shuffledOrder}
                soundEnabled={soundEnabled}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
