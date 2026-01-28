'use client';

import { motion } from 'framer-motion';

interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSpinning: boolean;
}

export default function SpinButton({ onClick, disabled, isSpinning }: SpinButtonProps) {
  return (
    <motion.button
      whileHover={!disabled && !isSpinning ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isSpinning ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled || isSpinning}
      aria-label={isSpinning ? 'Wheel is spinning' : 'Spin the wheel'}
      aria-busy={isSpinning}
      className={`relative px-8 py-4 md:px-12 md:py-6 rounded-xl md:rounded-2xl font-black text-xl md:text-3xl text-white
                  shadow-2xl overflow-hidden
                  ${isSpinning
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-wait'
                    : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:shadow-orange-500/50'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500
                  transition-colors duration-300`}
    >
      {/* Animated background */}
      {!isSpinning && !disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Button content */}
      <span className="relative flex items-center gap-3">
        {isSpinning ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              aria-hidden="true"
            >
              🎰
            </motion.span>
            Spinning…
          </>
        ) : (
          <>
            <span className="text-2xl md:text-4xl" aria-hidden="true">🎰</span>
            SPIN!
          </>
        )}
      </span>

      {/* Glow effect */}
      {!isSpinning && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              '0 0 20px rgba(249, 115, 22, 0.5)',
              '0 0 40px rgba(249, 115, 22, 0.8)',
              '0 0 20px rgba(249, 115, 22, 0.5)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
