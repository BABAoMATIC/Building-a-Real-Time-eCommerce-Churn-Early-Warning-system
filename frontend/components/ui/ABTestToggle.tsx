'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ABTestToggleProps {
  currentCondition: 'control' | 'treatment';
  onToggle: (condition: 'control' | 'treatment') => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ABTestToggle: React.FC<ABTestToggleProps> = ({
  currentCondition,
  onToggle,
  isLoading = false,
  disabled = false
}) => {
  const handleToggle = () => {
    if (isLoading || disabled) return;
    
    const newCondition = currentCondition === 'control' ? 'treatment' : 'control';
    onToggle(newCondition);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Toggle Switch */}
      <div className="relative">
        <motion.button
          onClick={handleToggle}
          disabled={isLoading || disabled}
          className={`
            relative inline-flex h-12 w-24 items-center rounded-full transition-colors duration-300
            ${currentCondition === 'control' 
              ? 'bg-blue-600' 
              : 'bg-green-600'
            }
            ${isLoading || disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer hover:opacity-80'
            }
          `}
          whileHover={!isLoading && !disabled ? { scale: 1.05 } : {}}
          whileTap={!isLoading && !disabled ? { scale: 0.95 } : {}}
        >
          {/* Toggle Circle */}
          <motion.div
            className="absolute h-10 w-10 bg-white rounded-full shadow-lg"
            animate={{
              x: currentCondition === 'control' ? 4 : 52
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            {/* Loading Spinner */}
            {isLoading && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
              </motion.div>
            )}
          </motion.div>

          {/* Labels */}
          <div className="flex w-full justify-between px-3">
            <motion.span
              className={`text-xs font-medium ${
                currentCondition === 'control' ? 'text-white' : 'text-transparent'
              }`}
              animate={{
                opacity: currentCondition === 'control' ? 1 : 0.3
              }}
              transition={{ duration: 0.2 }}
            >
              Control
            </motion.span>
            <motion.span
              className={`text-xs font-medium ${
                currentCondition === 'treatment' ? 'text-white' : 'text-transparent'
              }`}
              animate={{
                opacity: currentCondition === 'treatment' ? 1 : 0.3
              }}
              transition={{ duration: 0.2 }}
            >
              Treatment
            </motion.span>
          </div>
        </motion.button>
      </div>

      {/* Status Indicator */}
      <motion.div
        className="flex items-center space-x-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className={`w-3 h-3 rounded-full ${
            currentCondition === 'control' ? 'bg-blue-500' : 'bg-green-500'
          }`}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <span className="text-sm font-medium text-gray-700">
          {isLoading ? 'Switching...' : `${currentCondition === 'control' ? 'Control' : 'Treatment'} Active`}
        </span>
      </motion.div>

      {/* Description */}
      <motion.p
        className="text-xs text-gray-500 text-center max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {currentCondition === 'control' 
          ? 'Standard email reminder for high-risk users'
          : 'Personalized discount offer for high-risk users'
        }
      </motion.p>
    </div>
  );
};
