'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Person, GamePhase } from '@/types';
import Wheel, { WheelHandle } from './Wheel';
import SpinButton from './SpinButton';
import PickedList from './PickedList';
import Confetti from './Confetti';
import { playJackpotSting } from '@/lib/sound';

function hashStringToSeed(input: string): number {
  // FNV-1a 32-bit
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface GameArenaProps {
  initialPeople: Person[];
  shuffledOrder: string[];
  soundEnabled: boolean;
}

export default function GameArena({ initialPeople, shuffledOrder, soundEnabled }: GameArenaProps) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [shuffledOrderState, setShuffledOrderState] = useState<string[]>(shuffledOrder);
  const [pickedOrder, setPickedOrder] = useState<Person[]>([]);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [currentWinner, setCurrentWinner] = useState<Person | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const wheelRef = useRef<WheelHandle>(null);
  const confettiTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current !== null) {
        window.clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  // Get remaining (not picked) people
  const remainingCount = useMemo(
    () => people.filter(p => !p.picked).length,
    [people]
  );

  const confettiSeed = useMemo(() => {
    if (!currentWinner) return pickedOrder.length;
    return (hashStringToSeed(currentWinner.id) + pickedOrder.length * 101) >>> 0;
  }, [currentWinner, pickedOrder.length]);

  const handleSpin = useCallback(() => {
    if (remainingCount === 0 || phase !== 'playing') return;

    // If only one left, directly pick them
    if (remainingCount === 1) {
      const lastPerson = people.find(p => !p.picked);
      if (!lastPerson) return;
      setCurrentWinner(lastPerson);
      setPeople(prev => prev.map(p => p.id === lastPerson.id ? { ...p, picked: true } : p));
      setPickedOrder(prev => [...prev, lastPerson]);
      setPhase('winner');
      setShowConfetti(true);
      if (confettiTimeoutRef.current !== null) window.clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = window.setTimeout(() => setShowConfetti(false), 3000);

      if (soundEnabled) {
        void playJackpotSting();
      }
      return;
    }

    setPhase('spinning');
    wheelRef.current?.spin();
  }, [remainingCount, phase, people, soundEnabled]);

  const handleSpinEnd = useCallback((winner: Person) => {
    setCurrentWinner(winner);
    setPeople(prev => prev.map(p => p.id === winner.id ? { ...p, picked: true } : p));
    setPickedOrder(prev => [...prev, winner]);
    setPhase('winner');
    setShowConfetti(true);
    if (confettiTimeoutRef.current !== null) window.clearTimeout(confettiTimeoutRef.current);
    confettiTimeoutRef.current = window.setTimeout(() => setShowConfetti(false), 2500);

    if (soundEnabled) {
      void playJackpotSting();
    }
  }, [soundEnabled]);

  const handleNextRound = () => {
    setCurrentWinner(null);
    const newRemaining = people.filter(p => !p.picked).length;
    if (newRemaining === 0) {
      setPhase('finished');
    } else {
      setPhase('playing');
    }
  };

  const handleRestartRound = () => {
    // Reset people state first
    const resetPeople = initialPeople.map(p => ({ ...p, picked: false }));
    
    // Shuffle the reset list purely for the order IDs (the Wheel uses IDs for order)
    const newShuffledPeople = shuffleArray(resetPeople);
    
    setPeople(resetPeople);
    setShuffledOrderState(newShuffledPeople.map(p => p.id));
    setPickedOrder([]);
    setPhase('playing');
    setCurrentWinner(null);
    setShowConfetti(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full max-w-6xl mx-auto">
      {/* Main arena */}
      <div className="flex-1 min-w-0">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-8 border border-white/10">
          {/* Wheel container */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <Wheel
                ref={wheelRef}
                people={people}
                shuffledOrder={shuffledOrderState}
                soundEnabled={soundEnabled}
                onSpinEnd={handleSpinEnd}
                includePickedPersonId={phase === 'winner' && currentWinner ? currentWinner.id : undefined}
                highlightedPersonId={phase === 'winner' && currentWinner ? currentWinner.id : undefined}
              />
            </div>


            {/* Controls below wheel */}
            <div className="flex justify-center gap-4">
              {phase === 'playing' && (
                <SpinButton
                  onClick={handleSpin}
                  disabled={remainingCount === 0}
                  isSpinning={false}
                />
              )}

              {phase === 'spinning' && (
                <SpinButton
                  onClick={() => {}}
                  disabled={true}
                  isSpinning={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-64">
        <PickedList
          pickedOrder={pickedOrder}
          remaining={remainingCount}
          onRestartRound={handleRestartRound}
        />
      </div>

      {/* Confetti */}
      <Confetti active={showConfetti} seed={confettiSeed} />

      {/* Winner Spotlight Modal */}
      <AnimatePresence>
        {phase === 'winner' && currentWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full mx-4 md:mx-auto"
            >
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8 text-center text-white relative overflow-hidden">
                {/* Background animated circles */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, -45, 0],
                  }}
                  transition={{ duration: 15, repeat: Infinity }}
                  className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"
                />

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="text-5xl md:text-8xl mb-2 md:mb-4"
                >
                  🎉
                </motion.div>
                
                <h2 className="text-xl md:text-3xl font-bold opacity-90 mb-1 md:mb-2">The Winner is</h2>
                <h1 className="text-3xl md:text-6xl font-black mb-2 md:mb-4 drop-shadow-md break-words">
                  {currentWinner.name}
                </h1>
                
                <div className="inline-block px-4 py-2 bg-white/20 rounded-full backdrop-blur-md">
                  <span className="font-semibold">#{pickedOrder.length}</span> picked
                </div>
              </div>

              <div className="p-4 md:p-8 bg-gray-50 flex flex-col gap-3 md:gap-4">
                <p className="text-center text-gray-500 text-sm md:text-lg">
                  {remainingCount > 0 
                    ? `${remainingCount} ${remainingCount === 1 ? 'person' : 'people'} left in the list.` 
                    : "That was the last one!"}
                </p>

                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextRound}
                    autoFocus
                    className="w-full max-w-sm py-3 md:py-4 bg-gradient-to-r from-green-500 to-emerald-600
                               text-white text-lg md:text-2xl font-bold rounded-xl shadow-xl hover:shadow-2xl
                               transition-all"
                  >
                    {remainingCount > 0 ? "Next Round →" : "See Final Results 🏆"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finished Modal */}
      <AnimatePresence>
        {phase === 'finished' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center max-w-2xl w-full mx-4 md:mx-auto relative overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex-shrink-0">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl mb-2 md:mb-4"
                  >
                    🏆
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 mb-4 md:mb-6"
                  >
                    All Done!
                  </motion.h2>
                </div>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1 min-h-0 mb-8 flex flex-col"
                >
                   <div className="bg-white/5 rounded-2xl p-1 overflow-y-auto border border-white/10 flex-1 min-h-0 custom-scrollbar">
                    {pickedOrder.map((p, i) => (
                       <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (i * 0.05) }}
                          key={p.id} 
                          className="flex items-center gap-4 p-3 border-b border-white/5 last:border-0 text-left hover:bg-white/5 transition-colors"
                       >
                          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full text-sm font-bold text-white shadow-lg">
                            {i + 1}
                          </span>
                          <span className="text-lg font-medium text-white/90 truncate">{p.name}</span>
                       </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-4 flex-shrink-0">Hope you had a great stand-up!</p>
                </motion.div>
                
                <div className="flex-shrink-0">
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRestartRound}
                    className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
                  >
                    Start Fresh 🔄
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
