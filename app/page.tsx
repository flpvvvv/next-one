'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Person } from '@/types';
import NameInput from '@/components/NameInput';
import NameList from '@/components/NameList';
import GameArena from '@/components/GameArena';

type AppPhase = 'input' | 'list' | 'game';

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>('input');
  const [people, setPeople] = useState<Person[]>([]);

  const handleNamesSubmit = (parsedPeople: Person[]) => {
    setPeople(parsedPeople);
    setPhase('list');
  };

  const handleUpdatePeople = (updatedPeople: Person[]) => {
    setPeople(updatedPeople);
  };

  const handleStartGame = () => {
    setPhase('game');
  };

  const handleBackToInput = () => {
    setPhase('input');
  };

  const handleNewGame = () => {
    setPeople([]);
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
      <header className="relative z-10 py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-white flex items-center gap-3"
          >
            <Image src="/logo.svg" alt="Who’s next?" width={40} height={40} className="w-10 h-10" />
            Who’s next?
          </motion.h1>

          {phase !== 'input' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewGame}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg
                         text-white text-sm font-medium transition-colors"
            >
              🆕 New Game
            </motion.button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-8 py-8">
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
                onNewGame={handleNewGame}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-white/40 text-sm">
          Made with ❤️ for fun team meetings
        </p>
      </footer>
    </div>
  );
}
