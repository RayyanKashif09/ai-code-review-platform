/**
 * EmptyState Component
 * Displayed when no code has been analyzed yet
 */

import React from 'react';
import { motion } from 'framer-motion';
import './EmptyState.css';

// Features to highlight
const FEATURES = [
  { icon: '🐛', title: 'Bug Detection', desc: 'Find potential bugs and errors' },
  { icon: '⚡', title: 'Optimization', desc: 'Get performance suggestions' },
  { icon: '📊', title: 'Quality Score', desc: 'Measure your code quality' },
  { icon: '📖', title: 'Best Practices', desc: 'Learn industry standards' }
];

function EmptyState({ onLoadSample }) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icon */}
      <motion.div
        className="empty-icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <span>🔍</span>
      </motion.div>

      {/* Title */}
      <h3 className="empty-title">Ready to Review Your Code</h3>
      <p className="empty-description">
        Paste your code in the editor and click "Analyze Code" to get
        AI-powered insights and suggestions.
      </p>

      {/* Features Grid */}
      <div className="features-grid">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <span className="feature-icon">{feature.icon}</span>
            <h4>{feature.title}</h4>
            <p>{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        className="empty-cta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="cta-text">Don't have code handy?</p>
        <button className="btn btn-outline" onClick={onLoadSample}>
          <span className="btn-icon">📝</span>
          Load Sample Code
        </button>
      </motion.div>

      {/* Supported Languages */}
      <motion.div
        className="supported-languages"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="lang-label">Supported:</span>
        <div className="lang-badges">
          <span className="lang-badge">🐍 Python</span>
          <span className="lang-badge">📜 JavaScript</span>
          <span className="lang-badge">☕ Java</span>
          <span className="lang-badge">⚙️ C++</span>
          <span className="lang-badge">🐹 Go</span>
          <span className="lang-badge">🦀 Rust</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EmptyState;
