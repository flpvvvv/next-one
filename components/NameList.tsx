'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Person } from '@/types';
import { validateNameCount } from '@/lib/parseNames';

interface NameListProps {
  people: Person[];
  onUpdate: (people: Person[]) => void;
  onStartGame: () => void;
  onBack: () => void;
}

export default function NameList({ people, onUpdate, onStartGame, onBack }: NameListProps) {
  const [newName, setNewName] = useState('');

  const handleRemove = (id: string) => {
    onUpdate(people.filter(p => p.id !== id));
  };

  const handleAdd = () => {
    if (newName.trim()) {
      const newPerson: Person = {
        id: Math.random().toString(36).substring(2, 11),
        name: newName.trim(),
        picked: false,
      };
      onUpdate([...people, newPerson]);
      setNewName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const validation = validateNameCount(people.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">👥</span>
            Name List
            <span className="text-lg font-normal text-white/60">
              ({people.length} {people.length === 1 ? 'person' : 'people'})
            </span>
          </h2>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-4 py-2 text-white/70 hover:text-white transition-colors"
          >
            ← Back
          </motion.button>
        </div>

        {/* Add new name */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a name..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder-white/30
                       focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50
                       transition-all duration-200"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-4 py-2 bg-teal-500 rounded-xl font-bold text-white
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            + Add
          </motion.button>
        </div>

        {/* Name list */}
        <div className="max-h-64 overflow-y-auto space-y-2 mb-4 pr-2">
          <AnimatePresence mode="popLayout">
            {people.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl
                           border border-white/10 group hover:bg-white/10 transition-colors"
              >
                <span className="text-white flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500
                                   flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  {person.name}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemove(person.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-400
                             hover:text-red-300 hover:bg-red-500/20 rounded-lg
                             transition-all duration-200"
                >
                  ✕
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Validation message */}
        {!validation.valid && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-amber-400 text-sm mb-4"
          >
            ⚠️ {validation.message}
          </motion.p>
        )}

        {/* Start Game button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartGame}
          disabled={!validation.valid}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500
                     rounded-xl font-bold text-xl text-white shadow-lg
                     hover:shadow-green-500/25 hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          🎲 Start Game!
        </motion.button>
      </div>
    </motion.div>
  );
}
