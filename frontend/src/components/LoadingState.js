import React from 'react';
import { motion } from 'framer-motion';

function LoadingState() {
  return (
    <motion.div
      className="loading-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="loading-spinner"></div>
      <h3>Analyzing your code...</h3>
      <p>Our AI is reviewing your code for bugs, optimizations, and best practices.</p>
    </motion.div>
  );
}

export default LoadingState;
