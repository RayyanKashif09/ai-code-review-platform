/**
 * Header Component
 * Displays the application branding and navigation
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Header.css';

function Header() {
  return (
    <motion.header
      className="header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-content">
        {/* Logo & Branding */}
        <div className="header-brand">
          <div className="logo">
            <span className="logo-icon">🔍</span>
            <div className="logo-text">
              <h1>AI Code Review</h1>
              <span className="logo-tagline">Smart Analysis Platform</span>
            </div>
          </div>
        </div>

        {/* Navigation / Info */}
        <nav className="header-nav">
          <div className="nav-item">
            <span className="nav-icon">⚡</span>
            <span className="nav-text">Powered by GPT-4</span>
          </div>
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>Ready</span>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}

export default Header;
