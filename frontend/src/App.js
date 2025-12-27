import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import WelcomePage from './components/WelcomePage';
import AuthPage from './components/AuthPage';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import ReviewResults from './components/ReviewResults';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import Notification from './components/Notification';
import './styles/App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SAMPLE_CODE = {
  python: `def calculate_average(numbers):
    # Calculate the average of a list
    total = 0
    for i in range(len(numbers)):
        total = total + numbers[i]
    average = total / len(numbers)
    return average

# Example usage
my_list = [10, 20, 30, 40, 50]
result = calculate_average(my_list)
print("Average:", result)

def find_max(arr):
    max = arr[0]
    for i in arr:
        if i > max:
            max = i
    return max`,

  javascript: `function fetchUserData(userId) {
  var userData = null;

  fetch('https://api.example.com/users/' + userId)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      userData = data;
      console.log(data);
    });

  return userData;
}

function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}`
};

// Main App Component with code analysis functionality
function MainApp({ user, setUser }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) {
      setNotification({ type: 'warning', message: 'Please enter some code to analyze' });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        code: code,
        language: language
      }, {
        timeout: 60000,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        setResults(response.data.data);
        setNotification({ type: 'success', message: 'Code analysis complete!' });
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze code';
      setError(errorMessage);
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, language]);

  const handleClear = useCallback(() => {
    setCode('');
    setResults(null);
    setError(null);
    setNotification({ type: 'info', message: 'Editor cleared' });
  }, []);

  const handleLoadSample = useCallback(() => {
    setCode(SAMPLE_CODE[language] || SAMPLE_CODE.python);
    setResults(null);
    setNotification({ type: 'info', message: `Sample ${language} code loaded` });
  }, [language]);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Redirect to welcome if no user
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="app">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <AnimatePresence>
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onDismiss={dismissNotification}
          />
        )}
      </AnimatePresence>

      <Header user={user} />

      <main className="main-content">
        <div className="split-layout">
          <motion.section
            className="panel panel-editor"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CodeEditor
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
              onLoadSample={handleLoadSample}
              isAnalyzing={isAnalyzing}
            />
          </motion.section>

          <motion.section
            className="panel panel-results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="panel-header">
              <h2 className="panel-title">Analysis Results</h2>
            </div>

            <div className="results-container">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <LoadingState key="loading" />
                ) : results ? (
                  <ReviewResults key="results" results={results} />
                ) : error ? (
                  <motion.div
                    key="error"
                    className="error-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="error-icon">!</div>
                    <h3>Analysis Failed</h3>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={handleAnalyze}>
                      Try Again
                    </button>
                  </motion.div>
                ) : (
                  <EmptyState key="empty" onLoadSample={handleLoadSample} />
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </main>

      <footer className="footer">
        <p>LogicGuard - Powered by Groq AI</p>
      </footer>
    </div>
  );
}

// Welcome Page Wrapper with navigation
function WelcomePageWrapper() {
  const navigate = useNavigate();

  const handleGetStarted = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  return <WelcomePage onGetStarted={handleGetStarted} />;
}

// Auth Page Wrapper with navigation
function AuthPageWrapper({ setUser }) {
  const navigate = useNavigate();

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    navigate('/app');
  }, [navigate, setUser]);

  const handleBack = useCallback(() => {
    navigate('/welcome');
  }, [navigate]);

  return <AuthPage onLogin={handleLogin} onBack={handleBack} />;
}

// Root App Component with Router
function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<WelcomePageWrapper />} />
        <Route path="/auth" element={<AuthPageWrapper setUser={setUser} />} />
        <Route path="/app" element={<MainApp user={user} setUser={setUser} />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
