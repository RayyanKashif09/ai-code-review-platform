/**
 * AI Smart Code Review Platform
 * Main Application Component
 *
 * This component orchestrates the entire application, managing:
 * - Code input and language selection
 * - API calls to the backend
 * - Display of review results
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Components
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import ReviewResults from './components/ReviewResults';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import Notification from './components/Notification';

// Styles
import './styles/App.css';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Sample code for demonstration
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
}`,

  java: `public class Calculator {
    public static int divide(int a, int b) {
        return a / b;
    }

    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;

        for (int i = 0; i <= numbers.length; i++) {
            sum = sum + numbers[i];
        }

        System.out.println("Sum: " + sum);
        System.out.println("Result: " + divide(10, 0));
    }
}`,

  cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int* ptr = new int[10];

    for (int i = 0; i <= 10; i++) {
        ptr[i] = i * 2;
    }

    char* str = "Hello World";
    str[0] = 'h';

    cout << ptr[5] << endl;

    return 0;
}`
};

function App() {
  // State management
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  /**
   * Handle code analysis submission
   * Sends code to backend API for AI review
   */
  const handleAnalyze = useCallback(async () => {
    // Validate input
    if (!code.trim()) {
      setNotification({
        type: 'warning',
        message: 'Please enter some code to analyze'
      });
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
        timeout: 60000, // 60 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setResults(response.data.data);
        setNotification({
          type: 'success',
          message: 'Code analysis complete!'
        });
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze code';
      setError(errorMessage);
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, language]);

  /**
   * Clear all code and results
   */
  const handleClear = useCallback(() => {
    setCode('');
    setResults(null);
    setError(null);
    setNotification({
      type: 'info',
      message: 'Editor cleared'
    });
  }, []);

  /**
   * Load sample code for selected language
   */
  const handleLoadSample = useCallback(() => {
    setCode(SAMPLE_CODE[language] || SAMPLE_CODE.python);
    setResults(null);
    setNotification({
      type: 'info',
      message: `Sample ${language} code loaded`
    });
  }, [language]);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.go', '.rs'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(extension)) {
      setNotification({
        type: 'error',
        message: 'Unsupported file type. Please upload .py, .js, .java, .cpp files'
      });
      return;
    }

    // Map extension to language
    const extensionMap = {
      '.py': 'python',
      '.js': 'javascript',
      '.ts': 'typescript',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.go': 'go',
      '.rs': 'rust'
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
      setLanguage(extensionMap[extension] || 'python');
      setResults(null);
      setNotification({
        type: 'success',
        message: `File "${file.name}" loaded successfully`
      });
    };
    reader.onerror = () => {
      setNotification({
        type: 'error',
        message: 'Failed to read file'
      });
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  }, []);

  /**
   * Download analysis report as JSON
   */
  const handleDownloadReport = useCallback(() => {
    if (!results) return;

    const report = {
      timestamp: new Date().toISOString(),
      language: language,
      analysis: results,
      codeSnippet: code.substring(0, 500) + (code.length > 500 ? '...' : '')
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotification({
      type: 'success',
      message: 'Report downloaded successfully'
    });
  }, [results, language, code]);

  /**
   * Dismiss notification
   */
  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <div className="app">
      {/* Background Effects */}
      <div className="bg-gradient" />
      <div className="bg-grid" />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onDismiss={dismissNotification}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="main-content">
        <div className="split-layout">
          {/* Left Panel - Code Editor */}
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
              onFileUpload={handleFileUpload}
              isAnalyzing={isAnalyzing}
            />
          </motion.section>

          {/* Right Panel - Results */}
          <motion.section
            className="panel panel-results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="panel-header">
              <h2 className="panel-title">
                <span className="title-icon">📊</span>
                Analysis Results
              </h2>
              {results && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleDownloadReport}
                >
                  <span className="btn-icon">📥</span>
                  Download Report
                </button>
              )}
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
                    <div className="error-icon">⚠️</div>
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

      {/* Footer */}
      <footer className="footer">
        <p>AI Smart Code Review Platform • Built with React & Flask • Powered by GPT-4</p>
      </footer>
    </div>
  );
}

export default App;
