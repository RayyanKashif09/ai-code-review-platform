/**
 * ReviewResults Component
 * Displays the AI code review analysis results
 * Includes score, bugs, optimizations, and metrics
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ReviewResults.css';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

/**
 * Score Circle Component
 * Animated circular progress indicator for the quality score
 */
function ScoreCircle({ score }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Determine score color
  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="score-circle-container">
      <svg className="score-svg" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="score-bg"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <motion.circle
          className="score-progress"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke={scoreColor}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
      </svg>
      <div className="score-value" style={{ color: scoreColor }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="score-max">/100</span>
      </div>
    </div>
  );
}

/**
 * Metric Bar Component
 * Horizontal progress bar for individual metrics
 */
function MetricBar({ label, value, icon }) {
  const getBarColor = (value) => {
    if (value >= 80) return 'var(--color-success)';
    if (value >= 60) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div className="metric-bar">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value}%</span>
      </div>
      <div className="metric-track">
        <motion.div
          className="metric-fill"
          style={{ backgroundColor: getBarColor(value) }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/**
 * Severity Badge Component
 */
function SeverityBadge({ severity }) {
  const severityConfig = {
    critical: { label: 'Critical', color: '#ef4444', icon: '🔴' },
    high: { label: 'High', color: '#f97316', icon: '🟠' },
    medium: { label: 'Medium', color: '#f59e0b', icon: '🟡' },
    low: { label: 'Low', color: '#22c55e', icon: '🟢' }
  };

  const config = severityConfig[severity] || severityConfig.medium;

  return (
    <span className="severity-badge" style={{ borderColor: config.color }}>
      <span className="severity-icon">{config.icon}</span>
      {config.label}
    </span>
  );
}

/**
 * Category Badge Component
 */
function CategoryBadge({ category }) {
  const categoryConfig = {
    performance: { label: 'Performance', color: '#8b5cf6', icon: '⚡' },
    readability: { label: 'Readability', color: '#06b6d4', icon: '📖' },
    'best-practices': { label: 'Best Practices', color: '#3b82f6', icon: '✨' },
    security: { label: 'Security', color: '#ef4444', icon: '🔒' }
  };

  const config = categoryConfig[category] || categoryConfig['best-practices'];

  return (
    <span className="category-badge" style={{ borderColor: config.color, color: config.color }}>
      <span className="category-icon">{config.icon}</span>
      {config.label}
    </span>
  );
}

/**
 * Expandable Card Component
 */
function ExpandableCard({ title, icon, children, defaultExpanded = true, count }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      className={`expandable-card ${isExpanded ? 'expanded' : ''}`}
      variants={itemVariants}
    >
      <button
        className="card-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="card-title">
          <span className="card-icon">{icon}</span>
          <h3>{title}</h3>
          {count !== undefined && (
            <span className="card-count">{count}</span>
          )}
        </div>
        <motion.span
          className="expand-icon"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="card-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Main ReviewResults Component
 */
function ReviewResults({ results }) {
  if (!results) return null;

  const { score, summary, bugs, optimizations, positives, metrics } = results;

  return (
    <motion.div
      className="review-results"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Score Section */}
      <motion.div className="score-section" variants={itemVariants}>
        <div className="score-card">
          <ScoreCircle score={score} />
          <div className="score-info">
            <h3>Code Quality Score</h3>
            <p className="score-summary">{summary}</p>
            <div className="score-badges">
              <span className={`quality-badge ${score >= 80 ? 'good' : score >= 60 ? 'fair' : 'poor'}`}>
                {score >= 80 ? '✅ Good Quality' : score >= 60 ? '⚠️ Needs Improvement' : '❌ Poor Quality'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Section */}
      {metrics && (
        <motion.div className="metrics-section" variants={itemVariants}>
          <div className="metrics-grid">
            <MetricBar
              label="Readability"
              value={metrics.readability}
              icon="📖"
            />
            <MetricBar
              label="Maintainability"
              value={metrics.maintainability}
              icon="🔧"
            />
            <MetricBar
              label="Security"
              value={metrics.security}
              icon="🔒"
            />
          </div>
          <div className="complexity-badge">
            <span className="complexity-label">Complexity:</span>
            <span className={`complexity-value ${metrics.complexity}`}>
              {metrics.complexity?.charAt(0).toUpperCase() + metrics.complexity?.slice(1)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Bugs Section */}
      {bugs && bugs.length > 0 && (
        <ExpandableCard
          title="Issues Found"
          icon="🐛"
          count={bugs.length}
          defaultExpanded={true}
        >
          <div className="issues-list">
            {bugs.map((bug, index) => (
              <motion.div
                key={index}
                className="issue-item bug"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="issue-header">
                  <SeverityBadge severity={bug.severity} />
                  {bug.line && (
                    <span className="line-number">Line {bug.line}</span>
                  )}
                </div>
                <h4 className="issue-title">{bug.title}</h4>
                <p className="issue-description">{bug.description}</p>
                {bug.suggestion && (
                  <div className="issue-suggestion">
                    <span className="suggestion-icon">💡</span>
                    <span>{bug.suggestion}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </ExpandableCard>
      )}

      {/* Optimizations Section */}
      {optimizations && optimizations.length > 0 && (
        <ExpandableCard
          title="Optimization Suggestions"
          icon="⚡"
          count={optimizations.length}
          defaultExpanded={true}
        >
          <div className="issues-list">
            {optimizations.map((opt, index) => (
              <motion.div
                key={index}
                className="issue-item optimization"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="issue-header">
                  <CategoryBadge category={opt.category} />
                </div>
                <h4 className="issue-title">{opt.title}</h4>
                <p className="issue-description">{opt.description}</p>
                {opt.code_example && (
                  <div className="code-example">
                    <pre><code>{opt.code_example}</code></pre>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </ExpandableCard>
      )}

      {/* Positives Section */}
      {positives && positives.length > 0 && (
        <ExpandableCard
          title="What's Good"
          icon="✅"
          count={positives.length}
          defaultExpanded={false}
        >
          <ul className="positives-list">
            {positives.map((positive, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="positive-icon">👍</span>
                {positive}
              </motion.li>
            ))}
          </ul>
        </ExpandableCard>
      )}

      {/* No Issues State */}
      {(!bugs || bugs.length === 0) && (!optimizations || optimizations.length === 0) && (
        <motion.div className="no-issues" variants={itemVariants}>
          <span className="no-issues-icon">🎉</span>
          <h3>Great Job!</h3>
          <p>No major issues found in your code.</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ReviewResults;
