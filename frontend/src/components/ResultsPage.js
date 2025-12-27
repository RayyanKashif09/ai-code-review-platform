import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ResultsPage.css';

function ResultsPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { results, code, language, project } = location.state || {};

  // Redirect if no results
  if (!results) {
    return <Navigate to="/app" replace />;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Decent';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#888';
    }
  };

  const handleNewAnalysis = () => {
    navigate('/app', { state: { project } });
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div className="results-page">
      {/* Header */}
      <header className="results-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleNewAnalysis}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Analyze More Code
          </button>
        </div>
        <div className="header-center">
          <div className="logo-small">
            <img src="/logo.png" alt="LogicGuard" className="logo-img" />
            <span>LogicGuard</span>
          </div>
        </div>
        <div className="header-right">
          <button className="home-btn" onClick={handleBackToHome}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="results-main">
        <div className="results-container">
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className="step completed">
              <div className="step-number">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
              <span>Enter Code</span>
            </div>
            <div className="step-line completed"></div>
            <div className="step active">
              <div className="step-number">2</div>
              <span>View Results</span>
            </div>
          </div>

          {/* Title */}
          <motion.div
            className="results-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>Analysis Complete</h1>
            <p>Here's what LogicGuard found in your {language} code.</p>
          </motion.div>

          {/* Score Card */}
          <motion.div
            className="score-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="score-circle" style={{ borderColor: getScoreColor(results.score) }}>
              <span className="score-value" style={{ color: getScoreColor(results.score) }}>
                {results.score}
              </span>
              <span className="score-max">/100</span>
            </div>
            <div className="score-details">
              <span className="score-label" style={{ color: getScoreColor(results.score) }}>
                {getScoreLabel(results.score)}
              </span>
              <p className="score-summary">{results.summary}</p>
            </div>
          </motion.div>

          {/* Metrics */}
          {results.metrics && (
            <motion.div
              className="metrics-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3>Code Metrics</h3>
              <div className="metrics-grid">
                {Object.entries(results.metrics).map(([key, value]) => (
                  <div key={key} className="metric-item">
                    <span className="metric-label">{key.replace(/_/g, ' ')}</span>
                    <div className="metric-bar-container">
                      <div
                        className="metric-bar-fill"
                        style={{ width: `${Math.min(value, 100)}%` }}
                      ></div>
                    </div>
                    <span className="metric-value">{value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bugs Section */}
          {results.bugs && results.bugs.length > 0 && (
            <motion.div
              className="section-card bugs-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                Issues Found ({results.bugs.length})
              </h3>
              <div className="bugs-list">
                {results.bugs.map((bug, index) => (
                  <motion.div
                    key={index}
                    className="bug-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  >
                    <div className="bug-header">
                      <span
                        className="severity-badge"
                        style={{ background: getSeverityColor(bug.severity) }}
                      >
                        {bug.severity || 'Issue'}
                      </span>
                      <span className="bug-title">{bug.title || bug.type}</span>
                      {bug.line && <span className="bug-line">Line {bug.line}</span>}
                    </div>
                    <p className="bug-description">{bug.description}</p>
                    {bug.suggestion && (
                      <div className="bug-suggestion">
                        <strong>Suggestion:</strong> {bug.suggestion}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Optimizations Section */}
          {results.optimizations && results.optimizations.length > 0 && (
            <motion.div
              className="section-card optimizations-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                </svg>
                Optimization Suggestions ({results.optimizations.length})
              </h3>
              <div className="optimizations-list">
                {results.optimizations.map((opt, index) => (
                  <motion.div
                    key={index}
                    className="optimization-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  >
                    {opt.category && (
                      <span className="category-badge">{opt.category}</span>
                    )}
                    <h4>{opt.title}</h4>
                    <p>{opt.description}</p>
                    {opt.example && (
                      <div className="code-example">
                        <pre>{opt.example}</pre>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Positives Section */}
          {results.positives && results.positives.length > 0 && (
            <motion.div
              className="section-card positives-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
                What You Did Well ({results.positives.length})
              </h3>
              <ul className="positives-list">
                {results.positives.map((positive, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                    {typeof positive === 'string' ? positive : positive.description}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            className="results-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <button className="btn-secondary" onClick={handleBackToHome}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
              Back to Home
            </button>
            <button className="btn-primary" onClick={handleNewAnalysis}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,4 23,10 17,10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Analyze More Code
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="results-footer">
        <p>LogicGuard - AI-Powered Code Analysis</p>
      </footer>
    </div>
  );
}

export default ResultsPage;
