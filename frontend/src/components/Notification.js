import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

function Notification({ type, message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  return (
    <motion.div
      className="notification"
      style={{ backgroundColor: colors[type] || colors.info }}
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
    >
      <span>{message}</span>
      <button onClick={onDismiss}>&times;</button>
    </motion.div>
  );
}

export default Notification;
