import React from 'react';
import { motion } from 'framer-motion';

function ReviewResults({ results }) {
  const { score, summary, bugs, optimizations, positives, metrics } = results;

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#f59e0b',
      low: '#3b82f6'
    };
    return colors[severity] || '#6b7280';
  };

  return (
    <motion.div
      className="review-results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Score Section */}
      <div className="score-section">
        <div className="score-circle" style={{ borderColor: getScoreColor(score) }}>
          <span className="score-value" style={{ color: getScoreColor(score) }}>{score}</span>
          <span className="score-label">Score</span>
        </div>
        <p className="summary">{summary}</p>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="metrics-section">
          <h3>Metrics</h3>
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Readability</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: `${metrics.readability}%` }}></div>
              </div>
              <span className="metric-value">{metrics.readability}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Maintainability</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: `${metrics.maintainability}%` }}></div>
              </div>
              <span className="metric-value">{metrics.maintainability}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Security</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: `${metrics.security}%` }}></div>
              </div>
              <span className="metric-value">{metrics.security}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Bugs */}
      {bugs && bugs.length > 0 && (
        <div className="section bugs-section">
          <h3>Issues Found ({bugs.length})</h3>
          {bugs.map((bug, index) => (
            <div key={index} className="bug-item">
              <div className="bug-header">
                <span className="severity-badge" style={{ backgroundColor: getSeverityColor(bug.severity) }}>
                  {bug.severity}
                </span>
                <span className="bug-title">{bug.title}</span>
                {bug.line && <span className="bug-line">Line {bug.line}</span>}
              </div>
              <p className="bug-description">{bug.description}</p>
              {bug.suggestion && (
                <p className="bug-suggestion"><strong>Fix:</strong> {bug.suggestion}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Optimizations */}
      {optimizations && optimizations.length > 0 && (
        <div className="section optimizations-section">
          <h3>Suggestions ({optimizations.length})</h3>
          {optimizations.map((opt, index) => (
            <div key={index} className="optimization-item">
              <span className="category-badge">{opt.category}</span>
              <h4>{opt.title}</h4>
              <p>{opt.description}</p>
              {opt.code_example && (
                <pre className="code-example">{opt.code_example}</pre>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Positives */}
      {positives && positives.length > 0 && (
        <div className="section positives-section">
          <h3>What's Good</h3>
          <ul>
            {positives.map((positive, index) => (
              <li key={index}>{positive}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export default ReviewResults;
