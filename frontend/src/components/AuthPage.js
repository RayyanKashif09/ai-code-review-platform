import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AuthPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AuthPage({ onLogin, onBack }) {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for OAuth error in URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(`Login failed: ${errorParam}`);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isSignUp) {
      // Sign Up validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      // Call register API
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Registration successful, switch to login mode
          setIsSignUp(false);
          setFormData({
            name: '',
            email: formData.email, // Keep the email for convenience
            password: '',
            confirmPassword: ''
          });
          setError(''); // Clear any errors
          alert('Registration successful! Please login with your credentials.');
        } else {
          setError(data.error || 'Registration failed');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
    } else {
      // Sign In validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      // Call login API
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Login successful, call onLogin with user data
          onLogin(data.user);
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
    }

    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError('');
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const handleGitHubLogin = () => {
    setIsLoading(true);
    setError('');
    // Redirect to backend GitHub OAuth endpoint
    window.location.href = `${API_BASE_URL}/api/auth/github`;
  };

  return (
    <div className="auth-page">
      <div className="auth-top-logo" onClick={onBack}>
        <img src="/2.png" alt="LogicGuard Logo" className="auth-top-logo-image" />
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="auth-tabs">
            <button
              className={`auth-tab ${!isSignUp ? 'active' : ''}`}
              onClick={() => !isSignUp || toggleMode()}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${isSignUp ? 'active' : ''}`}
              onClick={() => isSignUp || toggleMode()}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="auth-subtitle">
              {isSignUp
                ? 'Sign up to start analyzing your code'
                : 'Sign in to continue to LogicGuard'}
            </p>

            {error && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {!isSignUp && (
              <div className="forgot-password">
                <a href="#forgot">Forgot Password?</a>
              </div>
            )}

            <motion.button
              type="submit"
              className="auth-submit-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              {!isLoading && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </motion.button>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="social-buttons">
              <button
                type="button"
                className="social-btn google"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Loading...' : 'Google'}
              </button>
              <button
                type="button"
                className="social-btn github"
                onClick={handleGitHubLogin}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {isLoading ? 'Loading...' : 'GitHub'}
              </button>
            </div>
          </form>
        </motion.div>

        <p className="auth-footer">
          {isSignUp
            ? 'Already have an account? '
            : "Don't have an account? "}
          <button onClick={toggleMode} className="toggle-link">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default AuthPage;
