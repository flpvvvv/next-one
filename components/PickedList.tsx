'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Person } from '@/types';

interface PickedListProps {
  pickedOrder: Person[];
  remaining: number;
  onRestartRound: () => void;
  onNewGame: () => void;
}

export default function PickedList({
  pickedOrder,
  remaining,
  onRestartRound,
  onNewGame,
}: PickedListProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <span>📋</span>
        Pick Order
      </h3>

      {/* Picked names */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        <AnimatePresence mode="popLayout">
          {pickedOrder.map((person, index) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
            >
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500
                             flex items-center justify-center text-xs font-bold text-white">
                {index + 1}
              </span>
              <span className="text-white text-sm truncate">{person.name}</span>
              <span className="ml-auto text-green-400">✓</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {pickedOrder.length === 0 && (
          <p className="text-white/40 text-sm text-center py-4">
            No one picked yet.<br />
            Click SPIN to start!
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="py-3 border-t border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Remaining</span>
          <span className="text-white font-bold">{remaining}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-white/60">Picked</span>
          <span className="text-green-400 font-bold">{pickedOrder.length}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2 pt-3 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestartRound}
          className="w-full py-2 px-4 bg-white/10 hover:bg-white/20
                     rounded-lg text-white text-sm font-medium
                     transition-colors duration-200"
        >
          🔄 Restart Round
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewGame}
          className="w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30
                     rounded-lg text-red-300 text-sm font-medium
                     transition-colors duration-200"
        >
          🆕 New Game
        </motion.button>
      </div>
    </div>
  );
}
