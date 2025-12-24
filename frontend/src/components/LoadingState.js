/**
 * LoadingState Component
 * Animated loading indicator displayed during code analysis
 */

import React from 'react';
import { motion } from 'framer-motion';
import './LoadingState.css';

// Loading steps to display
const LOADING_STEPS = [
  { icon: '🔍', text: 'Analyzing code structure...' },
  { icon: '🐛', text: 'Detecting potential bugs...' },
  { icon: '⚡', text: 'Finding optimizations...' },
  { icon: '📊', text: 'Calculating quality score...' }
];

function LoadingState() {
  return (
    <motion.div
      className="loading-state"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Loader */}
      <div className="loader-container">
        <div className="loader-ring">
          <div className="loader-ring-inner" />
        </div>
        <div className="loader-icon">🤖</div>
      </div>

      {/* Title */}
      <h3 className="loading-title">AI is analyzing your code</h3>
      <p className="loading-subtitle">This may take a few seconds...</p>

      {/* Steps Animation */}
      <div className="loading-steps">
        {LOADING_STEPS.map((step, index) => (
          <motion.div
            key={index}
            className="loading-step"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 2,
              delay: index * 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <span className="step-icon">{step.icon}</span>
            <span className="step-text">{step.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="loading-progress">
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{
            duration: 8,
            ease: 'linear'
          }}
        />
      </div>
    </motion.div>
  );
}

export default LoadingState;
