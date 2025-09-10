'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { OfferRule } from '@/hooks/useABTest';

interface OfferRuleCardProps {
  offerRule: OfferRule;
  conditionType: 'control' | 'treatment';
  isActive: boolean;
  isLoading?: boolean;
}

export const OfferRuleCard: React.FC<OfferRuleCardProps> = ({
  offerRule,
  conditionType,
  isActive,
  isLoading = false
}) => {
  const getConditionColor = (type: 'control' | 'treatment') => {
    return type === 'control' ? 'blue' : 'green';
  };

  const color = getConditionColor(conditionType);

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300
        ${isActive 
          ? `border-${color}-500 bg-${color}-50 shadow-lg` 
          : 'border-gray-200 bg-white shadow-sm'
        }
        ${isLoading ? 'opacity-50' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isActive ? 1.02 : 1
      }}
      transition={{ 
        duration: 0.5,
        ease: "easeOut"
      }}
      whileHover={!isLoading ? { 
        scale: 1.01,
        transition: { duration: 0.2 }
      } : {}}
    >
      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className={`absolute top-0 left-0 w-full h-1 bg-${color}-500`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <motion.div
            className={`
              w-3 h-3 rounded-full
              ${isActive ? `bg-${color}-500` : 'bg-gray-300'}
            `}
            animate={{
              scale: isActive ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          <h3 className={`text-lg font-semibold ${
            isActive ? `text-${color}-900` : 'text-gray-900'
          }`}>
            {conditionType === 'control' ? 'Control Group' : 'Treatment Group'}
          </h3>
        </div>
        
        {isActive && (
          <motion.div
            className={`px-3 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            Active
          </motion.div>
        )}
      </div>

      {/* Condition */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Condition</h4>
        <motion.div
          className={`
            p-3 rounded-lg font-mono text-sm
            ${isActive ? `bg-${color}-100 text-${color}-800` : 'bg-gray-100 text-gray-700'}
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {offerRule.condition}
        </motion.div>
      </div>

      {/* Action */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Action</h4>
        <motion.div
          className={`
            p-3 rounded-lg font-mono text-sm
            ${isActive ? `bg-${color}-100 text-${color}-800` : 'bg-gray-100 text-gray-700'}
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {offerRule.action}
        </motion.div>
      </div>

      {/* Description */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
        <motion.p
          className={`text-sm leading-relaxed ${
            isActive ? `text-${color}-700` : 'text-gray-600'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {offerRule.description}
        </motion.p>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full"
          />
        </motion.div>
      )}
    </motion.div>
  );
};
