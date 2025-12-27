import React from 'react';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">LG</div>
          <div className="logo-text">
            <h1>LogicGuard</h1>
            <span>Smart Code Analysis Platform</span>
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
