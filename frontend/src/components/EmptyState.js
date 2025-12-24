import React from 'react';
import { motion } from 'framer-motion';

function EmptyState({ onLoadSample }) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="empty-icon">{'</>'}</div>
      <h3>No Code to Analyze</h3>
      <p>Paste your code in the editor or load a sample to get started.</p>
      <button className="btn btn-primary" onClick={onLoadSample}>
        Load Sample Code
      </button>
    </motion.div>
  );
}

export default EmptyState;
