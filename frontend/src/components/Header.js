import React from 'react';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">AI</div>
          <div className="logo-text">
            <h1>AI Code Review</h1>
            <span>Smart Analysis Platform</span>
          </div>
        </div>
        <div className="header-status">
          <span className="status-dot"></span>
          <span>Ready</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
