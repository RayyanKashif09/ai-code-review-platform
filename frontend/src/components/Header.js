import React from 'react';

function Header({ user }) {
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
        <div className="header-right">
          <div className="header-status">
            <span className="status-dot"></span>
            <span>Ready</span>
          </div>
          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.name || user.email}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
