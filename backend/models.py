"""
LogicGuard Database Models
==========================
SQLAlchemy models for MySQL database
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()


class User(db.Model):
    """User model for storing user information"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    provider_id = db.Column(db.String(255), nullable=False)
    provider = db.Column(db.String(50), nullable=False)  # 'google', 'github', 'email'
    email = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255))
    picture = db.Column(db.String(500))
    password_hash = db.Column(db.String(255), nullable=True)  # For email users only
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        """Hash and set the user's password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """Check if the provided password matches the hash"""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    # Relationships
    projects = db.relationship('Project', backref='user', lazy=True, cascade='all, delete-orphan')
    analyses = db.relationship('AnalysisHistory', backref='user', lazy=True, cascade='all, delete-orphan')
    settings = db.relationship('UserSettings', backref='user', uselist=False, cascade='all, delete-orphan')

    __table_args__ = (
        db.UniqueConstraint('provider', 'provider_id', name='unique_provider_user'),
        db.Index('idx_email', 'email'),
    )

    def to_dict(self):
        """Convert user to dictionary for JSON response"""
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'provider': self.provider,
            'email': self.email,
            'name': self.name,
            'picture': self.picture,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class Project(db.Model):
    """Project model for storing user projects"""
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    language = db.Column(db.String(50), default='python')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analyses = db.relationship('AnalysisHistory', backref='project', lazy=True)

    __table_args__ = (
        db.Index('idx_project_user_id', 'user_id'),
    )

    def to_dict(self):
        """Convert project to dictionary for JSON response"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'language': self.language,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'analysis_count': len(self.analyses) if self.analyses else 0
        }


class AnalysisHistory(db.Model):
    """Analysis history model for storing code analysis results"""
    __tablename__ = 'analysis_history'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='SET NULL'), nullable=True)
    code_snippet = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer)
    summary = db.Column(db.Text)
    bugs = db.Column(db.JSON)
    optimizations = db.Column(db.JSON)
    positives = db.Column(db.JSON)
    metrics = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.Index('idx_analysis_user_id', 'user_id'),
        db.Index('idx_analysis_created_at', 'created_at'),
    )

    def to_dict(self):
        """Convert analysis to dictionary for JSON response"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'code_snippet': self.code_snippet[:100] + '...' if len(self.code_snippet) > 100 else self.code_snippet,
            'language': self.language,
            'score': self.score,
            'summary': self.summary,
            'bugs': self.bugs,
            'optimizations': self.optimizations,
            'positives': self.positives,
            'metrics': self.metrics,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class UserSettings(db.Model):
    """User settings model for storing user preferences"""
    __tablename__ = 'user_settings'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    default_language = db.Column(db.String(50), default='python')
    email_notifications = db.Column(db.Boolean, default=True)
    theme = db.Column(db.String(20), default='light')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert settings to dictionary for JSON response"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'default_language': self.default_language,
            'email_notifications': self.email_notifications,
            'theme': self.theme
        }
