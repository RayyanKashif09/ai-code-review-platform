import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './WelcomePage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const featureIcons = {
  'bug-detection': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'performance-analysis': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'security-review': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  'smart-suggestions': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
};

// Default data in case API fails
const defaultData = {
  subtitle: "Protecting Code Logic, Quality, and Performance Using Artificial Intelligence",
  features: [
    { id: "bug-detection", title: "Bug Detection" },
    { id: "performance-analysis", title: "Performance Analysis" },
    { id: "security-review", title: "Security Review" },
    { id: "smart-suggestions", title: "Smart Suggestions" }
  ],
  copyright: "All Copyright Reserved @ LogicGuard 2025"
};

function WelcomePage({ onGetStarted }) {
  const [welcomeData, setWelcomeData] = useState(defaultData);

  useEffect(() => {
    const fetchWelcomeData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/welcome`);
        if (response.data.success) {
          setWelcomeData(response.data.data);
        }
      } catch (error) {
        console.log('Using default welcome data');
      }
    };

    fetchWelcomeData();
  }, []);

  return (
    <div className="welcome-page">
      <motion.div
        className="welcome-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="welcome-logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <img src="/2.png" alt="LogicGuard Logo" className="logo-image" />
        </motion.div>

        <motion.p
          className="welcome-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {welcomeData.subtitle}
        </motion.p>

        <motion.div
          className="welcome-features"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {welcomeData.features.map((feature) => (
            <div key={feature.id} className="feature-item">
              <div className="feature-icon">
                {featureIcons[feature.id]}
              </div>
              <span>{feature.title}</span>
            </div>
          ))}
        </motion.div>

        <motion.button
          className="get-started-btn"
          onClick={onGetStarted}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.button>

      </motion.div>

      <p className="welcome-copyright">
        {welcomeData.copyright}
      </p>
    </div>
  );
}

export default WelcomePage;
