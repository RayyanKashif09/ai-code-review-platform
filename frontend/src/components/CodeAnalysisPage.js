import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './CodeAnalysisPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LANGUAGES = [
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', icon: '📜' },
  { id: 'typescript', name: 'TypeScript', icon: '💙' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⚡' },
  { id: 'c', name: 'C', icon: '🔧' },
  { id: 'go', name: 'Go', icon: '🐹' },
  { id: 'rust', name: 'Rust', icon: '🦀' },
];

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
print("Average:", result)`,

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
}`,

  typescript: `interface User {
  id: number;
  name: string;
  email: string;
}

async function getUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  return data;
}`,

  java: `public class Calculator {
    public static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        int result = add(5, 3);
        System.out.println("Result: " + result);
    }
}`,

  cpp: `#include <iostream>
#include <vector>

int findMax(std::vector<int>& nums) {
    int max = nums[0];
    for (int i = 1; i < nums.size(); i++) {
        if (nums[i] > max) {
            max = nums[i];
        }
    }
    return max;
}`,

  c: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printf("Factorial of 5: %d\\n", factorial(5));
    return 0;
}`,

  go: `package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println(fibonacci(10))
}`,

  rust: `fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}`
};

function CodeAnalysisPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project;

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(project?.language || 'python');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project?.language) {
      setLanguage(project.language);
    }
  }, [project]);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: language,
          user_id: user?.id,
          project_id: project?.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/results', {
          state: {
            results: data.data,
            code: code,
            language: language,
            project: project
          }
        });
      } else {
        setError(data.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    setCode(SAMPLE_CODE[language] || SAMPLE_CODE.python);
    setError('');
  };

  const handleClear = () => {
    setCode('');
    setError('');
  };

  const countLines = () => {
    if (!code) return 0;
    return code.split('\n').length;
  };

  const countCharacters = () => {
    return code.length;
  };

  return (
    <div className="analysis-page">
      {/* Header */}
      <header className="analysis-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/home')}>
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
          {user && (
            <div className="user-badge">
              <div className="user-avatar-small">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span>{user.name || user.email}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="analysis-main">
        <div className="analysis-container">
          {/* Project Info */}
          {project && (
            <motion.div
              className="project-info-bar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="project-label">Project:</span>
              <span className="project-name">{project.name}</span>
              {project.description && (
                <span className="project-desc">- {project.description}</span>
              )}
            </motion.div>
          )}

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className="step active">
              <div className="step-number">1</div>
              <span>Enter Code</span>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-number">2</div>
              <span>View Results</span>
            </div>
          </div>

          {/* Title */}
          <motion.div
            className="analysis-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>Paste Your Code</h1>
            <p>Enter your code below and let LogicGuard analyze it for bugs, optimizations, and best practices.</p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Language Selector */}
          <motion.div
            className="language-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <label>Programming Language:</label>
            <div className="language-options">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  className={`lang-btn ${language === lang.id ? 'active' : ''}`}
                  onClick={() => setLanguage(lang.id)}
                >
                  <span className="lang-icon">{lang.icon}</span>
                  <span className="lang-name">{lang.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Code Editor */}
          <motion.div
            className="code-editor-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="editor-header">
              <div className="editor-tabs">
                <div className="tab active">
                  <span className="tab-icon">
                    {LANGUAGES.find(l => l.id === language)?.icon || '📄'}
                  </span>
                  <span>code.{language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language}</span>
                </div>
              </div>
              <div className="editor-actions-top">
                <button className="action-btn" onClick={handleLoadSample} title="Load sample code">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                  Sample
                </button>
                <button className="action-btn" onClick={handleClear} title="Clear editor">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Clear
                </button>
              </div>
            </div>

            <div className="editor-body">
              <div className="line-numbers">
                {Array.from({ length: Math.max(countLines(), 20) }, (_, i) => (
                  <div key={i + 1} className="line-number">{i + 1}</div>
                ))}
              </div>
              <textarea
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Paste your ${LANGUAGES.find(l => l.id === language)?.name || 'code'} here...\n\n// Or click 'Sample' to load example code`}
                spellCheck={false}
              />
            </div>

            <div className="editor-footer">
              <div className="editor-stats">
                <span>{countLines()} lines</span>
                <span className="divider">|</span>
                <span>{countCharacters()} characters</span>
              </div>
              <div className="editor-language">
                {LANGUAGES.find(l => l.id === language)?.name || language}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="analysis-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              className="btn-analyze"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !code.trim()}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Code
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="analysis-footer">
        <p>LogicGuard - AI-Powered Code Analysis</p>
      </footer>
    </div>
  );
}

export default CodeAnalysisPage;
