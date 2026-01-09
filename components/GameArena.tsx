'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Person, GamePhase } from '@/types';
import Wheel, { WheelHandle } from './Wheel';
import SpinButton from './SpinButton';
import PickedList from './PickedList';
import Confetti from './Confetti';

interface GameArenaProps {
  initialPeople: Person[];
  onNewGame: () => void;
}

export default function GameArena({ initialPeople, onNewGame }: GameArenaProps) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [pickedOrder, setPickedOrder] = useState<Person[]>([]);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [currentWinner, setCurrentWinner] = useState<Person | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const wheelRef = useRef<WheelHandle>(null);

  // Get remaining (not picked) people
  const remainingCount = useMemo(
    () => people.filter(p => !p.picked).length,
    [people]
  );

  const handleSpin = useCallback(() => {
    if (remainingCount === 0 || phase !== 'playing') return;

    // If only one left, directly pick them
    if (remainingCount === 1) {
      const lastPerson = people.find(p => !p.picked)!;
      setCurrentWinner(lastPerson);
      setPeople(prev => prev.map(p => p.id === lastPerson.id ? { ...p, picked: true } : p));
      setPickedOrder(prev => [...prev, lastPerson]);
      setPhase('winner');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      return;
    }

    setPhase('spinning');
    wheelRef.current?.spin();
  }, [remainingCount, phase, people]);

  const handleSpinEnd = useCallback((winner: Person) => {
    setCurrentWinner(winner);
    setPeople(prev => prev.map(p => p.id === winner.id ? { ...p, picked: true } : p));
    setPickedOrder(prev => [...prev, winner]);
    setPhase('winner');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  }, []);

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
    setPeople(initialPeople.map(p => ({ ...p, picked: false })));
    setPickedOrder([]);
    setPhase('playing');
    setCurrentWinner(null);
    setShowConfetti(false);
  };

  return (
    <div className="flex gap-6 w-full max-w-6xl mx-auto">
      {/* Main arena */}
      <div className="flex-1">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
          {/* Wheel container */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <Wheel
                key={remainingCount} // Reset wheel rotation when segments change
                ref={wheelRef}
                people={people}
                onSpinEnd={handleSpinEnd}
              />

              {/* Winner banner - centered on wheel but transparent background */}
              <AnimatePresence>
                {phase === 'winner' && currentWinner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                  >
                    <motion.div
                      initial={{ y: 30, boxShadow: '0 0 40px rgba(255, 200, 0, 0.6)' }}
                      animate={{
                        y: 0,
                        boxShadow: [
                          '0 0 40px rgba(255, 200, 0, 0.6)',
                          '0 0 70px rgba(255, 200, 0, 0.9)',
                          '0 0 40px rgba(255, 200, 0, 0.6)',
                        ],
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500
                                 px-8 py-5 rounded-2xl shadow-2xl text-center pointer-events-auto"
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-5xl mb-2"
                      >
                        🎉
                      </motion.div>
                      <h2 className="text-2xl font-black text-white mb-1">WINNER!</h2>
                      <p className="text-xl font-bold text-white/90">{currentWinner.name}</p>
                      <p className="text-sm text-white/60 mt-1">#{pickedOrder.length} picked</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Finished overlay - only show when ALL done */}
              <AnimatePresence>
                {phase === 'finished' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full z-30"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center"
                    >
                      <div className="text-7xl mb-4">🏆</div>
                      <h2 className="text-3xl font-black text-white mb-4">All Done!</h2>
                      <p className="text-lg text-white/70 mb-6">
                        Everyone has been picked!
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRestartRound}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500
                                   rounded-xl font-bold text-lg text-white shadow-lg"
                      >
                        🔄 Play Again
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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

              {phase === 'winner' && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextRound}
                  className="px-12 py-5 bg-gradient-to-r from-green-500 to-teal-500
                             rounded-2xl font-black text-2xl text-white shadow-2xl"
                >
                  {remainingCount > 1 ? '→ Next Round' : '🏆 See Results'}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64">
        <PickedList
          pickedOrder={pickedOrder}
          remaining={remainingCount}
          onRestartRound={handleRestartRound}
          onNewGame={onNewGame}
        />
      </div>

      {/* Confetti */}
      <Confetti active={showConfetti} />
    </div>
  );
}
