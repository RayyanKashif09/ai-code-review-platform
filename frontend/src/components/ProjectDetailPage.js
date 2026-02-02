import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ProjectDetailPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ProjectDetailPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const projectFromState = location.state?.project;

  const [project, setProject] = useState(projectFromState);
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (projectFromState?.id) {
      fetchProjectAnalyses(projectFromState.id);
    }
  }, [projectFromState]);

  const fetchProjectAnalyses = async (projectId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/analyses`);
      const data = await response.json();
      if (data.success) {
        setProject(data.data.project);
        setAnalyses(data.data.analyses);
        // Auto-select the most recent analysis
        if (data.data.analyses.length > 0) {
          setSelectedAnalysis(data.data.analyses[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch project analyses:', error);
    }
    setIsLoading(false);
  };

  if (!projectFromState) {
    return <Navigate to="/home" replace />;
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNewAnalysis = () => {
    navigate('/app', { state: { project } });
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const handleViewFullResults = (analysis) => {
    navigate('/results', {
      state: {
        results: {
          score: analysis.score,
          summary: analysis.summary,
          bugs: analysis.bugs,
          optimizations: analysis.optimizations,
          positives: analysis.positives,
          metrics: analysis.metrics
        },
        code: analysis.code_snippet,
        language: analysis.language,
        project: project,
        analysisId: analysis.id,
        viewOnly: true
      }
    });
  };

  return (
    <div className="project-detail-page">
      {/* Header */}
      <header className="project-detail-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBackToHome}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </div>
        <div className="header-center">
          <div className="logo-small">
            <img src="/logo.png" alt="LogicGuard" className="logo-img" />
            <span>LogicGuard</span>
          </div>
        </div>
        <div className="header-right">
          <button className="new-analysis-btn" onClick={handleNewAnalysis}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Analysis
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="project-detail-main">
        <div className="project-detail-container">
          {/* Project Info */}
          <motion.div
            className="project-info-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>{project?.name}</h1>
            {project?.description && <p className="project-description">{project.description}</p>}
            <div className="project-meta">
              <span className="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16,18 22,12 16,6" />
                  <polyline points="8,6 2,12 8,18" />
                </svg>
                {project?.language || 'Python'}
              </span>
              <span className="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                {analyses.length} Analysis{analyses.length !== 1 ? 'es' : ''}
              </span>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading project data...</p>
            </div>
          ) : analyses.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <h3>No Analyses Yet</h3>
              <p>Start analyzing code to see results here.</p>
              <button className="start-analysis-btn" onClick={handleNewAnalysis}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Start First Analysis
              </button>
            </motion.div>
          ) : (
            <div className="analyses-content">
              {/* Analysis List */}
              <motion.div
                className="analyses-sidebar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3>Analysis History</h3>
                <div className="analyses-list">
                  {analyses.map((analysis, index) => (
                    <div
                      key={analysis.id}
                      className={`analysis-item ${selectedAnalysis?.id === analysis.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedAnalysis(analysis);
                        setShowCode(false);
                      }}
                    >
                      <div className="analysis-score" style={{ background: getScoreColor(analysis.score) }}>
                        {analysis.score}
                      </div>
                      <div className="analysis-info">
                        <span className="analysis-date">{formatDate(analysis.created_at)}</span>
                        <span className="analysis-summary">
                          {analysis.summary?.substring(0, 50) || 'Code Analysis'}
                          {analysis.summary?.length > 50 ? '...' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Selected Analysis Details */}
              {selectedAnalysis && (
                <motion.div
                  className="analysis-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  key={selectedAnalysis.id}
                >
                  {/* Score Card */}
                  <div className="detail-score-card">
                    <div className="score-circle" style={{ borderColor: getScoreColor(selectedAnalysis.score) }}>
                      <span className="score-value" style={{ color: getScoreColor(selectedAnalysis.score) }}>
                        {selectedAnalysis.score}
                      </span>
                      <span className="score-max">/100</span>
                    </div>
                    <div className="score-info">
                      <span className="score-label" style={{ color: getScoreColor(selectedAnalysis.score) }}>
                        {getScoreLabel(selectedAnalysis.score)}
                      </span>
                      <p className="score-summary">{selectedAnalysis.summary}</p>
                      <span className="score-date">{formatDate(selectedAnalysis.created_at)}</span>
                    </div>
                  </div>

                  {/* View Code Button */}
                  <div className="view-code-section">
                    <button
                      className="view-code-btn"
                      onClick={() => setShowCode(!showCode)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16,18 22,12 16,6" />
                        <polyline points="8,6 2,12 8,18" />
                      </svg>
                      {showCode ? 'Hide Code' : 'View Code'}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`chevron ${showCode ? 'open' : ''}`}
                      >
                        <polyline points="6,9 12,15 18,9" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {showCode && (
                        <motion.div
                          className="code-preview-container"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="code-preview-header">
                            <span className="code-language">{selectedAnalysis.language}</span>
                            <span className="code-lines">
                              {selectedAnalysis.code_snippet?.split('\n').length || 0} lines
                            </span>
                          </div>
                          <pre className="code-preview">
                            <code>{selectedAnalysis.code_snippet}</code>
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quick Stats */}
                  <div className="quick-stats">
                    <div className="stat-item bugs">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                      <span>{selectedAnalysis.bugs?.length || 0} Issues</span>
                    </div>
                    <div className="stat-item optimizations">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                      </svg>
                      <span>{selectedAnalysis.optimizations?.length || 0} Optimizations</span>
                    </div>
                    <div className="stat-item positives">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22,4 12,14.01 9,11.01" />
                      </svg>
                      <span>{selectedAnalysis.positives?.length || 0} Positives</span>
                    </div>
                  </div>

                  {/* Bugs Preview */}
                  {selectedAnalysis.bugs && selectedAnalysis.bugs.length > 0 && (
                    <div className="section-preview bugs-preview">
                      <h4>Issues Found</h4>
                      <div className="preview-list">
                        {selectedAnalysis.bugs.slice(0, 2).map((bug, index) => (
                          <div key={index} className="preview-item">
                            <span
                              className="severity-badge"
                              style={{ background: getSeverityColor(bug.severity) }}
                            >
                              {bug.severity}
                            </span>
                            <span className="preview-title">{bug.title}</span>
                          </div>
                        ))}
                        {selectedAnalysis.bugs.length > 2 && (
                          <span className="more-items">+{selectedAnalysis.bugs.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Full Results Button */}
                  <button
                    className="view-full-btn"
                    onClick={() => handleViewFullResults(selectedAnalysis)}
                  >
                    View Full Results
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="project-detail-footer">
        <p>LogicGuard - AI-Powered Code Analysis</p>
      </footer>
    </div>
  );
}

export default ProjectDetailPage;
