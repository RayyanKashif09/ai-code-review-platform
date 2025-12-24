/**
 * Notification Component
 * Toast notification for user feedback
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './Notification.css';

// Notification type configurations
const NOTIFICATION_CONFIG = {
  success: {
    icon: '✅',
    className: 'notification-success'
  },
  error: {
    icon: '❌',
    className: 'notification-error'
  },
  warning: {
    icon: '⚠️',
    className: 'notification-warning'
  },
  info: {
    icon: 'ℹ️',
    className: 'notification-info'
  }
};

function Notification({ type = 'info', message, onDismiss }) {
  const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.info;

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      className={`notification ${config.className}`}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      <span className="notification-icon">{config.icon}</span>
      <span className="notification-message">{message}</span>
      <button
        className="notification-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </motion.div>
  );
}

export default Notification;
