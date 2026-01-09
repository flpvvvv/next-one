'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { parseNames } from '@/lib/parseNames';
import { Person } from '@/types';

interface NameInputProps {
  onNamesSubmit: (people: Person[]) => void;
}

export default function NameInput({ onNamesSubmit }: NameInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    const people = parseNames(input);
    if (people.length > 0) {
      onNamesSubmit(people);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-3xl">📝</span>
          Enter Names
        </h2>

        <p className="text-white/70 text-sm mb-4">
          Paste a list of names separated by semicolons or newlines.
          <br />
          <span className="text-white/50">
            Supports email format: &quot;LastName, FirstName /XX &lt;email&gt;&quot;
          </span>
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Example:
Dupont, Marie /FR/EXT <Marie.Dupont@example.com>; Martin, Lucas /FR <Lucas.Martin@example.com>

Or simply:
Alice Johnson; Bob Smith; Carol Williams"
          className="w-full h-48 px-4 py-3 rounded-xl bg-white/5 border border-white/10
                     text-white placeholder-white/30 resize-none
                     focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50
                     transition-all duration-200"
        />

        <div className="mt-4 flex justify-between items-center">
          <span className="text-white/50 text-sm">
            Press ⌘+Enter to submit
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500
                       rounded-xl font-bold text-white shadow-lg
                       hover:shadow-pink-500/25 hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            Parse Names →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
